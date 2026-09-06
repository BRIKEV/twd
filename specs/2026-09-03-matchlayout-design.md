# matchLayout - Design

Date: 2026-09-03
Status: Draft (validado con un spike ejecutable, pendiente de implementar)
Affected repos: `twd` (twd-js core + sidebar UI), `twd-cli`, plus a Vite plugin

Conclusiones de un spike **ejecutado y validado** contra una landing real, no una
propuesta teorica. Este documento es el handoff: que construir, por que asi, y
que ya se descarto.

El codigo throwaway vive en el repo `twd-docs-tutorial`, rama
`feat/visual-testing`:

- `src/pages/Helloworld/visualSnapshot.ts` - captura, rejilla y overlays
- `src/pages/Helloworld/matchLayout.ts` - ciclo de snapshot contra disco
- `src/pages/Helloworld/rowDiff.ts` - diff de filas por LCS
- `vite-plugin-twd-snapshot.ts` - escritura a disco en dev
- `src/pages/Landing/Landing.tsx` - banco de pruebas con tres variantes

Las cinco iteraciones estan en commits separados de esa rama, por si hace falta
volver a comparar. El anexo (§12) recoge el recorrido y los numeros.
## 1. Qué es y qué no es

`matchLayout` vigila **la geometría de la página**, no su apariencia.

| Detecta | No detecta |
|---|---|
| Un bloque que crece, encoge o se mueve | Un texto que cambia de valor |
| Una lista que aparece o desaparece | Un color que cambia sutilmente |
| Un contenedor que se desborda o envuelve | Texto blanco sobre blanco |
| Un flex/grid que colapsa | Diferencias de menos de ~36px |

**Esto es deliberado, no una limitación pendiente de arreglar.** El contenido ya
lo cubren las aserciones de DOM que TWD ya tiene:

```ts
twd.should(counter, 'have.text', 'Count is 1');   // contenido
await matchLayout(page, 'checkout');              // geometría
```

Se llamó `matchLayout` y no `matchSnapshot` a propósito: el nombre es la mitad de
la formación. Con `matchSnapshot` la gente espera Percy y reporta como bug que no
vea un texto cambiado.

**Complementa a Playwright/Cypress, no los sustituye**, igual que el resto de TWD.

---

## 2. API

```ts
const result = await matchLayout(element, 'nombre-del-snapshot');
expect(result.status, result.message).to.not.equal('failed');
```

- `status`: `'written'` (primera vez, no había referencia) · `'passed'` · `'failed'`
- `message`: mensaje ya formateado, listo para el segundo argumento de chai.
  Vacío si no ha fallado.

Se descartó lanzar un error propio: con `expect` de chai el fallo se integra con
el resto de aserciones de TWD y el mensaje se ve igual en el sidebar y en CI.

### Mensaje de fallo

```
Layout snapshot "helloworld" cambió - el bloque cambió de tamaño

  esperado  00dd000020000018   577x512
  obtenido  0018000000000000   577x532

  X = cambio    ~ = fila nueva    # = ocupada    . = vacía
  . . . . . . . .
  # # . # # # . #
  . . . X X . . .

  Referencia:  __twd_snapshots__/helloworld.snap
  Captura:     __twd_snapshots__/helloworld.failed.png

  Revisar:  npx twd-cli --snapshot "helloworld"
  Aceptar:  npx twd-cli --snapshot "helloworld" --update-snapshots
```

El preview va **dentro del mensaje** para que se lea igual en los logs de CI que
en el sidebar, sin abrir ningún fichero.

---

## 3. Algoritmo de captura

```
nodo DOM
  -> clone con estilos computados inline
  -> <svg><foreignObject>
  -> data: URI
  -> <img>
  -> canvas.drawImage
  -> rejilla anclada -> bits -> hash
```

Sin dependencias externas. `html2canvas` **no hace falta**: `foreignObject`
renderiza bien, incluidas las webfonts (verificado sobre Tailwind v4 + shadcn).

### Las tres trampas — cada una costó un intento fallido

**1. La rejilla tiene que estar anclada, no ser NxN.**

Una rejilla fija relativa al tamaño se estira cuando el bloque crece, y entonces
cada celda muestrea una franja distinta de la página. Resultado real: las cajas
rojas caían sobre el título y el botón (que no habían cambiado) y no sobre el
texto añadido.

```ts
const cell = canvas.width / COLS;           // celda CUADRADA
const exactRows = canvas.height / cell;     // fraccionario, NO redondear
const rows = Math.ceil(exactRows);
ctx.drawImage(canvas, 0, 0, COLS, exactRows);
```

Redondear `exactRows` en el destino del `drawImage` comprime la imagen al número
entero de filas y vuelve a desalinear todo. Con la altura fraccionaria, la fila 1
cubre `y=72..144` de la página tanto a 512px como a 532px de alto.

Depende de que el **ancho** sea estable. Lo es: los snapshots se capturan en
`twd-cli` con el viewport fijado por Puppeteer.

**2. Hay que pintar el fondo antes del `drawImage`.**

El canvas queda transparente donde el nodo no pinta fondo propio, y el
transparente se lee como negro. Sin esto, 44 de 64 celdas salían a 0 y el hash
veía texto flotando en negro en vez de la página.

```ts
ctx.fillStyle = resolveBackground(el);  // primer ancestro con bg opaco
ctx.fillRect(0, 0, w, h);
ctx.drawImage(img, 0, 0);
```

**3. El preview tiene que dibujar bits, no grises.**

Con un ramp de grises absoluto (0-255) y un umbral relativo a la media, el
preview y el veredicto no coinciden: hay filas con bits activos que se dibujan
vacías. Dibujando bits, el preview *es* lo que decide el fallo, y `git diff` del
`.snap` se convierte en el diff visual.

---

## 4. Detección en tres niveles

| Señal | Detecta | Precisión |
|---|---|---|
| **ancho** | la rejilla ya no es comparable | exacta, y *invalida* el diff por celdas |
| `size` (alto) | el bloque creció o encogió | exacta |
| bits de la rejilla | reordenaciones internas a ancho constante | aproximada (celda ~36px) |

### El ancho es especial: es el eje de la rejilla

La celda se deriva del ancho (`ancho/COLS`), así que **si el ancho cambia, ninguna
celda se corresponde con la de la referencia** y el diff no significa nada.

Medido: al quitar el `<h1>` de la página, el bloque `max-w-2xl` se encogió al
contenido — 577→344 de ancho. La celda pasó de 36,1px a 21,5px y se marcó casi
toda la página. Peor: el bloque encogió de 512 a 376 de alto pero pasó de 15 a 18
filas, así que la parte de abajo salió como *"filas nuevas"* en un bloque más
pequeño.

Ahí el resultado *parecía* correcto porque había cambiado todo de verdad. El caso
peligroso es el contrario: **una scrollbar que aparece y mueve el ancho 15px**
marcaría la página entera habiendo cambiado un solo elemento.

**Decisión de producto: se pintan las celdas igualmente.** Se probó a no marcar
nada cuando cambia el ancho y el resultado es peor para el usuario: una captura
limpia no comunica que algo grave ha pasado. Marcarlo casi todo transmite
"esto se ha movido entero", que a nivel de layout es el mensaje correcto.

Encima de las celdas se dibujan los dos contornos —  **rojo discontinuo** el
tamaño esperado, **naranja continuo** el actual — con sus dimensiones. Eso da el
"cuánto y por dónde" que las celdas por sí solas no dan.

El mensaje avisa de que, con el ancho cambiado, las celdas son **orientativas**.
El caso a vigilar es el contrario al probado: una scrollbar que mueve el ancho
15px marcaría la página entera habiendo cambiado un solo elemento. Si eso aparece
en uso real, la salida es tolerar variaciones pequeñas de ancho, no quitar el
overlay.

**El cambio de tamaño es un fallo por sí solo**, aunque ningún bit se mueva. Se
llegó a esto porque una línea de texto de 20px cabe entera dentro de una celda y
no mueve su promedio: con solo bits, añadir una nota daba distancia `0`.

`COLS = 16` (celda de ~36px con un viewport típico). Subirlo da más resolución a
cambio de un `.snap` más grande; sigue siendo texto.

---

## 5. Formato `.snap`

```
hash 00dd000020000018
size 577x512
rows 15
cols 16
grid 000b0a0a0b000a007473007373760076...

# preview (# = ocupada, . = vacía)
# . . . . . . . .
# # # . # # # . #
```

- `hash` decide el veredicto
- `size` es la señal exacta
- `grid` son los grises, necesarios para reconstruir los bits y localizar el cambio
- el preview ASCII hace el fichero **revisable en un PR** sin abrir imágenes

**Solo se commitea el `.snap`.** Los `.png` van en `.gitignore`.

Razón: el PNG de referencia no sobrevive a un checkout limpio, así que en CI
nunca existiría. El preview del fallo se construye con los bits sobre la captura
actual — no necesita la imagen anterior.

Consecuencia asumida: nunca se podrá enseñar un "antes" real píxel a píxel. Para
layout no hace falta; al dev le sirve más su página actual con las zonas rotas
marcadas.

---

## 6. Ciclo de vida

| Situación | Comportamiento |
|---|---|
| No hay `.snap` | Se escribe y **pasa** (como jest) |
| Hay `.snap` y coincide | Pasa. No se escribe nada |
| Hay `.snap` y difiere | **Falla**. No se toca la referencia. Se escribe `<name>.failed.png` con las celdas marcadas |
| `--update-snapshots` | Se reescribe el `.snap`. Status `'updated'`, **no** `'passed'` |
| **CI sin referencia** | **Falla.** Nunca crear baselines automáticamente |

### Cómo llega la orden de actualizar al navegador

`twd-cli --update-snapshots` ejecuta en Chromium, así que inyecta una flag antes
de que cargue nada:

```js
await page.evaluateOnNewDocument(() => {
  window.__TWD_UPDATE_SNAPSHOTS__ = true;
});
```

**`evaluateOnNewDocument`, no `evaluate`**: se ejecuta antes de cualquier script
de la página, así que la flag ya está puesta cuando corre `matchLayout`.

### Quién escribe el fichero

Hoy: **plugin de Vite** (`GET` devuelve la referencia, `POST` escribe). Funciona.

*Abierto, no decidido:* si twd-cli acaba corriendo contra un build estático no
habrá plugin. Una opción sería `page.exposeFunction()` para inyectar una función
de Node y escribir sin HTTP, con `matchLayout` probando primero
`window.__twdWriteSnapshot` y cayendo al `fetch`. **No hace falta mientras el
plugin cubra el caso** — anotado por si aparece.

### Dos flags, no una (para producto)

| Flag | Efecto |
|---|---|
| `--update-snapshots` | Reescribe referencias **existentes** |
| `--ci` | Prohíbe **crear** referencias nuevas: si falta el `.snap`, falla |

Son agujeros distintos. Sin `--ci`, un test nuevo crea su referencia y pasa —
para siempre, sin que nadie se entere. Jest separa estas dos por este motivo.

**Actualizar no puede ser silencioso.** Si la flag se queda puesta por error, se
reescriben todos los snapshots y ningún test vuelve a fallar; es el fallo más
caro porque no hace ruido. Status `'updated'` distinto de `'passed'`, y contarlo
en el resumen final (*"3 snapshots updated"*).

Ese último es la trampa clásica: si CI crea la referencia cuando falta, el test
no falla jamás y nadie se entera durante meses. Jest lo resuelve con `--ci`.

### `<name>.failed.png`

De arriba abajo: cinta con `expected WxH -> actual WxH` (solo si el tamaño
cambió), la captura con las celdas marcadas, y una **leyenda** con el
significado de cada color.

| Color | Significado |
|---|---|
| Rojo | El bit de la celda cambió: de ocupada a vacía o al revés |
| Naranja | Zona nueva: filas que no existían en la referencia |

**El naranja solo se pinta a ancho constante.** Si el ancho cambia, la celda
cambia de tamaño y un bloque que *encoge* puede ganar filas — marcarlas como
"zona nueva" contradice lo que el usuario acaba de ver. En ese caso todo se marca
como cambio y el naranja desaparece también de la leyenda.

Todo el texto de la imagen, del mensaje y del `.snap` va en **inglés**.

---

## 7. DevX: el snapshot es de twd-cli, no de dev mode

**El riesgo principal del producto no es técnico, es de confianza.** Si un dev ve
fallar un snapshot por haber redimensionado la ventana, deja de fiarse de la
herramienta y la desactiva. Un visual test flaky es peor que no tenerlo.

En dev mode el viewport es el de la ventana del dev: arbitrario, distinto entre
compañeros, y cambia al redimensionar. La referencia se crearía con ese tamaño y
fallaría para todos los demás.

### Regla: el veredicto vive en twd-cli

El `.snap` guarda **el viewport con el que se creó**. En dev, si no coincide,
`matchLayout` **no falla: se omite**.

```
Layout snapshot "home" skipped - viewport mismatch
  reference 1280x800  ·  current 1512x945
  Run `npx twd-cli` to validate layout snapshots.
```

- Cero flaky **por construcción**: nunca falla con un viewport distinto.
- El dev entiende por qué se omitió, en vez de ver un fallo inexplicable.
- Con el viewport coincidente sigue habiendo feedback inmediato en el sidebar,
  que es la propuesta de valor de TWD.
- En twd-cli el viewport lo fija Puppeteer, así que siempre coincide.

Requiere un cuarto estado, `'skipped'`, que el runner ya contempla. La aserción
del test no cambia: `expect(r.status, r.message).to.not.equal('failed')`.

### Relación con el responsive testing

`matchLayout` necesita un viewport fijo y determinista. La propuesta de tests
responsive (declarar `minWidth`/`maxWidth` por test) es exactamente eso: **una
forma de que un test declare su viewport**.

Un `matchLayout` por breakpoint es mucho más útil que uno solo a ancho de
escritorio, que es justo donde menos se rompe el layout. Si las dos features
avanzan, la resolución declarada en el test debería ser la que fija el viewport
del snapshot.

Lo que **no** resuelve el problema del viewport en dev: renderizar la app en un
iframe. Ver §11.

### Lo que hay que explicarle al usuario

Que `matchLayout` **solo dictamina en twd-cli** tiene que estar en el primer
párrafo de la documentación, no en una nota al pie. Es la diferencia entre una
herramienta en la que se confía y una que se desactiva la primera semana.

---

## 8. Reparto por paquetes

| Pieza | Dónde |
|---|---|
| `captureNode`, rejilla, hash, overlay | `twd-js` |
| `matchLayout` (API pública) | `twd-js` |
| Escritura a disco en dev | **plugin de Vite propio**, no `twd-relay` |
| Captura en CI + `--update-snapshots` | `twd-cli` |
| Preview del fallo | sidebar de `twd-js` |

`twd-relay` se descartó: no está adaptado a este caso. El dev server ya tiene el
filesystem delante, un plugin de Vite con un middleware es suficiente
(`GET` devuelve la referencia, `POST` escribe).

### Cambio necesario en `twd-js`

Para que el mensaje de error nombre el test solo, el runner tiene que **exponer
el test en ejecución**. Hoy el `handlers` que exporta `twd-js/runner` no marca
`status: 'running'` — eso vive en el bundle del sidebar. Sin eso hay que pasar el
nombre a mano, que es duplicación.

---

## 9. El desplazamiento vertical es el techo del enfoque

Validado ejecutando contra una landing real (1120x2451) con twd-relay.

### Comparar por posicion no funciona

Si una seccion de arriba cambia de alto, **todo lo de abajo se desplaza** y una
comparacion celda-contra-celda marca la pagina entera. Medido: la landing paso
de 2451 a 2617 de alto y el overlay salio con cajas dispersas por todas partes,
ninguna sobre los cambios reales. Ruido, no senal.

**Arreglo: diff de secuencias por filas (LCS con tolerancia), como `git diff`.**
Cada fila de la rejilla es una "linea"; una fila que solo se ha movido se
empareja y no se marca. El ruido desaparecio de golpe.

### Iteraciones sobre el criterio del bit

| Criterio | Resultado |
|---|---|
| Brillo > media global | **Satura.** Sobre fondo blanco casi toda celda queda a 1, el hash sale `ffffff...` y los cambios en zonas claras son invisibles |
| Desviacion tipica por celda | **Hipersensible.** Un texto que se mueve 3px cambia la densidad; ruido en toda la pagina |
| Distancia media al color de fondo | **Punto medio.** No satura y aguanta desplazamientos pequenos. Es el que queda |

### Regla: con cambio de alto, marcar solo la primera divergencia

Ninguna de las iteraciones elimina el ruido cuando la altura cambia — es
inherente al desplazamiento. Pero el cambio de alto **ya lo detecta `size`**,
asi que el overlay no tiene que decir *cuanto*, solo *donde empieza*.

Marcando unicamente el primer bloque divergente, el caso B pasa de 40 cajas
dispersas a una sola banda sobre el hero, que es exactamente donde se introdujo
el cambio.

### Sin cambio de alto funciona limpio

Variante C (solo reordena, la pagina mide lo mismo): detectado **solo por la
rejilla**, sin ayuda de `size`, y el overlay marca con precision el CTA movido,
las seis tarjetas reordenadas y la seccion invertida. **Cero ruido** en stats,
titulo, testimonios y CTA.

Un detalle que confirma el diseno: el footer con las columnas invertidas **no**
se marca. Ocupan la misma geometria y solo cambia el texto de dentro — eso es
contenido, y lo cubre `twd.should`.

### Lo que queda como techo real

Un cambio de alto arriba impide localizar cambios finos mas abajo: se sabe que
la pagina diverge y donde empieza, no todo lo que cambio despues. Superarlo
pide cambiar de enfoque — segmentar por bandas de contenido (perfil de
proyeccion) en vez de rejilla fija — y eso ya no es una iteracion.

## 10. Pendiente de validar

**El caso que puede tumbar el enfoque:** romper el layout **sin** cambiar el
tamaño exterior — un flex que colapsa dentro de una caja de altura fija. Todo lo
validado hasta ahora cambiaba las dimensiones, así que la señal exacta (`size`)
hacía el trabajo. Este caso depende solo de la señal aproximada.

Si no se detecta con fiabilidad, `matchLayout` es un detector de cambios de
tamaño con extras, no un guardián general de layout — y eso hay que decirlo en
la documentación, no descubrirlo el usuario.

Otros abiertos:

- Umbral configurable (`{ tolerance }`) para permitir N celdas de diferencia
- Botón de update en el sidebar
- Elementos con scroll interno: solo se captura lo visible

---

## 11. Descartado, y por qué

| Opción | Motivo |
|---|---|
| `pixelmatch` para el veredicto | Da ruido de antialiasing justo en lo que queremos ignorar |
| `blockhash-js` / `imghash` | No aporta sobre ~15 líneas de average hash |
| `html2canvas` | `foreignObject` renderiza bien, fuentes incluidas |
| Commitear el PNG de referencia | No sobrevive a un checkout limpio; era el objetivo evitarlo |
| `twd-relay` para escribir a disco | No está adaptado; un plugin de Vite es más simple |
| Lanzar un error propio | `expect` de chai integra mejor con el resto de TWD |
| Rejilla NxN relativa | Se desalinea al cambiar el tamaño (ver §3) |
| Comparación posicional celda a celda | Un cambio de alto arriba desplaza la página y lo marca todo (ver §9) |
| Umbral por brillo medio | Satura sobre fondo blanco: el hash sale `ffffff...` (ver §9) |
| Desviación típica por celda | Hipersensible al desplazamiento subpíxel (ver §9) |
| **Renderizar la app en un iframe** | **Probado y descartado: saca al dev de su flujo de desarrollo.** Eso no es TWD |

`pixelmatch` conserva un hueco posible: generar el preview del fallo. Nunca el
veredicto.


---

## 12. Anexo: recorrido del spike

Cómo se llegó a todo lo anterior, con los números medidos.

Estado: **spike cerrado en la parte de captura**, abierto en la parte de producto.
Todo el código bajo `src/pages/Helloworld/visualSnapshot.ts` es throwaway.

### La idea

`matchSnapshot` ejecutado dentro del navegador, en el runtime real, sin SaaS ni
contenedores. Captura el nodo DOM a pixels y compara contra una referencia.

### Qué se probó y qué salió

Pipeline: `DOM -> clone con estilos computados inline -> <svg><foreignObject> ->
data: URI -> <img> -> canvas.drawImage -> ImageData -> hash 64 bits`.

### 1. La captura funciona

Sin dependencias externas. Medido sobre el bloque de Helloworld:

| | |
|---|---|
| `cssSize` | 577x512 |
| `imgSize` | 577x512 (el SVG se rasterizó bien) |
| `opaquePixels` | 7986 de 8000 en el botón |
| `distinctColors` | 100+ |

**`html2canvas` no hace falta.** `foreignObject` fue suficiente.

### 2. El hash detecta layout, no contenido

Experimento de separación sobre el mismo nodo (textarea + boton "Add note"):

| Medida | Distancia (de 64 bits) |
|---|---|
| Ruido (misma captura x2) | **0** |
| Contenido (escribir en el textarea) | **0** |
| Layout (anadir una nota, el bloque crece) | **16** |

Suelo de ruido limpio y separacion amplia. Antes de esto se probo con el contador
(`Count is 0` -> `Count is 1`): distancia 0; y `1` -> `11`: distancia 1.

### 3. Por que el contenido da 0

`averageHash` reduce a una rejilla 8x8 y guarda **1 bit por celda**: "esta por
encima de la media?". Un cambio de texto mueve el brillo de la celda pero no la
cruza el umbral. La informacion existe en los grises, se tira en la cuantizacion.

Eso resulto ser **la feature, no el bug**: el contenido ya lo cubre `twd.should`.
Lo que las aserciones de DOM no ven es la geometria.

### Limitaciones conocidas de la captura

- ~~Las webfonts no cargan dentro de un SVG-como-imagen.~~ **Descartado**: verificado
  en el PNG generado, la fuente se ve correcta. No hace falta inlinear fuentes.
- Imagenes y `background-image` con URL externa no cargan.
- Los pseudo-elementos `::before` / `::after` no se clonan.
- `cloneNode` copia atributos y nodos hijo, no propiedades del DOM. Para estado de
  formularios esto es un riesgo teorico; para un hash de layout es irrelevante.

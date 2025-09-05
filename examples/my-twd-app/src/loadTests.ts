// Esto importa automáticamente todos los archivos que terminen en .test.ts
const modules = import.meta.glob("./*.test.ts", { eager: true });

// No necesitas exportar nada, el simple hecho de importarlo en App.tsx
// hará que los test files se ejecuten y registren sus tests.
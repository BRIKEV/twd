import "./Assertions.css";

const assertions = [
  {
    name: "have.text",
    element: <div id="have-text">Hello</div>,
    code: `api.should("have.text", "Hello");`,
  },
  {
    name: "contain.text",
    element: <div id="contain-text">Hello world</div>,
    code: `api.should("contain.text", "world");`,
  },
  {
    name: "be.empty",
    element: <div id="be-empty"></div>,
    code: `api.should("be.empty");`,
  },
  {
    name: "have.attr",
    element: <input id="have-attr" type="text" placeholder="Type here" />,
    code: `api.should("have.attr", "placeholder", "Type here");`,
  },
  {
    name: "have.value",
    element: <input id="have-value" type="text" value="test value" readOnly />,
    code: `api.should("have.value", "test value");`,
  },
  {
    name: "be.disabled",
    element: <button id="be-disabled" disabled>Disabled</button>,
    code: `api.should("be.disabled");`,
  },
  {
    name: "be.enabled",
    element: <button id="be-enabled">Enabled</button>,
    code: `api.should("be.enabled");`,
  },
  {
    name: "be.checked",
    element: <input id="be-checked" type="checkbox" checked readOnly />,
    code: `api.should("be.checked");`,
  },
  {
    name: "be.selected",
    element: (
      <select defaultValue="two" id="be-selected">
        <option value="one">One</option>
        <option value="two">Two</option>
      </select>
    ),
    code: `api.should("be.selected");`,
  },
  {
    name: "be.focused",
    element: (
      <div>
        <label id="label-focused" htmlFor="be-focused">Focused</label>
        <input type="text" id="be-focused" />
      </div>
    ),
    code: `api.should("be.focused");`,
  },
  {
    name: "be.visible",
    element: <div id="be-visible">Visible</div>,
    code: `api.should("be.visible");`,
  },
  {
    name: "have.class",
    element: <div id="have-class" className="my-class">Classed</div>,
    code: `api.should("have.class", "my-class");`,
  },
];

export default function Assertions() {
  return (
    <div className="tract-container">
      <h1>Assertion Documentation</h1>
      <div className="tract-list">
        {assertions.map((a) => (
          <div className="tract-row" key={a.name}>
            <div className="tract-demo">{a.element}</div>
            <pre className="tract-code">
              <code>{a.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

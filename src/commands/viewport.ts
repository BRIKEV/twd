import { log } from "../utils/log";

const STYLE_ID = "twd-viewport-styles";

let originalStyles: {
  maxWidth: string;
  maxHeight: string;
  minHeight: string;
  overflow: string;
  margin: string;
  boxSizing: string;
  boxShadow: string;
} | null = null;

function saveOriginalStyles() {
  if (originalStyles) return;
  const { style } = document.body;
  originalStyles = {
    maxWidth: style.maxWidth,
    maxHeight: style.maxHeight,
    minHeight: style.minHeight,
    overflow: style.overflow,
    margin: style.margin,
    boxSizing: style.boxSizing,
    boxShadow: style.boxShadow,
  };
}

function injectBadge(width: number, height?: number) {
  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const label = height ? `${width} \u00d7 ${height}` : `${width}`;

  styleEl.textContent = `
#twd-viewport-badge {
  position: fixed;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(37, 99, 235, 0.85);
  color: #fff;
  font-size: 12px;
  font-family: monospace;
  padding: 2px 10px;
  border-radius: 4px;
  z-index: 99998;
  pointer-events: none;
  white-space: nowrap;
}
`;

  let badge = document.getElementById("twd-viewport-badge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "twd-viewport-badge";
    document.body.appendChild(badge);
  }
  badge.textContent = label;
}

function removeBadge() {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById("twd-viewport-badge")?.remove();
}

export function viewport(width?: number, height?: number): void {
  if (width === undefined) {
    resetViewport();
    return;
  }

  saveOriginalStyles();

  const { style } = document.body;
  style.maxWidth = `${width}px`;
  style.margin = "0 auto";
  style.overflow = "auto";
  style.boxSizing = "border-box";
  style.boxShadow = "0 0 0 1px rgba(37, 99, 235, 0.4)";

  if (height !== undefined) {
    style.minHeight = `${height}px`;
    style.maxHeight = `${height}px`;
  } else {
    style.minHeight = originalStyles!.minHeight;
    style.maxHeight = originalStyles!.maxHeight;
  }

  injectBadge(width, height);
  log(`viewport(${width}${height !== undefined ? `, ${height}` : ""})`);
}

export function resetViewport(): void {
  if (!originalStyles) return;

  const { style } = document.body;
  style.maxWidth = originalStyles.maxWidth;
  style.maxHeight = originalStyles.maxHeight;
  style.minHeight = originalStyles.minHeight;
  style.overflow = originalStyles.overflow;
  style.margin = originalStyles.margin;
  style.boxSizing = originalStyles.boxSizing;
  style.boxShadow = originalStyles.boxShadow;

  originalStyles = null;
  removeBadge();
  log("resetViewport()");
}

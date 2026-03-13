import { useRef } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative", marginBottom: "var(--twd-spacing-md)" }}>
      <input
        ref={inputRef}
        type="search"
        aria-label="Filter tests"
        placeholder="Filter tests..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "var(--twd-spacing-xs) var(--twd-spacing-md)",
          paddingRight: value ? "28px" : "var(--twd-spacing-md)",
          background: "var(--twd-background)",
          color: "var(--twd-text)",
          border: "1px solid var(--twd-border)",
          borderRadius: "var(--twd-border-radius)",
          fontSize: "var(--twd-font-size-sm)",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
      {value && (
        <button
          aria-label="Clear search filter"
          onClick={handleClear}
          style={{
            position: "absolute",
            right: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--twd-text-secondary)",
            fontSize: "var(--twd-font-size-sm)",
            padding: "2px 4px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

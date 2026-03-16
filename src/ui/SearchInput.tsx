interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div style={{ position: "relative", marginBottom: "var(--twd-spacing-md)" }}>
      <input
        type="search"
        id="twd-search-input"
        aria-label="Filter tests"
        placeholder="Filter tests..."
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        style={{
          width: "100%",
          padding: "var(--twd-spacing-md)",
          background: "var(--twd-background)",
          color: "var(--twd-text)",
          border: "1px solid var(--twd-border)",
          borderRadius: "var(--twd-border-radius)",
          fontSize: "var(--twd-font-size-md)",
          boxSizing: "border-box",
          outline: "none",
        }}
      />
    </div>
  );
};

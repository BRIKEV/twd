interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="twd-search-wrapper">
      <input
        type="search"
        id="twd-search-input"
        aria-label="Filter tests"
        placeholder="Filter tests..."
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        className="twd-search-input"
      />
    </div>
  );
};

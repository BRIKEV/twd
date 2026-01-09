
interface SkipOnlyNameProps {
  id: string;
  name: string;
  skip?: boolean;
  only?: boolean;
}

const SkipOnlyName = ({ id, name, skip, only }: SkipOnlyNameProps) => {
  return (
    <>
      {name}{" "}
      {only && (
        <span
          style={{ color: "var(--twd-primary)" }}
          data-testid={`only-indicator-${id}`}
        >
          {" "}
          (only)
        </span>
      )}
      {skip && (
        <span
          style={{ color: "var(--twd-text-secondary)" }}
          data-testid={`skip-indicator-${id}`}
        >
          {" "}
          (skipped)
        </span>
      )}
    </>
  )
};

export default SkipOnlyName;

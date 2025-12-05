
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
          style={{ color: "#2563eb" }}
          data-testid={`only-indicator-${id}`}
        >
          {" "}
          (only)
        </span>
      )}
      {skip && (
        <span
          style={{ color: "#6b7280" }}
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

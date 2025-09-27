interface BaseIconProps {
  className: string;
  children: React.ReactNode;
  dataTestId: string;
}

const BaseIcon = ({ className, children, dataTestId }: BaseIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide ${className}`}
    data-testid={dataTestId}
  >
    {children}
  </svg>
);

export default BaseIcon;

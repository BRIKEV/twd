interface ClosedSidebarProps {
  setOpen: (open: boolean) => void;
  position: "left" | "right";
}

const positionStyles = {
  left: {
    left: 0,
    borderTopRightRadius: "var(--twd-border-radius-lg)",
    borderBottomRightRadius: "var(--twd-border-radius-lg)",
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
  },
  right: {
    right: 0,
    borderTopLeftRadius: "var(--twd-border-radius-lg)",
    borderBottomLeftRadius: "var(--twd-border-radius-lg)",
    borderTopRightRadius: "0",
    borderBottomRightRadius: "0",
  },
};

export const ClosedSidebar = ({ setOpen, position }: ClosedSidebarProps) => {
  return (
    <button
      aria-label="Open TWD sidebar"
      style={{
        position: "fixed",
        top: "50%",
        transform: "translateY(-50%)",
        background: "var(--twd-button-primary)",
        color: "var(--twd-button-primary-text)",
        padding: "var(--twd-spacing-sm) 10px",
        cursor: "pointer",
        fontSize: "var(--twd-font-size-sm)",
        ...positionStyles[position]
      }}
      onClick={() => setOpen(true)}
    >
      TWD
    </button>
  );
};

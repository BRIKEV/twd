interface ClosedSidebarProps {
  setOpen: (open: boolean) => void;
  position: "left" | "right";
}

const positionStyles = {
  left: {
    left: 0,
    borderTopRightRadius: "6px",
    borderBottomRightRadius: "6px",
    borderTopLeftRadius: "0",
    borderBottomLeftRadius: "0",
  },
  right: {
    right: 0,
    borderTopLeftRadius: "6px",
    borderBottomLeftRadius: "6px",
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
        background: "#3b82f6",
        color: "white",
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: "12px",
        ...positionStyles[position]
      }}
      onClick={() => setOpen(true)}
    >
      TWD
    </button>
  );
};

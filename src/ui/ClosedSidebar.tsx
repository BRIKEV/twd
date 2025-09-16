interface ClosedSidebarProps {
  setOpen: (open: boolean) => void;
}

export const ClosedSidebar = ({ setOpen }: ClosedSidebarProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: 0,
        transform: "translateY(-50%)",
        background: "#3b82f6",
        color: "white",
        padding: "6px 10px",
        borderTopRightRadius: "6px",
        borderBottomRightRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
      }}
      onClick={() => setOpen(true)}
    >
      TWD
    </div>
  );
};

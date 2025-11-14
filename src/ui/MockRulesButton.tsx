import { twd } from "../";
import MockRequestIcon from "./Icons/MockRequestIcon";

export const MockRulesButton = () => {
  const rules = twd.getRequestMockRules();
  const triggeredRules = rules.filter(rule => rule.executed);
  
  const handleShowRules = () => {
    console.group('🌐 TWD Mock Rules');
    console.log('Total rules:', rules.length);
    console.log('Triggered rules:', triggeredRules.length);
    console.log('Rules details:');
    console.log(rules);
    console.groupEnd();
  };

  return (
    <button
      onClick={handleShowRules}
      aria-label="View mock rules details in console"
      style={{
        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "12px",
        color: "#475569",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s ease",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <MockRequestIcon />
      <span style={{ flex: 1 }}>
        Rules: {triggeredRules.length}/{rules.length} triggered
      </span>
      <span style={{ 
        fontSize: "10px", 
        color: "#1E293B",
        fontWeight: "500"
      }}>
        View rules in console
      </span>
    </button>
  );
};

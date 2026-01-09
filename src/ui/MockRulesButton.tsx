import { getRequestMockRules } from "../commands/mockBridge";
import MockRequestIcon from "./Icons/MockRequestIcon";

export const MockRulesButton = () => {
  const rules = getRequestMockRules();
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
        background: "var(--twd-button-secondary)",
        border: "1px solid var(--twd-button-border)",
        borderRadius: "var(--twd-border-radius-lg)",
        padding: "var(--twd-spacing-md) var(--twd-spacing-lg)",
        cursor: "pointer",
        fontSize: "var(--twd-font-size-sm)",
        color: "var(--twd-button-secondary-text)",
        display: "flex",
        alignItems: "center",
        gap: "var(--twd-spacing-md)",
        marginBottom: "10px",
        width: "100%",
        textAlign: "left",
        transition: `all var(--twd-animation-duration) ease`,
        boxShadow: "var(--twd-shadow-sm)",
      }}
    >
      <MockRequestIcon />
      <span style={{ flex: 1 }}>
        Rules: {triggeredRules.length}/{rules.length} triggered
      </span>
      <span style={{ 
        fontSize: "var(--twd-font-size-xs)", 
        color: "var(--twd-text)",
        fontWeight: "var(--twd-font-weight-medium)"
      }}>
        View rules in console
      </span>
    </button>
  );
};

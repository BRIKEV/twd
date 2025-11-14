
// Add a spinning animation via inline style or CSS class
const spinStyle: React.CSSProperties = {
  animation: 'spin 1s linear infinite',
};

const Loader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#364153"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-loader-circle-icon lucide-loader-circle"
    style={spinStyle}
    data-testid="loader-icon"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

// Add keyframes for spin animation
const styleSheet = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleSheet && !document.getElementById('loader-spin-keyframes')) {
  styleSheet.id = 'loader-spin-keyframes';
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Loader;

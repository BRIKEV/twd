/**
 * TWD Theme Configuration
 * 
 * This file defines CSS variables that can be customized by users
 * to personalize their TWD UI experience.
 * 
 * Users can override these variables by setting them in their CSS:
 * 
 * ```css
 * :root {
 *   --twd-primary: #2563eb;
 *   --twd-background: #1e293b;
 *    ... other variables 
 * }
 *
 */

export interface TWDTheme {
  // Colors
  primary: string;
  background: string;
  backgroundSecondary: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Describe blocks
  describeBg: string;
  describeText: string;
  describeBorder: string;
  
  // Status colors
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  skip: string;
  skipBg: string;
  
  // Interactive elements
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  buttonBorder: string;
  
  // Spacing
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  
  // Typography
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  
  // Layout
  sidebarWidth: string;
  borderRadius: string;
  borderRadiusLg: string;
  
  // Effects
  shadow: string;
  shadowSm: string;
  
  // Z-index
  zIndexSidebar: string;
  zIndexSticky: string;
  
  // Animation
  animationDuration: string;
  
  // Icon colors
  iconColor: string;
  iconColorSecondary: string;
}

export const defaultTheme: TWDTheme = {
  // Colors
  primary: '#2563eb', // Darker blue for AA contrast with white text (4.5:1)
  background: '#1e293b',
  backgroundSecondary: '#182130', // Darker background for AA contrast with error text (4.5:1)
  border: '#475569',
  borderLight: '#64748b',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  
  // Describe blocks
  describeBg: '#0f172a',
  describeText: '#94a3b8',
  describeBorder: '#334155',
  
  // Status colors
  success: '#22c55e',
  successBg: '#14532d',
  error: '#ff5252', // Strong red for AA contrast on darker backgroundSecondary (4.5:1)
  errorBg: '#7f1d1d',
  warning: '#fbbf24',
  warningBg: '#78350f',
  skip: '#475569',
  skipBg: '#334155',
  
  // Interactive elements
  buttonPrimary: '#2563eb', // Darker blue for AA contrast with white text (4.5:1)
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#f1f5f9',
  buttonBorder: '#475569',
  
  // Spacing
  spacingXs: '4px',
  spacingSm: '6px',
  spacingMd: '8px',
  spacingLg: '12px',
  spacingXl: '14px',
  
  // Typography
  fontSizeXs: '10px',
  fontSizeSm: '12px',
  fontSizeMd: '14px',
  fontSizeLg: '16px',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
  
  // Layout
  sidebarWidth: '320px',
  borderRadius: '8px',
  borderRadiusLg: '6px',
  
  // Effects
  shadow: '2px 0 8px rgba(0,0,0,0.3)',
  shadowSm: '0 2px 4px rgba(0, 0, 0, 0.2)',
  
  // Z-index
  zIndexSidebar: '99999',
  zIndexSticky: '100000',
  
  // Animation
  animationDuration: '0.2s',
  
  // Icon colors
  iconColor: '#f1f5f9',
  iconColorSecondary: '#cbd5e1',
};

/**
 * Converts theme object to CSS variables string
 */
export function themeToCSSVariables(theme: Partial<TWDTheme> = {}): string {
  const mergedTheme = { ...defaultTheme, ...theme };
  
  return Object.entries(mergedTheme)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssVarName = `--twd-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      return `${cssVarName}: ${value};`;
    })
    .join('\n  ');
}

/**
 * Injects theme CSS variables into the document
 * This should be called once when the sidebar is initialized
 */
export function injectTheme(theme?: Partial<TWDTheme>): void {
  const styleId = 'twd-theme-variables';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  const cssVariables = themeToCSSVariables(theme);
  styleElement.textContent = `
    :root {
      ${cssVariables}
    }
  `;
}


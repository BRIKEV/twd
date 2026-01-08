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
 *   --twd-primary-color: #1A6EF4;
 *   --twd-background: #f9fafb;
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
  primary: '#1A6EF4',
  background: '#f9fafb',
  backgroundSecondary: '#f3f4f6',
  border: '#e5e7eb',
  borderLight: '#d1d5db',
  text: '#374151',
  textSecondary: '#6b7280',
  textMuted: '#475569',
  
  // Status colors
  success: '#00c951',
  successBg: '#dcfce7',
  error: '#fb2c36',
  errorBg: '#fee2e2',
  warning: '#fef9c3',
  warningBg: '#fef9c3',
  skip: '#f3f4f6',
  skipBg: '#f3f4f6',
  
  // Interactive elements
  buttonPrimary: '#1A6EF4',
  buttonPrimaryText: '#ffffff',
  buttonSecondary: '#f8fafc',
  buttonSecondaryText: '#475569',
  buttonBorder: '#cbd5e1',
  
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
  sidebarWidth: '280px',
  borderRadius: '4px',
  borderRadiusLg: '6px',
  
  // Effects
  shadow: '2px 0 6px rgba(0,0,0,0.1)',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  
  // Z-index
  zIndexSidebar: '1000',
  zIndexSticky: '1000',
  
  // Animation
  animationDuration: '0.2s',
  
  // Icon colors
  iconColor: '#000000',
  iconColorSecondary: '#364153',
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


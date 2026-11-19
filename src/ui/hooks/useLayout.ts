import { useEffect } from 'react';

interface UseLayoutProps {
  isOpen: boolean;
  position: 'left' | 'right';
  /** Overlay mode: the sidebar sits on top of the page instead of pushing it. */
  overlay?: boolean;
}

const FALLBACK_SIDEBAR_WIDTH = '280px';

/**
 * Below this much room left for the page, the sidebar overlays it. Pushing
 * would squeeze the app while its media queries still see the full window.
 */
export const OVERLAY_MIN_PAGE_WIDTH = 768;

const readSidebarWidth = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--twd-sidebar-width').trim() ||
  FALLBACK_SIDEBAR_WIDTH;

export const getSidebarWidthPx = () => {
  const value = readSidebarWidth();
  const px = value.endsWith('px') ? parseFloat(value) : NaN;
  return Number.isFinite(px) ? px : parseFloat(FALLBACK_SIDEBAR_WIDTH);
};

export const shouldOverlay = (windowWidth: number) =>
  windowWidth - getSidebarWidthPx() < OVERLAY_MIN_PAGE_WIDTH;

export const useLayout = ({ isOpen, position, overlay = false }: UseLayoutProps) => {
  useEffect(() => {
    // Push mode makes room with a margin on <html>. Overlay mode leaves the page alone.
    const html = document.documentElement;
    const sidebarWidth = readSidebarWidth();
    html.style.marginRight = '0';
    html.style.marginLeft = '0';
    if (isOpen && !overlay) {
      if (position === 'left') {
        html.style.marginLeft = sidebarWidth;
      } else {
        html.style.marginRight = sidebarWidth;
      }
    }
    return () => {
      html.style.marginRight = '0';
      html.style.marginLeft = '0';
    };
  }, [isOpen, position, overlay]);
};

import { useEffect } from "react";

interface UseLayoutProps {
  isOpen: boolean;
  position: "left" | "right";
}

export const useLayout = ({ isOpen, position }: UseLayoutProps) => {
  useEffect(() => {
    // based on isOpen add html tag margin and based on position
    const html = document.documentElement;
    const sidebarWidth = getComputedStyle(document.documentElement).getPropertyValue('--twd-sidebar-width') || '280px';
    if (isOpen) {
      if (position === "left") {
        html.style.marginLeft = sidebarWidth;
      } else {
        html.style.marginRight = sidebarWidth;
      }
    } else {
      html.style.marginRight = "0";
      html.style.marginLeft = "0";
    }
    return () => {
      html.style.marginRight = "0";
      html.style.marginLeft = "0";
    };
  }, [isOpen, position]);
};
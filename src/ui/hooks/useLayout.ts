import { useEffect } from "react";

interface UseLayoutProps {
  isOpen: boolean;
  position: "left" | "right";
}

export const useLayout = ({ isOpen, position }: UseLayoutProps) => {
  useEffect(() => {
    // based on isOpen add html tag margin and based on position
    const html = document.documentElement;
    if (isOpen) {
      if (position === "left") {
        html.style.marginLeft = "280px";
      } else {
        html.style.marginRight = "280px";
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
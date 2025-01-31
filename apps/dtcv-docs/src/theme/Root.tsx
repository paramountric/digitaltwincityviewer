import React from "react";
import { useEffect } from "react";

// This component wraps the entire Docusaurus app
export default function Root({ children }) {
  useEffect(() => {
    // Set dark mode class based on data-theme attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const isDark =
            document.documentElement.getAttribute("data-theme") === "dark";
          document.documentElement.classList.toggle("dark", isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Initial setup
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.classList.toggle("dark", isDark);

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}

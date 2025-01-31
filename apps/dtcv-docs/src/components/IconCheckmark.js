import React from "react";

export default function IconCheckmark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        marginRight: "8px",
      }}
    >
      <rect
        x="2"
        y="4"
        width="16"
        height="16"
        rx="3"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M9.5 16.17L5.33 12l-1.42 1.41L9.5 19 21.5 7l-1.41-1.41L9.5 16.17z"
        fill="currentColor"
      />
    </svg>
  );
}

import React from "react";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
}

const Spinner: React.FC<SpinnerProps> = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div
        className={`animate-spin rounded-full border-t-4 border-primary border-opacity-75 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Spinner;

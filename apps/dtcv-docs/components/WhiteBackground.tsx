export const WhiteBackground: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "4px",
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
};

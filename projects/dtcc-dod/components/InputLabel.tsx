type InputLabelProps = {
  label: string;
  children: JSX.Element;
};

const InputLabel: React.FC<InputLabelProps> = ({label, children}) => {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
};

export default InputLabel;

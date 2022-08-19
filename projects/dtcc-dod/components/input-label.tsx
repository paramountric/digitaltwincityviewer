type Props = {
  label: string;
  children: JSX.Element;
};

function InputLabel({label, children}: Props) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default InputLabel;

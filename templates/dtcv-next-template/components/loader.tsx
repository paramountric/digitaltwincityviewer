export default function Loader() {
  return (
    <div className="absolute z-50 w-full h-full">
      <div className="relative flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
      </div>
    </div>
  );
}

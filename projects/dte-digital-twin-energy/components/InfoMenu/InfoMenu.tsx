import { useUi } from '../../hooks/use-ui';

export default function InfoMenu() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <div className="absolute bottom-0 z-30 flex flex-col">
      {/* <button
        onClick={() => uiActions.setShowInfoModal(!uiState.showInfoModal)}
        className="w-32 p-2 m-0 text-xs font-medium text-center text-white transition bg-gray-700 hover:bg-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 rounded-r-xl"
      >
        Info
      </button> */}
      <div className="p-1 bg-white">@lantmäteriet</div>
    </div>
  );
}

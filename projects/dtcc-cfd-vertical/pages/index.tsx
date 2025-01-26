import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import RightPanel from '../components/right-panel';
import CreateFlowDialog from '../components/create-flow-dialog';
import UploadFileDialog from '../components/upload-file-dialog';
import Loader from '../components/loader';
import {useUi} from '../hooks/use-ui';

const StartPage = () => {
  const {state} = useUi();
  return (
    <div>
      <Header></Header>
      {state.showLeftPanel && <LeftPanel></LeftPanel>}
      <Viewport></Viewport>
      {state.showRightPanel && <RightPanel></RightPanel>}
      <UploadFileDialog></UploadFileDialog>
      <CreateFlowDialog></CreateFlowDialog>
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};
export default StartPage;

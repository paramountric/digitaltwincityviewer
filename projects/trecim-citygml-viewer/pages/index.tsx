import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import RightPanel from '../components/right-panel';
import LoadCityDialog from '../components/load-dataset-dialog';
import UploadFileDialog from '../components/upload-file-dialog';
import {useUi} from '../hooks/use-ui';
import Loader from '../components/loader';

const StartPage = () => {
  const {state} = useUi();
  return (
    <div>
      <Header></Header>
      {state.showLeftPanel && <LeftPanel></LeftPanel>}
      <Viewport></Viewport>
      {state.showRightPanel && <RightPanel></RightPanel>}
      <UploadFileDialog></UploadFileDialog>
      <LoadCityDialog></LoadCityDialog>
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};

export default StartPage;

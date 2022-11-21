import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import RightPanel from '../components/right-panel';
import ExampleFileDialog from '../components/example-file-dialog';
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
      <ExampleFileDialog></ExampleFileDialog>
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};
export default StartPage;

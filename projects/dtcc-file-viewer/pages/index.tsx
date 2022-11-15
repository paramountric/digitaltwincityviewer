import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import LoadCityDialog from '../components/load-city-dialog';
import UploadFileDialog from '../components/upload-file-dialog';

const StartPage = () => (
  <div>
    <Header></Header>
    <LeftPanel></LeftPanel>
    <Viewport></Viewport>
    <UploadFileDialog></UploadFileDialog>
    <LoadCityDialog></LoadCityDialog>
  </div>
);

export default StartPage;

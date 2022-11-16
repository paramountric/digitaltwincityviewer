import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import LoadCityDialog from '../components/load-city-dialog';
import UploadFileDialog from '../components/upload-file-dialog';
import {useUi} from '../hooks/use-ui';
import Loader from '../components/loader';

const StartPage = () => {
  const {state} = useUi();
  console.log(state.isLoading);
  return (
    <div>
      <Header></Header>
      <LeftPanel></LeftPanel>
      <Viewport></Viewport>
      <UploadFileDialog></UploadFileDialog>
      <LoadCityDialog></LoadCityDialog>
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};

export default StartPage;

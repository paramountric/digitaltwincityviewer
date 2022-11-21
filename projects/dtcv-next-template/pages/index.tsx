import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftPanel from '../components/left-panel';
import RightPanel from '../components/right-panel';
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
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};
export default StartPage;

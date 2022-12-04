import Viewport from '../components/viewport';
import Header from '../components/header';
import LeftMenu from '../components/left-menu';
import RightMenu from '../components/right-menu';
import {useUi} from '../hooks/use-ui';
import Loader from '../components/loader';

const StartPage = () => {
  const {state} = useUi();
  return (
    <div>
      <Header></Header>
      {state.showLeftMenu && <LeftMenu></LeftMenu>}
      <Viewport></Viewport>
      {state.showRightMenu && <RightMenu></RightMenu>}
      {state.isLoading && <Loader></Loader>}
    </div>
  );
};

export default StartPage;

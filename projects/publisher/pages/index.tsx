import Viewport from '../components/viewport';
import {DataLoader} from '../lib/DataLoader';
import Header from '../components/header';

export async function getServerSideProps(context) {
  const dataLoader = new DataLoader();
  const files = await dataLoader.getFiles();
  return {
    props: {
      data: {
        files,
      },
    },
  };
}

const StartPage = props => (
  <div>
    <Header></Header>
    <Viewport data={props.data}></Viewport>
  </div>
);

export default StartPage;

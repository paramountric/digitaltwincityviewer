import Viewport from '../components/viewport';
import {DataLoader} from '../lib/DataLoader';

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
    <Viewport data={props.data}></Viewport>
  </div>
);

export default StartPage;
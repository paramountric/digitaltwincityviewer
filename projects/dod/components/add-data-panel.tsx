import { Node } from '@paramountric/entity';
import { useImport } from '../hooks/import';

type AddDataPanelProps = {
  node: Node;
};

export default function AddDataPanel(props: AddDataPanelProps) {
  const {
    actions: { importFromText, setFileType },
  } = useImport();

  const loadExampleFile = async () => {
    // const response = await fetch(
    //   'http://localhost:9000/files/ifc/BAS-NOR/BAS-NOR-STR-MOE.ifc'
    // );
    // const parser = new IfcParser();
    // const data = await response.arrayBuffer();
    // const dataView = new Uint8Array(data);
    // const result = await parser.parse(dataView);
    // console.log(result);
    // const nodes = Object.keys(result.productGeo).map(key => {
    //   const product = result.productGeo[key];
    //   return {
    //     id: key,
    //     name: `${key} - ${product[0] ? product[0].referenceId : 'no ref'}`,
    //   };
    // });
    //const text = await response.text();
    // will put entities in import store
    //const nodeMap = importFromText(text);
    // viewer.setImportNodes(
    //   Object.values(nodeMap).filter(
    //     node => node?.bounds && node.bounds[0] !== Infinity
    //   )
    // );
    // setShowImportDataDialog(true);
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('file');
    if (!e?.target?.files) {
      return;
    }
    const file = e?.target?.files[0];
    console.log(file);
    const reader = new FileReader();
    const splits = file.name.split('.');
    console.log(splits);
    setFileType(splits[splits.length - 1]);
    reader.onload = () => {
      const result = reader.result as string;
      importFromText(result);
    };
    reader.onloadstart = p => {
      // this.store.reset();
      // this.store.setIsLoading(true);
    };
    reader.onloadend = p => {
      // this.store.setIsLoading(false);
      // this.store.setIsLoading(false);
      // this.store.render();
      // this.close();
    };
    reader.readAsText(file);
  };
  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Add data</h2>
            <p className="text-sm font-medium text-gray-500">
              {props.node?.getPropertyValue('name')}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">Add data from file</h3>
        <p>
          todo: create two tabs, one for adding data, one for review and upload.
          Options for add: file, draw on map (prio!), simple (with simple
          geometry representation or from catalog)
        </p>
        <div className="sm:col-span-6">
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 hover:text-blue-400"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={loadFile}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">IFC, XLSX, CSV</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        <button
          type="button"
          className="flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Review
        </button>
        <button
          type="button"
          className="flex-1 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Upload (next page)
        </button>
      </div>
    </div>
  );
}

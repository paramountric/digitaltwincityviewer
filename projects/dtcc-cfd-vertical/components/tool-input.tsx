import toolsConfig from '../lib/dtcc-modules-conf.json';

export type ToolInputProps = {
  selectedToolName: string;
  selectedCommandName: string;
  onClickRun: () => void;
};

export default function ToolInput(props: ToolInputProps) {
  console.log(props);
  const selectedTool = toolsConfig.modules.find(
    t => t.name === props.selectedToolName
  );
  const selectedCommand = selectedTool.commands.find(
    c => c.name === props.selectedCommandName
  );
  console.log(selectedTool);

  return (
    <div>
      <div className="relative  border-white rounded-md border  m-2">
        <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
          <h3>{selectedCommand.name}</h3>
        </div>
        <p className="text-sm m-4">
          Description: {selectedCommand.description}
        </p>
        {selectedCommand.parameters.length === 0 ? (
          <p className="text-sm m-4">No parameters required</p>
        ) : (
          selectedCommand.parameters.map((param, index) => (
            <div
              key={index}
              className="ml-4 p-2 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5"
            >
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                {param.name}
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <div className="flex max-w-xs rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    {param.type}
                  </span>
                  <input
                    type={
                      param.type === 'float' || param.type === 'integer'
                        ? 'number'
                        : 'text'
                    }
                    name={param.name}
                    id={param.name}
                    className="block min-w-0 flex-1 p-1 rounded-none rounded-r-md border border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {param.description}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <div
        onClick={props.onClickRun}
        className="p-2 m-4 text-center bg-slate-600 text-white rounded-full hover:cursor-pointer hover:bg-slate-800"
      >
        Run
      </div>
    </div>
  );
}

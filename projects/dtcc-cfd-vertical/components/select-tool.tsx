import toolsConfig from '../lib/dtcc-modules-conf.json';

export type SelectToolProps = {
  onSelectTool: (toolName: string, commandName) => void;
};

export default function SelectTool(props: SelectToolProps) {
  return (
    <nav className="h-full overflow-y-auto mt-8">
      {toolsConfig.modules.map(toolSetting => {
        return (
          <div
            key={toolSetting.name}
            className="relative  border-white rounded-md border  m-2"
          >
            <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
              <h3>{toolSetting.name}</h3>
            </div>
            <p className="text-sm m-4">
              Description: {toolSetting.description}
            </p>
            <p className="text-sm m-4">Commands:</p>
            <div>
              {toolSetting.commands.map(commandSetting => (
                <div
                  onClick={() =>
                    props.onSelectTool(toolSetting.name, commandSetting.name)
                  }
                  key={commandSetting.name}
                  className="relative hover:bg-gray-100 border-white rounded-md border hover:border-slate-100 hover:cursor-pointer m-2"
                >
                  <div className="sticky rounded text-white top-0 z-10  bg-slate-400 px-6 py-1 text-md font-medium">
                    <h3>{commandSetting.name}</h3>
                  </div>
                  <p className="text-sm m-4">
                    Description: {commandSetting.description}
                  </p>
                </div>
              ))}
            </div>
            {/* <p className="ml-4 mt-2">Modules</p>
              <ul
                role="list"
                className="relative z-0 divide-y divide-gray-200"
              >
                {toolSetting.modules.map(module => (
                  <li key={module.id}>
                    <div className="relative flex items-center space-x-3 px-6 py-5 ">
                      <div className="min-w-0 flex-1">
                        <span
                          className="absolute inset-0"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-gray-900">
                          {module.name}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          {module.description}
                        </p>
                        {module.input.length > 0 ? (
                          <div>
                            {module.input.map(input => (
                              <span
                                key={module.id}
                                className="text-sm rounded-full p-1 px-2 mr-1 text-white bg-slate-400"
                              >
                                {input.type}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm italic">
                            No required input
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul> */}
          </div>
        );
      })}
    </nav>
  );
}

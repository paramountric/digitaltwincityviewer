import toolsConfig from '../lib/dtcc-modules-conf.json';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {TaskModule, TaskModuleTool} from './create-flow-dialog';

export type SelectToolProps = {
  onSelectTool: (toolName: string, commandName: any) => void;
};

export default function SelectTool(props: SelectToolProps) {
  const {isLoading, error, data} = useQuery({
    queryKey: ['modulesData'],
    queryFn: () =>
      fetch('http://13.48.6.254:8080/tasks').then(res => res.json()),
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <nav className="h-full overflow-y-auto mt-8">
      {error && <p>Error fetching data</p>}
      {isLoading && <p>Fetching data...</p>}
      {data &&
        data.map((taskModule: TaskModule) => {
          return (
            <div
              key={taskModule.task_id}
              className="relative  border-white rounded-md border  m-2"
            >
              <div className="sticky rounded text-white top-0 z-10  bg-slate-500 px-6 py-1 text-md font-medium">
                <h3>Module: {taskModule.module_name}</h3>
              </div>
              <p className="truncate text-sm m-4">
                Description: {taskModule.config?.description}
              </p>
              <p className="text-sm m-4">Tools:</p>
              <div>
                {taskModule.config?.tools.map((tool: TaskModuleTool) => (
                  <div
                    onClick={() =>
                      props.onSelectTool(taskModule.task_id, tool.name)
                    }
                    key={tool.name}
                    className="relative bg-slate-400 hover:bg-slate-600 border-white rounded-md border hover:border-slate-100 hover:cursor-pointer m-2"
                  >
                    <div className="sticky rounded text-white top-0 z-10  px-6 py-1 text-md font-medium">
                      <h3>{tool.name}</h3>

                      <p className="truncate text-sm m-4">
                        Description: {tool.description}
                      </p>
                      <div className="form-check text-sm m-4">
                        <input
                          className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        />
                        <label className="form-check-label inline-block">
                          Use {tool.name}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </nav>
  );
}

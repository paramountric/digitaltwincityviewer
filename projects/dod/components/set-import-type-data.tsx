import { useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { Schema } from 'jtd';
import { validateUntrusted } from '../lib/jdt';

export type ImportTypeData = {
  typeDef: Schema;
  fileName: string;
};

type ImportTypeDataProps = {
  importTypeData: ImportTypeData | null;
  onSetImportTypeData: (importTypeData: ImportTypeData) => void;
};

export default function SetImportTypeData(props: ImportTypeDataProps) {
  const [fileName, setFileName] = useState<string | null>(
    props.importTypeData?.fileName || null
  );
  const [typeDef, setTypeDef] = useState<Schema | null>(
    props.importTypeData?.typeDef || null
  );
  const [isValid, setIsValid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target?.files) {
      return;
    }
    let fileNameTemp: string | null = null;
    let typeDefTemp: Schema | null = null;
    const file = e?.target?.files[0];
    const reader = new FileReader();
    const splits = file.name.split('.');
    fileNameTemp = splits[0];
    setFileName(fileNameTemp);
    reader.onload = () => {
      const result = reader.result as string;
      try {
        const schema = JSON.parse(result);
        // // check of the schema is not causing an error itself
        // try {
        //   validateUntrusted(schema, {});
        //   // expect catch
        // } catch (err) {
        //if (String(err).startsWith('Error: invalid schema')) {
        typeDefTemp = schema;
        setTypeDef(schema);
        // } else {
        //   console.log('deal with this error later');
        // }
        console.log(typeDefTemp, fileNameTemp);
        if (typeDefTemp && fileNameTemp) {
          // send back to parent state directly, but the values are kept in local state as well
          props.onSetImportTypeData({
            typeDef: typeDefTemp,
            fileName: fileNameTemp,
          });
          setErrorMessage('');
        } else {
          setErrorMessage('Schema is not valid');
        }
        //}
      } catch (err) {
        console.log(err);
        setErrorMessage(String(err));
      }
    };
    reader.onloadstart = p => {};
    reader.onloadend = p => {};
    reader.readAsText(file);
  };
  return (
    <div className="flex flex-col mt-8 space-y-8 md:max-w-md mx-auto">
      <div>
        {fileName && (
          <div className="mb-4 text-lg">
            Loaded file: <span>{fileName}</span>
          </div>
        )}
        {typeDef && (
          <div className="sm:col-span-6">
            <pre>
              <code>{JSON.stringify(typeDef, null, 2)}</code>
            </pre>
          </div>
        )}
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
                  className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none  hover:text-blue-400"
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
              <p className="text-xs text-gray-500">
                Supported: JSON according to JSON Typedef Schema
              </p>
              {errorMessage && <p className="text-red-900">{errorMessage}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

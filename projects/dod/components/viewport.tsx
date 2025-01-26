import { useRef, useState, useEffect } from 'react';
import { useViewer } from '../hooks/viewer';
import RightMenu from './right-menu';
import LeftMenu from './left-menu';
import BottomMenu from './bottom-menu';
import NodeViewerMenu from './node-viewer-menu';
import AddBaseDialog from './add-base-dialog';
import ImportDataDialog from './import-data-dialog';
import EditTypeDialog from './edit-type-dialog';
import ImportTypeDialog from './import-type-dialog';
import { useUi } from '../hooks/ui';
import TypeDialog from './type-dialog';

type ViewportProps = {};

const Viewport: React.FC<ViewportProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initViewer } = useViewer();
  const {
    state: {
      showAddBaseDialog,
      showImportDataDialog,
      showEditTypeDialog,
      showTypeDialog,
      showImportTypeDialog,
      importTypeStreamId,
    },
  } = useUi();

  useEffect(() => {
    if (canvasRef.current) {
      initViewer(canvasRef.current);
    }
  }, [initViewer]);

  console.log(showImportTypeDialog, importTypeStreamId);

  return (
    <div>
      <canvas id="viewport" ref={canvasRef}></canvas>
      <NodeViewerMenu></NodeViewerMenu>
      <LeftMenu></LeftMenu>
      <RightMenu></RightMenu>
      {showAddBaseDialog && <AddBaseDialog />}
      {showImportDataDialog && <ImportDataDialog />}
      {showEditTypeDialog && <EditTypeDialog />}
      {showImportTypeDialog && importTypeStreamId && <ImportTypeDialog />}
      {showTypeDialog && <TypeDialog />}
      {/* <BottomMenu></BottomMenu> */}
    </div>
  );
};

export default Viewport;

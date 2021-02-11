import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styles from './StaticMaskingWizard.css'
import { Transition } from '../../utils/general';
import StaticMaskingWizardEvents from './StaticMaskingWizard.events';


const DEFAULT_BRUSH_SIZE = 4



export default function FullScreenDialog(props:any) {
  const _events = new StaticMaskingWizardEvents();
  const { open, dataURI } = props;
  const [state, setState] = React.useState({
     brushSize:DEFAULT_BRUSH_SIZE
  });

  _events.setConstructor(state, setState, props);



  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Static Masking wizard 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
        <div style={{float:"left"}}>
            <canvas id="jPolygon" width="227" height="227"  onMouseUp={_events.stopdrawing.bind(_events)} 
             onMouseMove={_events.mousemoving.bind(_events)} onMouseDown={_events.point_it.bind(_events)} 
             data-imgsrc={dataURI.originalReferenceSnapshotURI}>
            </canvas>
        </div>
        <div>
              <button onClick={_events.handleUndo.bind(_events)}>Undo</button>
              <button onClick={_events.handleClear.bind(_events)}>Clear</button>
              <button onClick={_events.handleSave.bind(_events)}>Save</button>
       </div>
       <div>
            <br/>
            Set brush size:
            <br/>
            <input type="number" value={state.brushSize} onChange={_events.handleBrushSizeChange.bind(_events)}/>
       </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}
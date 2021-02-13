import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styles from './EditTagModal.css'
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import StaticMaskingWizard from '../StaticMaskingWizard/StaticMaskingWizard';
import { Transition } from '../../utils/general';
import EditTagModalEvents from './EditTagModal.events';

const _events =  new EditTagModalEvents();

export default function FullScreenDialog(props:any) {
  const { open } = props;

  //**Hooks */
  const [state, setState] = React.useState({
      tag: {
        name:"",
        waitTime: {
            label: "forever",
            value: -1
        },
        originalReferenceSnapshotURI:"",
        dynamic:null,
        skip:false
      },
      dynamicSnapshotModalData: false,
      dynamicSnapshotOpen:false
  });

  _events.setConstructor(state, setState, props);


  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
                Edit Tag: {state.tag.name}
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
           <div className={styles["modal-content-container"]}>
            <div>
             <TextField disabled={state.tag.skip} 
              label="Tag name:" variant="outlined" style={{width:"80%", height:"45px"}} size="small"/>
                &nbsp; Skip: 
               <Checkbox
                checked={state.tag.skip}
                onChange={_events.handleSkipChange.bind(_events)}
                color="primary"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
             />
            </div><br/><br/>
            <div style={{display:'flex', justifyContent:"space-around"}}>
            <div>
            <div> <label>Original:</label></div>
             <img src={state.tag.originalReferenceSnapshotURI} />
            </div>
            <div style={{alignSelf: "center"}}>
              <Button disabled={state.tag.skip} onClick={(e)=>{ _events.handleTagImageClick.bind(_events)(state.tag)}} variant="outlined" color="primary">OPEN EDITOR</Button>
            </div>
             {
               state.tag.dynamic && state.tag.dynamic.drawURI ? <div>
                 <div> <label>Masked:</label></div>
                <img src={state.tag.dynamic.drawURI} />
               </div> : null
             }
            </div><br/>
             <div>
                 <h3>Set wait time until Fail:</h3>
                 <FormControl component="fieldset" disabled={state.tag.skip}>
                 <FormLabel component="legend"></FormLabel>
                 <RadioGroup  aria-label="waitTime" name="gender1" value={state.tag.waitTime.label} onChange={_events.handleSetTimeoutChange.bind(_events)}>
                   <FormControlLabel value="forever" control={<Radio />} label="forever" />
                   <FormControlLabel value="custom" control={<Radio />} label="custom" />
                 </RadioGroup>
                 </FormControl>
                 {
                     state.tag.waitTime.label !== "custom" ? null : 
                     <div>
                        <TextField type="number" disabled={false} value={state.tag.waitTime.value} onChange={_events.handleCustomWaitTimeChange.bind(_events)}
                        label="Insert wait time(seconds):" variant="outlined" style={{width:"0px", height:"45px"}} size="small"/> 
                    </div>
                 }
             </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleClose.bind(_events)}>cancel</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={_events.save.bind(_events)}>Save</Button>
            </div>
       </div>
       <StaticMaskingWizard handleDynamicSnapshotModalSave={_events.handleDynamicSnapshotModalSave.bind(_events)}
        handleDynamicSnapshotModalClose={_events.handleDynamicSnapshotModalClose.bind(_events)} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      </Dialog>
    </div>
  ) : <div></div>;
}
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import styles from './EditTagModal.css'
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let runonce:any = false;
export default function FullScreenDialog(props:any) {

  const { open, tag } = props;

  //**Hooks */
  const [state, _setState] = React.useState({
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

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  //**Functions */  
  const handleClose = (e:any) => {
    runonce = false;
    const {handleEditTagModalClose} = props;
    handleEditTagModalClose(false);
  };

  const handleSetTimeoutChange = async (e:any) => {
      const label = e.target.value
      const tag = state.tag
      tag.waitTime.label = label;
      await setState({...state, tag})
  };

  const handleCustomWaitTimeChange = async (e:any) => {
    const value = e.target.value
    const tag = state.tag
    tag.waitTime.value = value
    await setState({...state, tag})
  }

  const handleSkipChange = async (e:any) => {
    const skip = e.target.checked
    const tag = state.tag
    tag.skip = skip
    await setState({...state, tag})
  }

  const handleTagImageClick = async (tag:any) => {
    await setState({...state, dynamicSnapshotOpen:true, dynamicSnapshotModalData:tag})
  }

  const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
    tag["dynamic"] = {coords, drawURI}
  }

 const handleDynamicSnapshotModalClose = async (e:any) => {
    await setState({...state, dynamicSnapshotOpen:false}) 
 }

 const save = (e:any) => {
   const { handleEditTagSave } = props
   handleEditTagSave(state);
}

(async ()=>{
  if(open && !runonce) {
    runonce = true;
    await setState({...state, tag:{...state.tag, ...tag}})
  }
})()

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
                Edit Tag: {state.tag.name}
            </Typography>
            <Button color="inherit" onClick={handleClose}>
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
                onChange={handleSkipChange}
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
              <Button disabled={state.tag.skip} onClick={(e)=>{ handleTagImageClick(state.tag)}} variant="outlined" color="primary">OPEN EDITOR</Button>
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
                 <RadioGroup  aria-label="waitTime" name="gender1" value={state.tag.waitTime.label} onChange={handleSetTimeoutChange}>
                   <FormControlLabel value="forever" control={<Radio />} label="forever" />
                   <FormControlLabel value="custom" control={<Radio />} label="custom" />
                 </RadioGroup>
                 </FormControl>
                 {
                     state.tag.waitTime.label !== "custom" ? null : 
                     <div>
                        <TextField type="number" disabled={false} value={state.tag.waitTime.value} onChange={handleCustomWaitTimeChange}
                        label="Insert wait time(seconds):" variant="outlined" style={{width:"300px", height:"45px"}} size="small"/> 
                    </div>
                 }
             </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={handleClose}>cancel</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={save}>Save</Button>
            </div>
       </div>
       <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      </Dialog>
    </div>
  ) : <div></div>;
}
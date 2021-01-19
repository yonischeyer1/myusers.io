import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import styles from './EditTagModal.css'
import ServiceStore from '../../services /store.service';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width:200
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    userActionSelectContainer: {
      display: "flex"
    },
    doneCancelBtnsContianer: {
      display:"flex"
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
  }),
);


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export default function FullScreenDialog(props:any) {
  //**Consts */
  const classes = useStyles();
  const { open, tag } = props;

  //**Hooks */
  const [state, setState] = React.useState({
      name:"",
      waitTime: {
          label: "forever",
          value: -1
      },
      originalReferenceSnapshotURI:"",
      dynamic:null,
      
  });
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)

  //**Functions */  
  const handleClose = (e:any) => {
    const {handleEditTagModalClose} = props;
    handleEditTagModalClose(false);
  };

  const handleSetTimeoutChange = (e:any) => {
      const label = e.target.value
      const waitTime = state.waitTime
      waitTime.label = label
      setState({...state, waitTime})
  };

  const handleCustomWaitTimeChange = (e:any) => {
    const label = e.target.value
    const waitTime = state.waitTime
    waitTime.value = label
    setState({...state, waitTime})
  }

  const save = (e:any) => {

  }

  const handleTagImageClick = (tag:any) => {
    setdynamicSnapshotModalData(tag)
    setDynamicSnapshotOpen(true)
  }

  const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
     tag["dynamic"] = {coords, drawURI}
  }

 const handleDynamicSnapshotModalClose = (e:any) => {
    setDynamicSnapshotOpen(false)
 }  

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
                Edit Tag: {tag.name}
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
           <div className={styles["modal-content-container"]}>
            <div>
             <TextField disabled={false} 
              label="Tag name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
                &nbsp; Skip: 
               <Checkbox
                color="primary"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
             />
            </div><br/><br/>
            <div style={{display:'flex'}}>
            <div>
            <div> <label>Original:</label></div>
             <img src={tag.originalReferenceSnapshotURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
            </div>
             {
               tag.dynamic && tag.dynamic.drawURI ? <div>
                 <div> <label>Masked:</label></div>
                <img src={tag.dynamic.drawURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
               </div> : null
             }
            </div><br/>
             <div>
                 <h3>Set wait time until Fail:</h3>
                 <FormControl component="fieldset">
                 <FormLabel component="legend"></FormLabel>
                 <RadioGroup aria-label="waitTime" name="gender1" value={state.waitTime.label} onChange={handleSetTimeoutChange}>
                   <FormControlLabel value="forever" control={<Radio />} label="forever" />
                   <FormControlLabel value="custom" control={<Radio />} label="custom" />
                 </RadioGroup>
                 </FormControl>
                 {
                     state.waitTime.label !== "custom" ? null : 
                     <div>
                        <TextField type="number" disabled={false} value={state.waitTime.value} onChange={handleCustomWaitTimeChange}
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
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={dynamicSnapshotOpen} dataURI={dynamicSnapshotModalData}/>
      </Dialog>
    </div>
  ) : <div></div>;
}
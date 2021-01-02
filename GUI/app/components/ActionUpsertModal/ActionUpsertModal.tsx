import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { TextField } from '@material-ui/core';
import RecordingModal from '../RecordingModal/RecordingModal'
import ServiceStore from '../../services /store.service';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal'
import styles from './ActionUpsertModal.css';

const serviceStore = new ServiceStore();

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
  const classes = useStyles();
  const [openRecordingModal, setOpenRecordingModal] = React.useState(false)
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)
  const { open, pickedAction } = props;

  const handleClose = (e:any) => {
    const {handleUpsertActionModalClose} = props;
    handleUpsertActionModalClose(false);
  };

  const handleRecordingModalClose = () =>{
     setOpenRecordingModal(false)
  }

  const handleRecordBtnClick = (e:any) => {
    setOpenRecordingModal(true)
  }

  const handleAddLiveSnapshotClick = (e:any) => {

  }


  const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
    tag["dynamic"] = {coords, drawURI}
 }

 const handleDynamicSnapshotModalClose = (e:any) => {
  setDynamicSnapshotOpen(false)
}

  const handleActionNameChange = (e:any) => {
    const key = "actionName"
    const newActionName = e.target.value
    serviceStore.upsertAppStateValue(key, newActionName)
  }

  const handleTagImageClick = (tag:any) => {
    setdynamicSnapshotModalData(tag)
    setDynamicSnapshotOpen(true)
 } 

 const saveCurrentActionTags = async (e:any) => {
   const actions = serviceStore.readDocs('actions')
   actions[pickedAction.id].tags = pickedAction.tags;
   serviceStore.updateDocs('actions', actions);
 }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} 
             onChange={handleActionNameChange} 
             label="Action Name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
        </div>
             <br/>
        <div style={{display:"flex", alignItems:"center"}}>
        <div className={styles["recoreder-control-button"]}>
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={handleRecordBtnClick}>record</Button>
        </div>
        <div className={styles["live-snapshot-controls"]}>
        <Button size="small" variant="outlined" color="primary" disabled={false} onClick={handleAddLiveSnapshotClick}>ADD Live snapshot +</Button>
        </div>
        </div>
        <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={saveCurrentActionTags}>Save</Button>
         </div>
         {
           !pickedAction ? null : 
           <div className={styles["tags-editor-container"]}>
              {
                 pickedAction.tags.map((tag)=>{
                  return <div style={{display:'flex'}}>
                    <div>
                    <img src={tag.originalReferenceSnapshotURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
                    </div>
                    {
                      tag.dynamic && tag.dynamic.drawURI ? <div>
                        <img src={tag.dynamic.drawURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
                      </div> : null
                    }
                    <div>
                      insert time in seconds
                     <input value={tag.maxWaitTimeUntilFail} onChange={(e)=>{
                      // handleTagTimeoutChange(e,tag)
                       }} type="number" max={59}/>
                    </div>
                    <div>
                      distnace: {tag.distances[0]}
                      </div>
                  </div>
              })
            }
           </div>
         }
     </div>
     <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={dynamicSnapshotOpen} dataURI={dynamicSnapshotModalData}/>
     <RecordingModal handleRecordingModalClose={handleRecordingModalClose} open={openRecordingModal}/>
      </Dialog>
    </div>
  ) : <div></div>
}
import React, {Suspense} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import {APP_CWD } from '../../utils/general';
import { TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box, Fab } from '@material-ui/core';
import RecordingModal from '../RecordingModal/RecordingModal'
import ServiceStore from '../../services /store';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal'
import LocalDB from '../../utils/localDB.core';
// import { IMAGE_HASH_BITS, convertURIToImageData } from '../../utils/testIoFile';

const serviceStore = new ServiceStore();
const localDB = new LocalDB();
interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }


function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

const state = {
  imageArray:[],
  totalRecordTime:null,
  screen: "validate"
}

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
  const [tabIndex, setTabIndex] = React.useState(0);
  const [actionName, setActionName] = React.useState("");
  const [openRecordingModal, setOpenRecordingModal] = React.useState(false)
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)
  const { open, pickedAction } = props;
  const handleClose = () => {
    const {handleUpsertActionModalClose} = props;
    handleUpsertActionModalClose(false);
  };

  const handleRecordingModalClose = () =>{
     setOpenRecordingModal(false)
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
    serviceStore.upsert(key,newActionName)
  }

  const handleTagImageClick = (tag:any) => {
    console.log("tag",tag)
    const {originalReferenceSnapshotURI} = tag;
    setdynamicSnapshotModalData(tag)
    setDynamicSnapshotOpen(true)
 } 

 const saveAction = async () => {
   const Actions:any = await localDB.getModelArrayByName(localDB.MODELS.Action);
   const indexOfPickedAction = Actions.findIndex(action => action.id === pickedAction.id)
   Actions[indexOfPickedAction].tags = pickedAction.tags
   localDB.saveModel(localDB.MODELS.Action, Actions)
 }

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose()
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className="modal-content-container">
          <div className="test-name-container">
             <TextField disabled={false} 
             onChange={handleActionNameChange} 
             label="Action Name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
        </div>
             <br/>
        <div style={{display:"flex", alignItems:"center"}}>
        <div className="recoreder-control-button">
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                   setOpenRecordingModal(true)
                //    this.startRecording();
               }}>record</Button>
        </div>
        <div className="live-snapshot-controls">
        <Button size="small" variant="outlined" color="primary" disabled={false} onClick={()=>{
                //    this.startRecording();
        }}>ADD Live snapshot +</Button>
        </div>
        </div>
        <br/><br/>
         <div className="done-cancel-btns">
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={()=>{
           saveAction()
         }}>Save</Button>
         </div>
         {
           !pickedAction ? null : 
           <div className="tags-editor-container">
              {
                 pickedAction.tags.map((tag)=>{
                  return <div style={{display:'flex'}}>
                    <div>
                    <img src={tag.originalReferenceSnapshotURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
                    {
                      tag.dynamic && tag.dynamic.drawURI ? <div>
                        <img src={tag.dynamic.drawURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
                      </div> : null
                    }
                    </div>
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
  );
}
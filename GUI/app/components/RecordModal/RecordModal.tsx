import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import {APP_CWD } from '../../utils/general';
import { spawn } from 'child_process';
import { Tag, TagType, Action } from '../../models/Action.model';
import { getVideoFramesAndTime } from '../../utils/eyes/frameStream';
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal'
import LocalDB from '../../utils/localDB.core'
import ServiceStore from '../../services /store';
import { User } from '../../models/User.model';
import { removeContainerByName } from '../../utils/IHost';
const serviceStore = new ServiceStore();
const localDB = new LocalDB();

const SCREENSHOTS_TEMP_DIR_PATH = `${APP_CWD}tempScreenShotDir`
const SCREENS =  { validate:'validate', setTagsMaxTimeoutScreen: 'setTagsMaxTimeoutScreen' }
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
  }),
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let saveThis = null 

export default function FullScreenDialog(props:any) {
  const [liveViewPort, setLiveViewPort] = React.useState(null)
  const [liveViewPortModalOpen, setLiveViewPortModalOpen] = React.useState(false)
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)
  const [screen, setScreen] = React.useState('validate');
  const [tagsPresent, setTags] = React.useState(null);
  const videoPlayerOutputSrc = `${APP_CWD}recorder.mp4`
  const { open, ioFilePath, videoFilePath, totalRecordTime, recorderContainer } = props;
  const classes = useStyles();
  state["totalRecordTime"] = totalRecordTime
  const handleClose = (recordAgain = false) => {
    const {handleModalClose} = props;
    handleModalClose(state, recordAgain);
  };

  const handleLivePreviewModalClose = (e:any) => {
    setLiveViewPortModalOpen(false)
  }
  const handleDynamicSnapshotModalClose = (e:any) => {
    setDynamicSnapshotOpen(false)
  }
  const handleTagTimeoutChange = (e:any, tagChanged:any) => {
    const value = e.target.value
    const newTags = tags.map((tag:any)=>{
      if(tag.hash === tagChanged.hash) {
         tag.maxWaitTimeUntilFail = value;
      }
      return tag;
    })
    setTags(newTags)
  }

  const handleDynamicSnapshotModalSave = ({tag, coords}) => {
     tag["dynamic"] = {coords}

    //save coords in tag choosen
  }

  const snap = async () => {
    const video = document.querySelector('video')
    let canvas = document.createElement('canvas');
    let canvasContainer = document.createElement('div');
    canvas.style.width = "320px"
    canvas.style.height = "240px"
    canvasContainer.appendChild(canvas);
    document.getElementsByClassName("screenshots-container")[0].appendChild(canvasContainer);
    canvas.width = 1024;
    canvas.height = 768;
    let canvasContext = canvas.getContext("2d");
    canvasContext.drawImage(video, 0, 0);
    const snapShotURl = canvas.toDataURL('image/jpeg');
    // const videoFrameAsImageData = await convertURIToImageData(snapShotURl)
    state.imageArray.push(snapShotURl)
    console.log("state",state)
  }


  const startAutoTagging = async () : Promise<Tag[]> => {
     let { timeStamps , recordStartDate} = recorderContainer.autoTaggerData;
     console.log("timeStamps",timeStamps)
     const tags: Tag[] = [];
     for(let bbb = 0; bbb < timeStamps; bbb++) {
       tags.push({
         type: TagType.NOROMAL,
         originalReferenceSnapshotURI: "",
         distances:[0],
         maxWaitTimeUntilFail: -1,
         hash:"",
         screenShotFromPlayURI:""
       })
     }
     return tags;
  }

  const yes = async () => {
    const tags = await startAutoTagging();
    const action = {
      tagHashFillFlag:true,
      id:localDB.createRandomId(),
      name: "fine",
      ioActions:recorderContainer._ioActions,
      tags
    }
    const actionWithHashes = await recorderContainer.playRecorderAction(action,()=>{
      setLiveViewPort(recorderContainer._port)
      setLiveViewPortModalOpen(true)
    })
    actionWithHashes.tagHashFillFlag = false
    const actionWithDists = await recorderContainer.playRecorderAction(actionWithHashes,()=>{
      setLiveViewPort(recorderContainer._port)
      setLiveViewPortModalOpen(true)
    })
    console.log("actionWithDists.tags",actionWithDists.tags)
    saveThis = {tags: actionWithDists.tags, ioActions:actionWithDists.ioActions} 
    await removeContainerByName(recorderContainer._containerName)
    setTags(actionWithDists.tags);
    setScreen(SCREENS.setTagsMaxTimeoutScreen)
  }

  const handleTagImageClick = (tag:any) => {
      console.log("tag",tag)
      const {originalReferenceSnapshotURI} = tag;
      setdynamicSnapshotModalData(tag)
      setDynamicSnapshotOpen(true)
  }

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Validate & Save 
            </Typography>
            <Button color="inherit" onClick={()=>{
              handleClose(false)
            }}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <div className="modal-content-container">
           <div className="guide-label-record">
             Is this what you recorded ?
           </div>
           <div className="video-container">
           <video id="video-playback-player" width="768" height="610" controls>
           <source src={videoPlayerOutputSrc} type="video/mp4" />
           </video>
           </div>
           {
             screen === SCREENS.validate ?
             <div className="modal-verifaction-buttons-controls">
             <Button size="small" variant="outlined" color="secondary"  onClick={()=>{
                   handleClose(true)
                 }}>record again</Button>
                 <div className="yes-button">
  
                 <Button  size="small" variant="outlined" color="primary" onClick={()=>{
                   yes()
                 }}>yes</Button>
                 </div>
               </div> : null
           }
           {
             screen === SCREENS.setTagsMaxTimeoutScreen ? 
             <div className="screen-setMaxTimeout-container">
               {
                 tagsPresent.map((tag)=>{
                   return <div style={{display:'flex'}}>
                     <div>
                     <img src={tag.originalReferenceSnapshotURI} onClick={(e)=>{ handleTagImageClick(tag)}}/>
                     </div>
                     <div>
                       insert time in seconds
                      <input value={tag.maxWaitTimeUntilFail} onChange={(e)=>{handleTagTimeoutChange(e,tag)}} type="number" max={59}/>
                     </div>
                   </div>
                 })
               }
             </div> : null
           }
           <div className="record-modal-save-btn-container">
           <Button  size="small" variant="outlined" color="primary" onClick={()=>{
                   saveTags ? saveTags(saveThis.tags, saveThis.ioActions) : null
                   saveThis = null
            }}>save</Button>
           </div>
        </div>
      </Dialog>
      <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={dynamicSnapshotOpen} dataURI={dynamicSnapshotModalData}/>
      <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} open={liveViewPortModalOpen} stopPlaying={false} port={liveViewPort}/>
    </div>
  );
}
//TODO need to open DynamicSNapashotMOdal on click and pass tag.originalSnapshotURI

async function saveTags(tags:any, ioActions:any) {
  const Users:any = await localDB.getModelArrayByName(localDB.MODELS.User);
  const Actions:any = await localDB.getModelArrayByName(localDB.MODELS.Action);
  const currentUser = serviceStore.get('currentUser')
  if(currentUser) {
    const actionName = serviceStore.get('actionName')
    const startUrl = serviceStore.get('startUrl')
    const indexOfPickedUser = Users.findIndex(user => user.id === currentUser.id)
    const actionToInsert:Action = {
      id:localDB.createRandomId(),
      name: actionName,
      ioActions,
      tags,
      startUrl
    }
    Actions.push(actionToInsert);
    Users[indexOfPickedUser].actionsIds.push(actionToInsert.id)
    localDB.saveModel(localDB.MODELS.Action, Actions)
    localDB.saveModel(localDB.MODELS.User, Users)
  } else {
    const userName = serviceStore.get('userName')
    const actionName = serviceStore.get('actionName')
    const startUrl = serviceStore.get('startUrl')
    const userToInsert:User = {
      name:userName,
      accountsIds:[],
      actionsIds:[]
    }
    const actionToInsert:Action = {
      id:localDB.createRandomId(),
      name: actionName,
      ioActions,
      tags,
      startUrl
    }
    userToInsert.actionsIds.push(actionToInsert.id)
    Actions.push(actionToInsert);
    Users.push(userToInsert)
    localDB.saveModel(localDB.MODELS.Action, Actions)
    localDB.saveModel(localDB.MODELS.User, Users)
  }
  serviceStore.upsert('currentUser', null)
  serviceStore.upsert('userName',null)
}

async function takeMultipleScreenShotsFromVideo(command:any) {
    return new Promise((resolve, reject) => {
        const someCMD = spawn(command, { shell: true})
        someCMD.on("exit",async () =>{
            resolve();
        })
    })
}
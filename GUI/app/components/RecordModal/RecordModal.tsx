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
import { Tag, TagType, Action } from '../../models/Action.model';
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal'
import LocalDB from '../../utils/localDB.core'
import ServiceStore from '../../services /store';
import { User } from '../../models/User.model';
import { removeContainerByName } from '../../utils/IHost';
import styles from './RecordModal.css'

const serviceStore = new ServiceStore();
const localDB = new LocalDB();

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

let saveThis:any = null 

export default function FullScreenDialog(props:any) {
  const [liveViewPort, setLiveViewPort] = React.useState(null)
  const [liveViewPortModalOpen, setLiveViewPortModalOpen] = React.useState(false)
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)
  const [screen, setScreen] = React.useState('validate');
  const [tagsPresent, setTags] = React.useState(null);
  const videoPlayerOutputSrc = `${APP_CWD}recorder.mp4`
  const { open, totalRecordTime, recorderContainer } = props;
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
        <div className={styles["modal-content-container"]}>
           <div className="guide-label-record">
             Is this what you recorded ?
           </div>
           <div className={styles["video-container"]}>
           <video id="video-playback-player" width="768" height="610" controls>
           <source src={videoPlayerOutputSrc} type="video/mp4" />
           </video>
           </div>
           {
             screen === SCREENS.validate ?
             <div className={styles["modal-verifaction-buttons-controls"]}>
             <Button size="small" variant="outlined" color="secondary"  onClick={()=>{
                   handleClose(true)
                 }}>record again</Button>
                 <div className={styles["yes-button"]}>
  
                 <Button  size="small" variant="outlined" color="primary" onClick={()=>{
                   yes()
                 }}>yes</Button>
                 </div>
               </div> : null
           }
           {
             screen === SCREENS.setTagsMaxTimeoutScreen ? 
             <div className={styles["screen-setMaxTimeout-container"]}>
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
           <div className={styles["record-modal-save-btn-container"]}>
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



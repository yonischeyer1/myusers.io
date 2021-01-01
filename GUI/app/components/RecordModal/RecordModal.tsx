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
import ServiceStore from '../../services /store.service'
import { User } from '../../models/User.model';
import { removeContainerByName } from '../../utils/IHost';
import styles from './RecordModal.css'

const serviceStore = new ServiceStore();

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
  const handleClose = (e:any) => {
    const {handleModalClose} = props;
    handleModalClose(state, false);
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
     let { timeStamps } = recorderContainer.autoTaggerData;
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

  const userValidatedIoActions = async (e:any) => {
    const tags = await startAutoTagging();
    const action = {
      tagHashFillFlag:true,
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
    saveThis = {tags: actionWithDists.tags, ioActions:actionWithDists.ioActions} 
    await removeContainerByName(recorderContainer._containerName)
    setTags(actionWithDists.tags);
    setScreen(SCREENS.setTagsMaxTimeoutScreen)
  }

  const handleTagImageClick = (tag:any) => {
      setdynamicSnapshotModalData(tag)
      setDynamicSnapshotOpen(true)
  }

  async function saveTags(tags:any, ioActions:any) {
    const users = serviceStore.readDocs('users');
    const currentUser = serviceStore.getAppStateValue('currentUser')
    const actionName = serviceStore.getAppStateValue('actionName')
    const startUrl = serviceStore.getAppStateValue('startUrl')
    const actionToInsert:Action = {
      name: actionName,
      ioActions,
      tags,
      startUrl
    }
    const newActionId = serviceStore.createDoc('actions', actionToInsert)
    if(currentUser) {
      users[currentUser.id].actionsIds.push(newActionId);
      serviceStore.updateDocs('users', users)
    } else {
      const userName = serviceStore.getAppStateValue('userName')
      const userToInsert:User = {
        name:userName,
        accountsIds:[],
        actionsIds:[]
      }
      userToInsert.actionsIds.push(newActionId)
      serviceStore.createDoc('users', userToInsert);

    }
    serviceStore.upsertAppStateValue('currentUser', null)
    serviceStore.upsertAppStateValue('userName',null)
  }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Validate & Save 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
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
             <Button size="small" variant="outlined" color="secondary"  onClick={handleClose}>record again</Button>
                 <div className={styles["yes-button"]}>
                 <Button  size="small" variant="outlined" color="primary" onClick={userValidatedIoActions}>yes</Button>
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
  ) : <div></div>
}



import React from 'react';
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
import { removeContainerByName } from '../../utils/IHost';
import styles from './RecordModal.css'

const serviceStore = new ServiceStore();

const SCREENS =  { validate:'validate', setTagsMaxTimeoutScreen: 'setTagsMaxTimeoutScreen' }


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let saveThis:any = null 

export default function FullScreenDialog(props:any) {
  const videoPlayerOutputSrc = `${APP_CWD}recorder.mp4`
  const { open, recorderContainer } = props;

  const [state, _setState] = React.useState({
    liveViewPort:null,
    liveViewPortModalOpen:false,
    dynamicSnapshotModalData:null,
    dynamicSnapshotOpen:null,
    screen:null,
    tagsPresent:null,
  })

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },300)
    })
  }

  const handleClose = (e:any) => {
    const {handleModalClose} = props;
    handleModalClose(state, false);
  };

  const handleLivePreviewModalClose = async (e:any) => {
    await setState({...state, liveViewPortModalOpen:false});
  }

  const handleDynamicSnapshotModalClose = async (e:any) => {
    await setState({...state, dynamicSnapshotOpen:false});
  }

  const handleTagTimeoutChange = async (e:any, tagChanged:any) => {
    const value = e.target.value
    const newTags = state.tagsPresent.map((tag:any)=>{
      if(tag.hash === tagChanged.hash) {
         tag.maxWaitTimeUntilFail = value;
      }
      return tag;
    })
    await setState({...state, tagsPresent:newTags})
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
         waitTime: -1,
         hash:"",
         skip:false,
         name:`tag-${bbb}`
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
    const actionWithHashes = await recorderContainer.playRecorderAction(action,async ()=>{
      await setState({...state, liveViewPort:recorderContainer._port, liveViewPortModalOpen:true})
    })
    saveThis = {tags: actionWithHashes.tags, ioActions:actionWithHashes.ioActions} 
    await removeContainerByName(recorderContainer._containerName)
    await setState({...state, tagsPresent:actionWithHashes.tags, screen:SCREENS.setTagsMaxTimeoutScreen})
  }

  const handleTagImageClick = async (tag:any) => {
      await setState({...state, dynamicSnapshotModalData:tag, dynamicSnapshotOpen:true})
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
    users[currentUser.id].actionsIds.push(newActionId);
    serviceStore.updateDocs('users', users)
    serviceStore.upsertAppStateValue('currentUser', null)
    serviceStore.upsertAppStateValue('userName',null)
  }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
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
             state.screen === SCREENS.validate ?
             <div className={styles["modal-verifaction-buttons-controls"]}>
             <Button size="small" variant="outlined" color="secondary"  onClick={handleClose}>record again</Button>
                 <div className={styles["yes-button"]}>
                 <Button  size="small" variant="outlined" color="primary" onClick={userValidatedIoActions}>yes</Button>
                 </div>
               </div> : null
           }
           {
             state.screen === SCREENS.setTagsMaxTimeoutScreen ? 
             <div className={styles["screen-setMaxTimeout-container"]}>
               {
                 state.tagsPresent.map((tag)=>{
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
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} open={state.liveViewPortModalOpen} stopPlaying={false} port={state.liveViewPort}/>
    </div>
  ) : <div></div>
}



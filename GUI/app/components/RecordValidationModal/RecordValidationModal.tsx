import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {APP_CWD, Transition } from '../../utils/general';
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DynamicSnapshotModal from '../StaticMaskingWizard/StaticMaskingWizard'
import styles from './RecordValidationModal.css'
import RecordValidationModalEvents from './RecordValidationModal.events';


const SCREENS =  { validate:'validate', setTagsMaxTimeoutScreen: 'setTagsMaxTimeoutScreen' }

let saveThis:any = null 


export default function FullScreenDialog(props:any) {
  const _events = new RecordValidationModalEvents()
  const videoPlayerOutputSrc = `${APP_CWD}recorder.mp4`
  const { open } = props;

  const [state, setState] = React.useState({
    liveViewPort:null,
    liveViewPortModalOpen:false,
    dynamicSnapshotModalData:null,
    dynamicSnapshotOpen:null,
    screen:null,
    tagsPresent:null,
  })

  _events.setConstructor(state, setState, props)

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Validate & Save 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
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
             <Button size="small" variant="outlined" color="secondary"  onClick={_events.handleClose.bind(_events)}>record again</Button>
                 <div className={styles["yes-button"]}>
                 <Button  size="small" variant="outlined" color="primary" onClick={_events.userValidatedIoActions.bind(_events)}>yes</Button>
                 </div>
               </div> : null
           }
           {
             state.screen === SCREENS.setTagsMaxTimeoutScreen ? 
             <div className={styles["screen-setMaxTimeout-container"]}>
               {
                 state.tagsPresent.map((tag:any)=>{
                   return <div style={{display:'flex'}}>
                     <div>
                     <img src={tag.originalReferenceSnapshotURI} onClick={(e)=>{ _events.handleTagImageClick.bind(_events)(tag)}}/>
                     </div>
                     <div>
                       insert time in seconds
                      <input value={tag.maxWaitTimeUntilFail} onChange={(e)=>{ _events.handleTagTimeoutChange.bind(_events)(e,tag)}} type="number" max={59}/>
                     </div>
                   </div>
                 })
               }
             </div> : null
           }
           <div className={styles["record-modal-save-btn-container"]}>
           <Button  size="small" variant="outlined" color="primary" onClick={()=>{
                   saveThis ? _events.saveTags.bind(_events)(saveThis.tags, saveThis.ioActions) : null
                   saveThis = null
            }}>save</Button>
           </div>
        </div>
      </Dialog>
      <DynamicSnapshotModal handleDynamicSnapshotModalSave={_events.handleDynamicSnapshotModalSave.bind(_events)}
        handleDynamicSnapshotModalClose={_events.handleDynamicSnapshotModalClose.bind(_events)} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      <PlayerLiveViewModal handleLivePreviewModalClose={_events.handleLivePreviewModalClose.bind(_events)} open={state.liveViewPortModalOpen} stopPlaying={false} port={state.liveViewPort}/>
    </div>
  ) : <div></div>
}



import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TextField, CircularProgress } from '@material-ui/core';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import RecordModal from '../RecordValidationModal/RecordValidationModal';
import styles from './RecordingModal.css'
import { Transition } from '../../utils/general';
import RecordingModalEvents, {DEFAULT_COMPONENT_STATE} from './RecordingModal.events';


const _events = new RecordingModalEvents();

export default function FullScreenDialog(props:any) {

  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

  _events.setConstructor(state, setState, props)

  const {open, record, port, loading, 
    stopRecord, openRecordModal, totalRecordTime, recorderContainer,
    recordButtonDisable, stopButtonDisable }  = state;

  const isLoginMode = _events.isLoginMode;
   
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {isLoginMode ? 'Login Account' : ' Recording wizard '}
            
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
       <div className={styles["modal-content-container"]}>
       <div>
         <br/>
           <div style={{color:"black",display:"flex",width:"100%",height:"auto", justifyContent:"center"}}>
             {
               isLoginMode ?              
               <div className={styles["buttons-container"]}>
                <div className={styles["recoreder-control-button"]}> 
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={_events.finishLogin.bind(_events)}>Finish</Button>      
               </div>
               </div> : 
                 <div className={styles["buttons-container"]}>
                 <div className={styles["recoreder-control-button"]}>
                    <Button size="small" variant="outlined" color="secondary" disabled={recordButtonDisable} onClick={_events.startRecording.bind(_events)}>record</Button> 
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={stopButtonDisable} onClick={_events.stopRecording.bind(_events)}>stop</Button>
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={stopButtonDisable} onClick={_events.abort.bind(_events)}>abort</Button>
                 </div>
               </div>
             }
             <div style={{width:"auto"}}>
             {
               isLoginMode ? null : <TextField disabled={recordButtonDisable} 
               onChange={_events.handleURLChange.bind(_events)} 
               label="URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             }
                 {
                 loading ? <div className={styles["loading-container"]}><CircularProgress 
                 style={{ alignSelf: "center", width: "100px", height: "100px",marginBottom: "15%"}}/>
                </div> :
                     record ?  <VncViewerComponent stopRecord={stopRecord} mode="recorder" port={port}/> :
                   <div className={styles["blank-container"]}>
                   </div>
                 }
              </div>
           </div>
           <RecordModal recorderContainer={recorderContainer} totalRecordTime={totalRecordTime} open={openRecordModal} handleModalClose={_events.handleModalClosing.bind(_events)}/>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}
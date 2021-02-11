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
import RecordingModalEvents from './RecordingModal.events';
import ServiceStore from '../../services /store.service';


const serviceStore = new ServiceStore();


export default function FullScreenDialog(props:any) {
  const _events = new RecordingModalEvents();
  const { open } = props;
  
  const [state, setState] = React.useState({
    record: false,
    port: null,
    loading:false,
    imageName:null,
    containerId:null,
    stopRecord:false,
    openModal:false,
    videoFilePath:null,
    totalRecordTime:null,
    recorderContainer:null,
    recordButtonDisable:false,
    stopButtonDisable:true,
    startRecordingDateTime:null,
    imageTest: null,
    startUrl:null
  });

  const isLoginMode = serviceStore.getAppStateValue('isLoginMode');

  _events.setConstructor(state, setState, props)

   
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
                    <Button size="small" variant="outlined" color="secondary" disabled={state.recordButtonDisable} onClick={_events.startRecording.bind(_events)}>record</Button> 
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={_events.stopRecording.bind(_events)}>stop</Button>
                 </div>
                 <div className={styles["recoreder-control-button"]}>
                 <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={state.stopButtonDisable} onClick={_events.abort.bind(_events)}>abort</Button>
                 </div>
               </div>
             }
             <div style={{width:"auto"}}>
             {
               isLoginMode ? null : <TextField disabled={state.recordButtonDisable} 
               onChange={_events.handleURLChange.bind(_events)} 
               label="URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             }
                 {
                 state.loading ? <div className={styles["loading-container"]}><CircularProgress 
                 style={{ alignSelf: "center", width: "100px", height: "100px",marginBottom: "15%"}}/>
                </div> :
                     state.record ?  <VncViewerComponent stopRecord={state.stopRecord} mode="recorder" port={state.port}/> :
                   <div className={styles["blank-container"]}>
                   </div>
                 }
              </div>
           </div>
           <RecordModal recorderContainer={state.recorderContainer} totalRecordTime={state.totalRecordTime} open={state.openModal} handleModalClose={_events.handleModalClosing.bind(_events)}/>
         </div>
        </div>
      </Dialog>
    </div>
  ) : <div></div>
}
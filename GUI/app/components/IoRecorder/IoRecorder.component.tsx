import React from 'react';
import VncViewerComponent from '../VncViewer/vncViewer.component';
import RecordModal from '../RecordModal/RecordModal';
import { APP_CWD, isWindows } from '../../utils/general';
import Container, { CONTAINER_MODE } from '../../utils/Container.controller';
import { Button, CircularProgress, TextField } from '@material-ui/core';
import moment from 'moment'
// import { testIoFile } from '../../utils/testIoFile';
import { scanVideoForImage } from '../../utils/scanVideoForImage';
import { getImageLowestDistanceInVideo } from '../../utils/eye';
const fs = require('electron').remote.require('fs');
export default class IoRecorderComponent extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
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
    }
    this.initRecorder();
  }
  async initRecorder() {
    const recorderContainer = new Container(CONTAINER_MODE.recorder);
    await recorderContainer.init()
    recorderContainer.loadingFunction = this.setLoadingState.bind(this);
    this.setState({recorderContainer})
  }
  setLoadingState(loading:boolean) {
    this.setState({loading})
  }
  async startRecording() {
    this.setState({recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date()}, async ()=> {
      const { recorderContainer, startUrl } = this.state;
      await recorderContainer.record(startUrl);
      this.setState({record:true, port:recorderContainer._port})
    })

   }
   async stopRecording() {
   const totalRecordTime = moment(new Date()).diff(moment(this.state.startRecordingDateTime))
   this.setState({stopRecord: true, stopButtonDisable:true},()=>{
   const { recorderContainer } = this.state;
     (async() => {
       await recorderContainer.stopRecording();
       this.setState({record:false, stopRecord: false, openModal:true, totalRecordTime, recordButtonDisable:false})
      //  this.openSaveDialog(isWindows() ? `${appPath}\\recording.io.json` :  `${appPath}/recording.io.json`);
     })();
    })
   }

   async openSaveDialog(pathOfIoFile:string){
    const { dialog } = require('electron').remote;
    let newLocation = await dialog.showSaveDialog({'title':"Save IO file",defaultPath:`${(new Date()).toISOString()}.io.json`});
    if(newLocation.filePath) {
      fs.rename(pathOfIoFile, newLocation.filePath, ()=>{
      
      })
    }
   }
   async handleModalClosing(state:any, recordAgain?:any) {
    if(recordAgain) {
      this.setState({openModal:false})
      this.startRecording();
      return
    }
    const ioFilePath =  `${APP_CWD}recording.io.json`;
    const ioFile = JSON.parse(fs.readFileSync(ioFilePath, 'utf8'));
     ioFile["startUrl"] = this.state.startUrl
     ioFile["totalRecordTime"] = state["totalRecordTime"]
     ioFile["imageArray"] = state.imageArray
     ioFile["testSnapshots"] = []
     for (const snapshot of state.imageArray) {
       const resp:any = await getImageLowestDistanceInVideo(`${APP_CWD}player.mp4`, snapshot)
       ioFile["testSnapshots"].push({
         lowestDist:resp.dist,
         lowestDistFrame:resp.frame,
         snapshotHash:resp.snapshotHash,
         snapshotbase64:snapshot
       })
     }
     fs.writeFileSync(ioFilePath, JSON.stringify(ioFile))
     this.setState({openModal:false})
   }
   async abort() {
     const { recorderContainer } = this.state;
    this.setState({loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true})
    await recorderContainer.abort();
    this.setState({loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false})
   }
   render(){
       const {loading, record, port, stopRecord, openModal, totalRecordTime, recordButtonDisable, stopButtonDisable, imageTest} = this.state;
       return(
         <div>
           <div style={{color:"black",display:"flex",width:"100%",height:"auto"}}>
             <div className="buttons-container">
               <div className="recoreder-control-button">
               <Button size="small" variant="outlined" color="secondary" disabled={recordButtonDisable} onClick={()=>{
                   this.startRecording();
               }}>record</Button>
               </div>
               <div className="recoreder-control-button">
               <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={stopButtonDisable} onClick={()=>{
                 this.stopRecording();
               }}>stop</Button>
               </div>
               <div className="recoreder-control-button">
               <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={stopButtonDisable} onClick={()=>{
                 this.abort();
               }}>abort</Button>
               </div>
             </div>
             <div style={{width:"100%"}}>
                  <TextField disabled={recordButtonDisable} onChange={( e => this.setState({startUrl: e.target.value}))} label="URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
                 {
                 loading ? <div className="loading-container"><CircularProgress 
                 style={{ alignSelf: "center", width: "100px", height: "100px",marginBottom: "15%"}}/>
                </div> :
                     record ?  <VncViewerComponent stopRecord={stopRecord} mode="recorder" port={port}/> :
                   <div className="blank-container">
                   </div>
                 }
              </div>
           </div>
           <RecordModal totalRecordTime={totalRecordTime} open={openModal} handleModalClose={this.handleModalClosing.bind(this)}/>
         </div>
       )
   }

}

//TODO:
//Record process -
//start recording 
//build image 
//run image 
//execute jar file in image
//open vnc connection to client.
//stop recording 
//send esc command to serlize io file .
//

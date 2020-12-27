import React from 'react';
import styles from './IoPlayer.css';
import { pollAndPullIoFile, startDockerContainer, convertVideoFile, copyFileFromContainer  } from '../../utils/DockerInterface';
import VncViewerComponent from '../VncViewer/vncViewer.component';
// import { startPlayerVideoTest } from '../../utils/testIoFile';
const fs = require('fs')
export default class IoPlayerComponent extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      play: false,
      port:null
    }
  }
  async startPlaying(ioFilePath: any) {
    const ioFile = JSON.parse(fs.readFileSync(ioFilePath, 'utf8'));
    const { setLoadingMessage } = this.props;
    const { port, containerId, imageName } = await startDockerContainer('player', ioFilePath, setLoadingMessage);
    const totalRecordTime = ((ioFile["totalRecordTime"]+ 1) * 1000);
    setTimeout(()=>{
      (async ()=>{
        await convertVideoFile(containerId);
        const isPass = await startPlayerVideoTest(containerId, 'output.mp4', ioFile);
        console.log("is io file passed",isPass)
        //Do something if passed:
        //report playing another ioFile ? x
      })()

    },totalRecordTime)
    this.setState({port, play:true});
    // await pollAndPullIoFile(containerId, imageName);
    // this.setState({port:null, play:false});
  }
   async openFolder() {
    const { dialog } = require('electron').remote;
    let pathPromise = await  dialog.showOpenDialog({
      properties: ['openFile']
    });
    const file = pathPromise.filePaths[0];
    console.log('file chossen',file)
    this.startPlaying(file);
   }
   render(){
     const { port } = this.state
       return(
    <div>
      <button
        className={styles['open-folder-btn']} data-tclass="btn"  type="button"
        onClick={() => { this.openFolder(); }} >
        Open folder
      </button>
      {
         port ? <VncViewerComponent mode="player" disableClicks={true} port={port}/> : null
      }
    </div>
       )
   }

}

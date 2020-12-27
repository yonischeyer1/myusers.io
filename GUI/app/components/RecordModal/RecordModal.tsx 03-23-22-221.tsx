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
import moment from 'moment'
import { spawn } from 'child_process';
// import { IMAGE_HASH_BITS, convertURIToImageData } from '../../utils/testIoFile';


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

export default function FullScreenDialog(props:any) {
  const [screen, setScreen] = React.useState('validate');
  const videoPlayerOutputSrc = `${APP_CWD}player.mp4`
  const { open, ioFilePath, videoFilePath, totalRecordTime, recorderContainer } = props;
  const classes = useStyles();
  state["totalRecordTime"] = totalRecordTime
  const handleClose = (recordAgain = false) => {
    const {handleModalClose} = props;
    handleModalClose(state, recordAgain);
  };

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

  const continueToNextStage = () => {

  }

  const startAutoTagging = async () => {
     console.log("recordStartDate")
     let { timeStamps , recordStartDate} = recorderContainer.autoTaggerData;
    //  const recordStartDate = timeStamps[0]
     timeStamps = timeStamps.slice(1)
     debugger
    // const pressReleaseActionsArray = ioActions.filter(ioAction => ioAction.actionType === "MOUSE_PRESS" || ioAction.actionType === "MOUSE_RELEASE");
     const mappedArrayOfTimeInSecondsNotUnique = timeStamps.map((timestamp:any,index:any) => {
      let start = moment(recordStartDate)
      let end = moment(timestamp);
      let diff = end.diff(start);
      const ALMOST_FACTOR = 0.1
      // const duration = moment.duration(moment(ioAction.timestamp).diff(moment(recordStartDate)));
       const time = moment.utc(diff - ALMOST_FACTOR).format("mm:ss.SSS");//duration.asSeconds();
       return {time, actionType:`${index}`};
     })
    //  const mappedArrayOfTimeInSeconds = mappedArrayOfTimeInSecondsNotUnique.filter((item,index)=>{
    //     if(index === 0) {
    //       return item;
    //     } else if (mappedArrayOfTimeInSecondsNotUnique[index - 1].time !== item.time) {
    //       return item;
    //     }
    // })
     const videoPlayerOutputSrc = `${APP_CWD}player.mp4`
     let buildCommand = `ffmpeg -i ${videoPlayerOutputSrc}`
     for(const ioAction of mappedArrayOfTimeInSecondsNotUnique) {
      buildCommand += ` -map 0:v -ss ${ioAction.time} -frames:v 1 ${ioAction.actionType}.png `
     }
     await takeMultipleScreenShotsFromVideo(buildCommand);
     debugger
     //Load up all the images from folder.
     //Convert image file buffer to Image Date URI
     //Build Tags Array and save as Action
     //Delete files.
     
  }

  const yes = () => {
    // setScreen('test')
    startAutoTagging();
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
             screen === "validate" ?
             <div className="modal-verifaction-buttons-controls">
             <Button size="small" variant="outlined" color="secondary"  onClick={()=>{
                   handleClose(true)
                 }}>record again</Button>
                 <div className="yes-button">
  
                 <Button  size="small" variant="outlined" color="primary" onClick={()=>{
                   yes()
                 }}>yes</Button>
                 </div>
               </div> : 
                     <div className="test-controls-container">
                     <div className="screenshots-container"></div>
                     <button id="snap" onClick={snap}>Take screenshot</button>
                   </div>
           }
        </div>
      </Dialog>
    </div>
  );
}

async function autoTagAndSave() {
  //TODO:
// times -> screenshots in folder -> to dataURIs -> to tags ?
// tag = { dataURI, dataURIHash, distances} 
 
}

async function takeMultipleScreenShotsFromVideo(command:any) {
    return new Promise((resolve, reject) => {
        const someCMD = spawn(command, { shell: true})
        someCMD.on("exit",async () =>{
            resolve();
        })
    })
}
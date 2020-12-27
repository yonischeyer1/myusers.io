import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import styles from './DynamicSnapshotModal.css'


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width:200
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    userActionSelectContainer: {
      display: "flex"
    },
    doneCancelBtnsContianer: {
      display:"flex"
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
  }),
);


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


let coords:any = [] 
let perimeter:any = []
let canvas:any;
let ctx:any;
let runOnce= false

const DEFAULT_BRUSH_SIZE = 4

export default function FullScreenDialog(props:any) {
  let startDrawing = false;
  const classes = useStyles();
  const [brushSize, setBrushSize] = React.useState(DEFAULT_BRUSH_SIZE);
  const { open, dataURI } = props;
  const handleClose = () => {
    runOnce = false;
    const {handleDynamicSnapshotModalClose} = props;
    handleDynamicSnapshotModalClose(false);
  };


  const handleUndo = (e:any) => {
    ctx = undefined;
    perimeter.pop();
    start();
  }

  const handleClear = (e:any) => {
    ctx = undefined;
    perimeter = []
    coords = []
    start();
  }

  const handleSave = (e:any) => {
    const drawURI = canvas.toDataURL('image/jpeg')
    const {handleDynamicSnapshotModalSave} = props;
    handleDynamicSnapshotModalSave({tag:dataURI,coords, drawURI})
    handleClear(null)
    handleClose()
  }

  function point(x, y, zeBrushSize){
    ctx.fillStyle="red";
    ctx.strokeStyle = "red";
    ctx.fillRect(x-2,y-2, zeBrushSize,zeBrushSize);
    ctx.moveTo(x,y);
  } 

  function point_it(event) {
    startDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cord = {clientX:event.clientX, clientY:event.clientY, left:rect.left, top:rect.top, brushSize}
    coords.push(cord)
    perimeter.push({'x':x,'y':y, brushSize});
    draw(false);
    return false;
}

 function draw(end){
   ctx.lineWidth = 1;
   ctx.strokeStyle = "white";
   ctx.lineCap = "square";
   ctx.beginPath();
 
   for(let i=0; i<perimeter.length; i++) {
       ctx.moveTo(perimeter[i]['x'],perimeter[i]['y']);
       point(perimeter[i]['x'],perimeter[i]['y'], perimeter[i]['brushSize']);
   }
   ctx.stroke();
 }


function mousemoving (event) {
    if(startDrawing) {
        point_it(event)
    }
}

function stopdrawing(event) { //mouse up
    startDrawing = false;
}

function start() {
  setTimeout(()=>{
    canvas = document.getElementById("jPolygon");
    const img = new Image();
    img.src = dataURI.originalReferenceSnapshotURI;
  
    img.onload = function(){
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, 400)
}
if(!runOnce && open && dataURI) {
  console.log("!runOnce && open && dataURI clurotes", runOnce)
  runOnce = true;
  handleClear(null);
}

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Static Masking wizard 
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose()
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
        <div style={{float:"left"}}>
            <canvas id="jPolygon" width="227" height="227"  onMouseUp={stopdrawing} 
             onMouseMove={mousemoving} onMouseDown={point_it} 
             data-imgsrc={dataURI.originalReferenceSnapshotURI}>
            </canvas>
        </div>
        <div>
                <button onClick={handleUndo}>Undo</button>
                <button onClick={handleClear}>Clear</button>
                <button onClick={handleSave}>Save</button>
       </div>
       <div>
            <br/>
            Set brush size:
            <br/>
            <input type="number" value={brushSize} onChange={(e:any)=>{setBrushSize(e.target.value)}}/>
       </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}
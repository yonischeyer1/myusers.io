import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import styles from './DynamicSnapshotModal.css'


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
  const { open, dataURI } = props;
  const [state, _setState] = React.useState({
     brushSize:DEFAULT_BRUSH_SIZE
  });

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },300)
    })
  }

  const handleClose = (e:any) => {
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
    handleClose(null)
  }

  function point(x:any, y:any, zeBrushSize:any){
    ctx.fillStyle="red";
    ctx.strokeStyle = "red";
    ctx.fillRect(x-2,y-2, zeBrushSize,zeBrushSize);
    ctx.moveTo(x,y);
  } 

  async function point_it(event:any) {
    startDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cord = {clientX:event.clientX, clientY:event.clientY, left:rect.left, top:rect.top, brushSize:state.brushSize}
    coords.push(cord)
    perimeter.push({'x':x,'y':y, brushSize:state.brushSize});
    draw(false);
    return false;
}

 function draw(end:any){
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


function mousemoving (event:any) {
    if(startDrawing) {
        point_it(event)
    }
}

function stopdrawing(event:any) { //mouse up
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

 const handleBrushSizeChange = async (e:any) => {
   const newBrushSize = e.target.value
   setState({...state, brushSize:newBrushSize})
 }


 (async ()=> {
  if(!runOnce && open && dataURI) {
    runOnce = true;
    handleClear(null);
  }
 })()

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Static Masking wizard 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
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
            <input type="number" value={state.brushSize} onChange={handleBrushSizeChange}/>
       </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}
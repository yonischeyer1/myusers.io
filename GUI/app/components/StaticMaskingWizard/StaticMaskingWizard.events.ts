import { setStatePromisifed } from "../../utils/general";

const DEFAULT_BRUSH_SIZE = 4

export const DEFAULT_COMPONENT_STATE = {
    tag: {
        originalReferenceSnapshotURI:''
      },
      brushSize:DEFAULT_BRUSH_SIZE
}


let startDrawing = false;
let coords:any = [] 
let perimeter:any = []
let canvas:any;
let ctx:any;

let instance:any = null;
export default class StaticMaskingWizardEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    constructor() {
        if(instance) {
            return instance;
          }
          this.initFlag = false;
          instance = this;
          return this;
    }

    async setConstructor(state:any, setState:any, props:any) {
        this.state = state;
        this.setState = setStatePromisifed.bind(null, setState);
        this.props = props;
        if(!this.initFlag) {
           this.initFlag = true;
           await this.init();
        }
    }

    async init () {
        this.handleClear(null)
    }

    async handleClose (e:any)  {
        const { handleDynamicSnapshotModalClose } = this.props;
        handleDynamicSnapshotModalClose(false);
    }
    
    
    async handleUndo (e:any)  {
        ctx = undefined;
        perimeter.pop();
        this.start();
    }
    
    async handleClear (e:any) {
        ctx = undefined;
        perimeter = []
        coords = []
        this.start();
    }
    
    async handleSave  (e:any)  {
        const { tag } = this.state;
        const drawURI = canvas.toDataURL('image/jpeg')
        const {handleDynamicSnapshotModalSave} = this.props;
        handleDynamicSnapshotModalSave({tag,coords, drawURI})
        this.handleClear(null)
        this.handleClose(null)
    }
    
    async point(x:any, y:any, zeBrushSize:any) {
        ctx.fillStyle="red";
        ctx.strokeStyle = "red";
        ctx.fillRect(x-2,y-2, zeBrushSize,zeBrushSize);
        ctx.moveTo(x,y);
    } 
    
    async point_it(event:any) {
        startDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cord = {clientX:event.clientX, clientY:event.clientY, left:rect.left, top:rect.top, brushSize:state.brushSize}
        coords.push(cord)
        perimeter.push({'x':x,'y':y, brushSize:this.state.brushSize});
        this.draw(false);
        return false;
    }
    
    async draw(end:any) {
       ctx.lineWidth = 1;
       ctx.strokeStyle = "white";
       ctx.lineCap = "square";
       ctx.beginPath();
     
       for(let i=0; i<perimeter.length; i++) {
           ctx.moveTo(perimeter[i]['x'],perimeter[i]['y']);
           this.point(perimeter[i]['x'],perimeter[i]['y'], perimeter[i]['brushSize']);
       }
       ctx.stroke();
    }
    
    
    async mousemoving (event:any) {
        if(startDrawing) {
            this.point_it(event)
        }
    }
    
    async stopdrawing(event:any) { //mouse up
         startDrawing = false;
    }
    
    async start() {
      setTimeout(()=>{
        const { tag } = this.state;
        canvas = document.getElementById("jPolygon");
        const img = new Image();
        img.src = tag.originalReferenceSnapshotURI;
      
        img.onload = function(){
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }, 400)
     } 
    
     async handleBrushSizeChange (e:any)  {
       const newBrushSize = e.target.value
       this.setState({...this.state, brushSize:newBrushSize})
    }
}


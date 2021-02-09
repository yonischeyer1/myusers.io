import ServiceStore from "../../services /store.service";

const serviceStore = new ServiceStore();

let _state:any = null;
let _setState:any = null; 
let _props:any = null;

let startDrawing = false;
let coords:any = [] 
let perimeter:any = []
let canvas:any;
let ctx:any;

export default class StaticMaskingWizardEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async init () {
        this.handleClear(null)
    }

    async handleClose (e:any)  {
        const { handleDynamicSnapshotModalClose } = _props;
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
        const { dataURI } = _props;
        const drawURI = canvas.toDataURL('image/jpeg')
        const {handleDynamicSnapshotModalSave} = _props;
        handleDynamicSnapshotModalSave({tag:dataURI,coords, drawURI})
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
        perimeter.push({'x':x,'y':y, brushSize:_state.brushSize});
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
        const { dataURI } = _props;
        canvas = document.getElementById("jPolygon");
        const img = new Image();
        img.src = dataURI.originalReferenceSnapshotURI;
      
        img.onload = function(){
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }, 400)
     } 
    
     async handleBrushSizeChange (e:any)  {
       const newBrushSize = e.target.value
       _setState({..._state, brushSize:newBrushSize})
    }
}


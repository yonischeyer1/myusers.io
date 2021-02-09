import ServiceStore from "../../services /store.service";


let _state:any = null;
let _setState:any = null; 
let _props:any = null;


export default class PlayerLiveViewModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose  (e:any) {
        const {handleLivePreviewModalClose} = _props;
        handleLivePreviewModalClose(false);
    }

    
}


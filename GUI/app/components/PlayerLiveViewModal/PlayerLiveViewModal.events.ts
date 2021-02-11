import { setStatePromisifed } from "../../utils/general";


export default class PlayerLiveViewModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    constructor() {}

    async setConstructor(state:any, setState:any, props:any) {
       this.state = state;
       this.setState = setStatePromisifed.bind(null, setState);
       this.props = props;
       if(!this.initFlag) {
          this.initFlag = true;
          await this.init();
       }
    }
 
    async init() {
 
    }

    async handleClose  (e:any) {
        const {handleLivePreviewModalClose} = this.props;
        handleLivePreviewModalClose(false);
    }

    
}


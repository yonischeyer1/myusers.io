import { setStatePromisifed } from "../../utils/general";


let instance:any = null
export default class PlayerLiveViewModalEvents {
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
 
    async init() {
        const { open, port, stopPlaying } = this.props;
        this.setState({...this.state, open, port, stopPlaying})
    }

    async handleClose  (e:any) {
        const {handleLivePreviewModalClose} = this.props;
        handleLivePreviewModalClose(false);
    }

    
}


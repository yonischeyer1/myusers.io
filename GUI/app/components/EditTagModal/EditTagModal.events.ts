import { setStatePromisifed } from "../../utils/general";


let instance:any = null;
export default class EditTagModalEvents {
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
    const { tag } = this.props;
    await this.setState({...this.state, tag})
   }

    async handleClose (e:any)  {
        const {handleEditTagModalClose} = this.props;
        handleEditTagModalClose(false);
    };
    
    async handleSetTimeoutChange  (e:any) {
          const label = e.target.value
          const tag = this.state.tag
          tag.waitTime.label = label;
          await this.setState({...this.state, tag})
      };
    
    async handleCustomWaitTimeChange (e:any)  {
        const value = e.target.value
        const tag = this.state.tag
        tag.waitTime.value = value
        await this.setState({...this.state, tag})
      }
    
    async handleSkipChange (e:any) {
        const skip = e.target.checked
        const tag = this.state.tag
        tag.skip = skip
        await this.setState({...this.state, tag})
    }

    async handleTagImageClick (tag:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:true, dynamicSnapshotModalData:tag})
    }

    async handleDynamicSnapshotModalSave ({tag, coords, drawURI}) {
        tag["dynamic"] = {coords, drawURI}
    }
    
    async handleDynamicSnapshotModalClose (e:any)  {
        await this.setState({...this.state, dynamicSnapshotOpen:false}) 
    }

    async save (e:any) {
        const { handleEditTagSave } = this.props
        handleEditTagSave(this.state);
    }
    
}


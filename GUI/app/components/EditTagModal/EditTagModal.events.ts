import ServiceStore from "../../services /store.service";


let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();

export default class EditTagModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }
    async handleClose (e:any)  {
        const {handleEditTagModalClose} = _props;
        handleEditTagModalClose(false);
    };
    
    async handleSetTimeoutChange  (e:any) {
          const label = e.target.value
          const tag = _state.tag
          tag.waitTime.label = label;
          await _setState({..._state, tag})
      };
    
    async handleCustomWaitTimeChange (e:any)  {
        const value = e.target.value
        const tag = _state.tag
        tag.waitTime.value = value
        await _setState({..._state, tag})
      }
    
    async handleSkipChange (e:any) {
        const skip = e.target.checked
        const tag = _state.tag
        tag.skip = skip
        await _setState({..._state, tag})
    }

    async handleTagImageClick (tag:any) {
        await _setState({..._state, dynamicSnapshotOpen:true, dynamicSnapshotModalData:tag})
    }

    async handleDynamicSnapshotModalSave ({tag, coords, drawURI}) {
        tag["dynamic"] = {coords, drawURI}
    }
    
    async handleDynamicSnapshotModalClose (e:any)  {
        await _setState({..._state, dynamicSnapshotOpen:false}) 
    }

    async save (e:any) {
        const { handleEditTagSave } = _props
        handleEditTagSave(_state);
    }
    
}


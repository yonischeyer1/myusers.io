import ServiceStore from "../../services /store.service";

let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();
export default class ActionsUpsertModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose (e:any)  {
        const {handleUpsertActionModalClose} = _props;
        handleUpsertActionModalClose(false);
    };
    
    async handleDeletePopupClose (e:any) {
        await _setState({..._state, itemAndCollectionNameToDelete:false, openDeletePopup:false})
      }
    
    async handleEditTagModalClose (e:any) {
        await _setState({..._state, openEditTagModal:false, zeTag:null})
    }
     
    async handleRecordingModalClose () {
        await _setState({..._state, openRecordingModal:false})
    }
    
    async handleRecordBtnClick  (e:any) {
        await _setState({..._state, openRecordingModal:true})
    }

    async handleDynamicSnapshotModalSave ({tag, coords, drawURI}) {
        tag["dynamic"] = {coords, drawURI}
    }

    async handleDynamicSnapshotModalClose (e:any) {
        await _setState({..._state, dynamicSnapshotOpen:false})
    }

    async handleActionNameChange (e:any) {
        const key = "actionName"
        const newActionName = e.target.value
        await _setState({..._state, actionName:newActionName})
        serviceStore.upsertAppStateValue(key, newActionName)
    }

    async handleAddLiveSnapshotClick (e:any) {

    }

    async editTag (tag:any) {
        await _setState({..._state, zeTag:tag, openEditTagModal:true})
    }

    async deleteTag (collectionName:any, item:any) {
        await _setState({..._state, openDeletePopup:true ,itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
    }
    
    async handleTagMenuItemClick (e: any, index: number,tag:any)  {
      switch (index) {
        case 0:
          this.editTag(tag);
        break;
    
        case 1:
          return;
          //deleteTag('users', user)
        break;
      
        default:
          break;
      }
    };

    async saveCurrentActionTags (e:any) {
        const { pickedAction } = _props;
        const actions = serviceStore.readDocs('actions')
        actions[pickedAction.id].tags = pickedAction.tags;
        serviceStore.updateDocs('actions', actions);
    }
    
}


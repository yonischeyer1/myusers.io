import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";

const serviceStore = new ServiceStore();
let instance:any = null;
export default class ActionsUpsertModalEvents {
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
       const { open, pickedAction } = this.props;
       this.setState({...this.state, open, pickedAction})
    }
  

    async handleClose (e:any)  {
        const {handleUpsertActionModalClose} = this.props;
        handleUpsertActionModalClose(false);
    };
    
    async handleDeletePopupClose (e:any) {
        await this.setState({...this.state, itemAndCollectionNameToDelete:false, openDeletePopup:false})
      }
    
    async handleEditTagModalClose (e:any) {
        await this.setState({...this.state, openEditTagModal:false, zeTag:null})
    }
     
    async handleRecordingModalClose () {
        await this.setState({...this.state, openRecordingModal:false})
    }
    
    async handleRecordBtnClick  (e:any) {
        await this.setState({...this.state, openRecordingModal:true})
    }

    async handleDynamicSnapshotModalSave ({tag, coords, drawURI}) {
        tag["dynamic"] = {coords, drawURI}
    }

    async handleDynamicSnapshotModalClose (e:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:false})
    }

    async handleActionNameChange (e:any) {
        const key = "actionName"
        const newActionName = e.target.value
        await this.setState({...this.state, actionName:newActionName})
        serviceStore.upsertAppStateValue(key, newActionName)
    }

    async handleAddLiveSnapshotClick (e:any) {

    }

    async editTag (tag:any) {
        await this.setState({...this.state, zeTag:tag, openEditTagModal:true})
    }

    async deleteTag (collectionName:any, item:any) {
        const { currentUserPicked } = this.state;
        await this.setState({...this.state, openDeletePopup:true ,itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
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
        const { pickedAction } = this.props;
        const actions = serviceStore.readDocs('actions')
        actions[pickedAction.id].tags = pickedAction.tags;
        serviceStore.updateDocs('actions', actions);
    }
    
}


import { Action, Tag, TagType } from "../../models/Action.model";
import ServiceStore from "../../services /store.service";
import { removeContainerByName } from "../../utils/IHost";


let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();

const SCREENS =  { validate:'validate', setTagsMaxTimeoutScreen: 'setTagsMaxTimeoutScreen' }

let saveThis:any = null 

export default class RecordValidationModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose  (e:any)  {
        const {handleModalClose} = _props;
        handleModalClose(..._state, false);
    };
    
    async handleLivePreviewModalClose (e:any)  {
        await _setState({..._state, liveViewPortModalOpen:false});
    }
    
    async handleDynamicSnapshotModalClose (e:any) {
        await _setState({..._state, dynamicSnapshotOpen:false});
    }
    
    async handleTagTimeoutChange (e:any, tagChanged:any) {
        const value = e.target.value
        const newTags = _state.tagsPresent.map((tag:any)=>{
          if(tag.hash === tagChanged.hash) {
             tag.maxWaitTimeUntilFail = value;
          }
          return tag;
        })
        await _setState({..._state, tagsPresent:newTags})
      }
    
      async handleDynamicSnapshotModalSave ({tag, coords})  {
         tag["dynamic"] = {coords}
      }
    
      async startAutoTagging () {
         const { recorderContainer } = _props;
         let { timeStamps } = recorderContainer.autoTaggerData;
         const tags: Tag[] = [];
         for(let bbb = 0; bbb < timeStamps; bbb++) {
           tags.push({
             type: TagType.NOROMAL,
             originalReferenceSnapshotURI: "",
             distances:[0],
             waitTime: -1,
             hash:"",
             skip:false,
             name:`tag-${bbb}`
           })
         }
         return tags;
      }
    
      async userValidatedIoActions (e:any)  {
        const { recorderContainer } = _props;
        const tags = await this.startAutoTagging();
        const action = {
          tagHashFillFlag:true,
          ioActions:recorderContainer._ioActions,
          tags
        }
        const actionWithHashes = await recorderContainer.playRecorderAction(action,async ()=>{
          await _setState({..._state, liveViewPort:recorderContainer._port, liveViewPortModalOpen:true})
        })
        saveThis = {tags: actionWithHashes.tags, ioActions:actionWithHashes.ioActions} 
        await removeContainerByName(recorderContainer._containerName)
        await _setState({..._state, tagsPresent:actionWithHashes.tags, screen:SCREENS.setTagsMaxTimeoutScreen})
      }
    
      async handleTagImageClick (tag:any)  {
          await _setState({..._state, dynamicSnapshotModalData:tag, dynamicSnapshotOpen:true})
      }
    
      async saveTags(tags:any, ioActions:any) {
        const users = serviceStore.readDocs('users');
        const currentUser = serviceStore.getAppStateValue('currentUser')
        const actionName = serviceStore.getAppStateValue('actionName')
        const startUrl = serviceStore.getAppStateValue('startUrl')
        const actionToInsert:Action = {
          name: actionName,
          ioActions,
          tags,
          startUrl
        }
        const newActionId = serviceStore.createDoc('actions', actionToInsert)
        users[currentUser.id].actionsIds.push(newActionId);
        serviceStore.updateDocs('users', users)
        serviceStore.upsertAppStateValue('currentUser', null)
        serviceStore.upsertAppStateValue('userName',null)
    }
}


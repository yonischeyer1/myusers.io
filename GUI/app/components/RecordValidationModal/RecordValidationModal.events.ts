import { Action, Tag, TagType } from "../../models/Action.model";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";
import { removeContainerByName } from "../../utils/IHost";

const serviceStore = new ServiceStore();
export const DEFAULT_COMPONENT_STATE = {
  open:false,
  recorderContainer:null,
  totalRecordTime:null,
  liveViewPort:null,
  liveViewPortModalOpen:false,
  dynamicSnapshotModalData:null,
  dynamicSnapshotOpen:null,
  screen:null,
  tagsPresent:[],
  saveThis:null,
}

const SCREENS =  { validate:'validate', setTagsMaxTimeoutScreen: 'setTagsMaxTimeoutScreen' }

let instance:any = null
export default class RecordValidationModalEvents {
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
       if(!this.initFlag && this.props.open) {
          this.initFlag = true;
          await this.init();
       }
    }
 
    async init() {
      const { open, recorderContainer, totalRecordTime } = this.props;
      await this.setState({...this.state, open, recorderContainer, totalRecordTime})
    }



    async handleClose  (e:any)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleModalClose} = this.props;
        handleModalClose(...this.state, false);
        this.initFlag = false;
    };
    
    async handleLivePreviewModalClose (e:any)  {
        await this.setState({...this.state, liveViewPortModalOpen:false});
    }
    
    async handleDynamicSnapshotModalClose (e:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:false});
    }
    
    async handleTagTimeoutChange (e:any, tagChanged:any) {
        const value = e.target.value
        const newTags = this.state.tagsPresent.map((tag:any)=>{
          if(tag.hash === tagChanged.hash) {
             tag.maxWaitTimeUntilFail = value;
          }
          return tag;
        })
        await this.setState({...this.state, tagsPresent:newTags})
      }
    
      async handleDynamicSnapshotModalSave ({tag, coords})  {
         tag["dynamic"] = {coords}
      }
    
      async startAutoTagging () {
         const { recorderContainer } = this.props;
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
        const { recorderContainer } = this.props;
        const tags = await this.startAutoTagging();
        const action = {
          tagHashFillFlag:true,
          ioActions:recorderContainer._ioActions,
          tags
        }
        const actionWithHashes = await recorderContainer.playRecorderAction(action,async ()=>{
          await this.setState({...this.state, liveViewPort:recorderContainer._port, liveViewPortModalOpen:true})
        })
        this.setState({...this.state, saveThis:{tags: actionWithHashes.tags, ioActions:actionWithHashes.ioActions} })
        await removeContainerByName(recorderContainer._containerName)
        await this.setState({...this.state, tagsPresent:actionWithHashes.tags, screen:SCREENS.setTagsMaxTimeoutScreen})
      }
    
      async handleTagImageClick (tag:any)  {
          await this.setState({...this.state, dynamicSnapshotModalData:tag, dynamicSnapshotOpen:true})
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


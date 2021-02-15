import moment from "moment";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";
import { removeContainerByName } from "../../utils/IHost";
import {Account} from '../../models/Account.model'


const serviceStore = new ServiceStore();

export const DEFAULT_COMPONENT_STATE = {
    open:false,
    record: false,
    port: null,
    loading:false,
    stopRecord:false,
    openRecordModal:false,
    videoFilePath:null,
    totalRecordTime:null,
    recorderContainer:null,
    recordButtonDisable:false,
    stopButtonDisable:true,
    startRecordingDateTime:null, 
}

let instance:any = null
export default class RecordingModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    isLoginMode:boolean = false
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
       this.isLoginMode = serviceStore.getAppStateValue('isLoginMode');
       if(!this.initFlag) {
          this.initFlag = true;
          await this.init();
       }
    }
 
    async init() {
        const { open } = this.props;
        await this.setState({...this.state, open})
    }

    async startLogin (e:any)  {
        const user = serviceStore.getAppStateValue('currentUser');
        const loginURL = serviceStore.getAppStateValue('loginURL')
        const loginContainer = new Container(CONTAINER_MODE.login);
        await loginContainer.init()
        loginContainer.loadingFunction = this.setLoadingState;
        await loginContainer.login(loginURL, user.id)
        await this.setState({...this.state,record:true, port:loginContainer._port,
          recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:loginContainer})
     }
    
    async handleClose (e:any) {
        this.initFlag = false;
        const loginContainer:any = this.state.recorderContainer;
        if(loginContainer) {
          await removeContainerByName(loginContainer._containerName)
        }
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const {handleRecordingModalClose} = this.props;
        handleRecordingModalClose(false);
    };
    async initRecorder  () {
        const user = serviceStore.getAppStateValue('currentUser')
        const recorderContainer = new Container(CONTAINER_MODE.recorder);
        await recorderContainer.init()
        recorderContainer.loadingFunction = this.setLoadingState;
        await recorderContainer.record(this.state.startUrl, user.id)
        serviceStore.upsertAppStateValue('startUrl', this.state.startUrl)
        await this.setState({...this.state,record:true, port:recorderContainer._port,
            recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:recorderContainer})
      }
     async setLoadingState (loading:boolean)  {
        await this.setState({...this.state,loading})
     }
     async startRecording () {
        await this.initRecorder()
     }
     async stopRecording (e:any) {
          const totalRecordTime = moment(new Date()).diff(moment(this.state.startRecordingDateTime))
          const { recorderContainer } = this.state;
          await this.setState({...this.state,stopRecord: true, stopButtonDisable:true});
          setTimeout(async ()=>{
           await recorderContainer.stopRecording();
           await this.setState({...this.state, record:false, stopRecord: false, openModal:true, totalRecordTime, recordButtonDisable:false})
          },2000)
    }
    async handleModalClosing (state?:any, recordAgain?:any) {
        if(recordAgain) {
            await this.setState({...state, openModal:false})
            this.startRecording();
            return
          }
          await this.setState({...state, openModal:false})
    }

    async abort (e:any) {
        await this.setState({...this.state, loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true})
        await this.setState({...this.state, loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false})
    }

    async finishLogin (e:any) {
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const {handleRecordingModalClose} = this.props
        const user = serviceStore.getAppStateValue('currentUser')
        const loginContainer = this.state.recorderContainer;
        const userId:any = await this.saveAccount() 
        await loginContainer.finishLogin(user.id, userId);
        await removeContainerByName(loginContainer._containerName)
        handleRecordingModalClose()
    }

    async handleURLChange (e:any) {
        await this.setState({...this.state, startUrl: e.target.value})
    }

    async saveAccount () {
        const users:any = serviceStore.readDocs('users');
        const currentUser = serviceStore.getAppStateValue('currentUser')
        const accountName = serviceStore.getAppStateValue('accountName')
        const loginURL = serviceStore.getAppStateValue('loginURL')
        const accountToInsert:Account = {
          name: accountName,
          loginURL
        }
        const createdAccountId:any = serviceStore.createDoc('accounts', accountToInsert);
        let userIdToReturn = null;
        userIdToReturn = currentUser.id
        users[currentUser.id].accountsIds.push(createdAccountId)
        serviceStore.updateDocs('users', users)
        return userIdToReturn
    }

}


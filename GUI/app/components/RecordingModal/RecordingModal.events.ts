import moment from "moment";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";
import { removeContainerByName } from "../../utils/IHost";
import { Account, createAndSaveAccount } from '../../models/Account.model'

import { createDummyUser } from '../../models/User.model'


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
    currentUserPicked:null,
    loginURL:'',
    accountName:'',
    actionName:'',
    startUrl:''
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
       if(!this.initFlag && this.props.open) {
          this.initFlag = true;
          await this.init();
       }
    }
 
    async init() {
        let { open, currentUserPicked, accountName, loginURL, actionName } = this.props;
        if(!currentUserPicked.id) {
            currentUserPicked = createDummyUser(currentUserPicked.name)
        }
        await this.setState({
            ...this.state, 
            actionName,
            open, 
            currentUserPicked, 
            accountName, 
            loginURL
        })
    }

    async handleClose (e:any) {
        const loginContainer:any = this.state.recorderContainer;
        if(loginContainer) {
          await removeContainerByName(loginContainer._containerName)
        }
        await this.setState({...DEFAULT_COMPONENT_STATE})
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const {handleRecordingModalClose} = this.props;
        handleRecordingModalClose(false);
        this.initFlag = false;
    };


    async setLoadingState (loading:boolean)  {
        await this.setState({...this.state, loading})
    }

    async abort (e:any) {
        await this.setState({...this.state, loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true})
        await this.setState({...this.state, loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false})
    }

    async handleURLChange (e:any) {
        await this.setState({...this.state, startUrl: e.target.value})
    }

    async initRecorder  (e:any) {
        const { currentUserPicked, startUrl } = this.state;
        const recorderContainer = new Container(CONTAINER_MODE.recorder);
        await recorderContainer.init()
        recorderContainer.loadingFunction = this.setLoadingState.bind(this);
        await recorderContainer.record(startUrl, currentUserPicked.id)
        serviceStore.upsertAppStateValue('startUrl', startUrl)
        await this.setState({
            ...this.state,
            record:true, 
            port:recorderContainer._port,
            recordButtonDisable:true, 
            stopButtonDisable:false,
            startRecordingDateTime:new Date(),
            recorderContainer:recorderContainer,
        })
    }

    async startLogin (e:any)  {
        const { currentUserPicked, loginURL } = this.state;
        const loginContainer = new Container(CONTAINER_MODE.login);
        await loginContainer.init()
        loginContainer.loadingFunction = this.setLoadingState.bind(this);
        await loginContainer.login(loginURL, currentUserPicked.id)
        await this.setState({...this.state,record:true, port:loginContainer._port,
          recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:loginContainer})
    }

    async finishLogin (e:any) {
        const { recorderContainer, accountName, loginURL, currentUserPicked} = this.state;
        const { handleRecordingModalClose } = this.props
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const userId:any = await createAndSaveAccount(currentUserPicked, {accountName, loginURL}) 
        await recorderContainer.finishLogin(currentUserPicked.id, userId);
        await removeContainerByName(recorderContainer._containerName)
        handleRecordingModalClose()
    }

    async stopRecording (e:any) {
          const totalRecordTime = moment(new Date()).diff(moment(this.state.startRecordingDateTime))
          const { recorderContainer } = this.state;
          await this.setState({...this.state,stopRecord: true, stopButtonDisable:true});
          setTimeout(async ()=>{
           await recorderContainer.stopRecording();
           await this.setState({
               ...this.state, 
               record:false, 
               stopRecord: false, 
               openRecordModal:true, 
               totalRecordTime, 
               recordButtonDisable:false,
               port:null
            })
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


}


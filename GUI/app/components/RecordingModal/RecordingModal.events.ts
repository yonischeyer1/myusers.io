import moment from "moment";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";
import { removeContainerByName } from "../../utils/IHost";


let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();

export default class RecordingModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async startLogin (e:any)  {
        const user = serviceStore.getAppStateValue('currentUser');
        const loginURL = serviceStore.getAppStateValue('loginURL')
        const loginContainer = new Container(CONTAINER_MODE.login);
        await loginContainer.init()
        loginContainer.loadingFunction = setLoadingState;
        await loginContainer.login(loginURL, user.id)
        await _setState({..._state,record:true, port:loginContainer._port,
          recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:loginContainer})
     }
    
    async handleClose (e:any) {
        loginFlagOnce = false;
        const loginContainer:any = _state.recorderContainer;
        if(loginContainer) {
          await removeContainerByName(loginContainer._containerName)
        }
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const {handleRecordingModalClose} = _props;
        handleRecordingModalClose(false);
    };
    async initRecorder  () {
        const user = serviceStore.getAppStateValue('currentUser')
        const recorderContainer = new Container(CONTAINER_MODE.recorder);
        await recorderContainer.init()
        recorderContainer.loadingFunction = setLoadingState;
        await recorderContainer.record(_state.startUrl, user.id)
        serviceStore.upsertAppStateValue('startUrl', _state.startUrl)
        await _setState({..._state,record:true, port:recorderContainer._port,
            recordButtonDisable:true, stopButtonDisable:false,startRecordingDateTime:new Date(),recorderContainer:recorderContainer})
      }
     async setLoadingState (loading:boolean)  {
        await _setState({..._state,loading})
     }
     async startRecording () {
        await this.initRecorder()
     }
     async stopRecording (e:any) {
          const totalRecordTime = moment(new Date()).diff(moment(_state.startRecordingDateTime))
          const { recorderContainer } = _state;
          await _setState({..._state,stopRecord: true, stopButtonDisable:true});
          setTimeout(async ()=>{
           await recorderContainer.stopRecording();
           await _setState({..._state, record:false, stopRecord: false, openModal:true, totalRecordTime, recordButtonDisable:false})
          },2000)
    }
    async handleModalClosing (state?:any, recordAgain?:any) {
        if(recordAgain) {
            await _setState({...state, openModal:false})
            this.startRecording();
            return
          }
          await _setState({...state, openModal:false})
    }

    async abort (e:any) {
        await _setState({..._state, loading:true, record:false, stopRecord: true, recordButtonDisable:true, stopButtonDisable:true})
        await _setState({..._state, loading:false, record:false, recordButtonDisable:false, stopButtonDisable:true, stopRecord:false})
    }

    async finishLogin (e:any) {
        serviceStore.upsertAppStateValue('isLoginMode', false)
        const {handleRecordingModalClose} = _props
        const user = serviceStore.getAppStateValue('currentUser')
        const loginContainer = _state.recorderContainer;
        const userId:any = await this.saveAccount() 
        await loginContainer.finishLogin(user.id, userId);
        await removeContainerByName(loginContainer._containerName)
        handleRecordingModalClose()
    }

    async handleURLChange (e:any) {
        await _setState({..._state, startUrl: e.target.value})
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


    async isLoginMode () {
        const isLoginMode:any = serviceStore.getAppStateValue('isLoginMode')
        if(open && isLoginMode && !loginFlagOnce) {
            loginFlagOnce = true;
            startLogin(null);
         }
    }
}


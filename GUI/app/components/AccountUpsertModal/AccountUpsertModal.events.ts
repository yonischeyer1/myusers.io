import ServiceStore from "../../services /store.service";

let _state:any = null;
let _setState:any = null; 
let _props:any = null

const serviceStore = new ServiceStore();
export default class AccountUpsertModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose (e:any)  {
        const {handleUpsertAccountModalClose} = _props;
        handleUpsertAccountModalClose(false);
    }
    
    async handleRecordingModalClose () {
        await _setState({..._state,openRecordingModal:false});
        const {handleUpsertAccountModalClose} = _props;
        handleUpsertAccountModalClose(false);
    }
    
    async handleAccountNameChange (e:any)  {
        const key = "accountName"
        const newAccountName = e.target.value
        await _setState({..._state, accountName:newAccountName})
        serviceStore.upsertAppStateValue(key, newAccountName)
    }
    
    async handleLoginUrlChange  (e:any)  {
        const key = "loginURL"
        const newLoginUrl = e.target.value
        await _setState({..._state, loginURL:newLoginUrl})
        serviceStore.upsertAppStateValue(key, newLoginUrl)
      }
    
    async handleLoginClick (e:any)  {
        serviceStore.upsertAppStateValue('isLoginMode', true)
        await _setState({..._state, openRecordingModal:false});
    }

    async handleCancelBtnClick (e:any) {

    }

    async handleDoneBtnClick (e:any) {
        
    }
    
}


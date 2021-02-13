import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";

const serviceStore = new ServiceStore();

let instance:any = null
export default class AccountUpsertModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    anchorRef:any
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
       
    }

    async handleClose (e:any)  {
        const {handleUpsertAccountModalClose} = this.props;
        handleUpsertAccountModalClose(false);
    }
    
    async handleRecordingModalClose () {
        await this.setState({...this.state,openRecordingModal:false});
        const {handleUpsertAccountModalClose} = this.props;
        handleUpsertAccountModalClose(false);
    }
    
    async handleAccountNameChange (e:any)  {
        const key = "accountName"
        const newAccountName = e.target.value
        await this.setState({...this.state, accountName:newAccountName})
        serviceStore.upsertAppStateValue(key, newAccountName)
    }
    
    async handleLoginUrlChange  (e:any)  {
        const key = "loginURL"
        const newLoginUrl = e.target.value
        await this.setState({...this.state, loginURL:newLoginUrl})
        serviceStore.upsertAppStateValue(key, newLoginUrl)
      }
    
    async handleLoginClick (e:any)  {
        serviceStore.upsertAppStateValue('isLoginMode', true)
        await this.setState({...this.state, openRecordingModal:false});
    }

    async handleCancelBtnClick (e:any) {

    }

    async handleDoneBtnClick (e:any) {
        
    }
    
}


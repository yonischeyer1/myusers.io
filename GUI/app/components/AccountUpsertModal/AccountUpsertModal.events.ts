import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";


export const DEFAULT_COMPONENT_STATE = {
    open:false,
    openRecordingModal:false,
    accountName:{value:'', disabled:false},
    loginURL:{value:'', disabled:false},
    currentUserPicked:null
}


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
         if(!this.initFlag && this.props.open) {
            this.initFlag = true;
            await this.init();
         }
      }
  
    async init () {
        const { pickedAccount, open,  currentUserPicked} = this.props;
        if(pickedAccount) { 
           await this.setState({
            ...this.state, 
            accountName:pickedAccount.name, 
            loginURL:pickedAccount.loginURL, 
            open, 
            currentUserPicked
          })
        } else {
            await this.setState({...this.state, open, currentUserPicked})
        }
    }

    async handleClose (e:any)  {
        await this.setState({...DEFAULT_COMPONENT_STATE})
        const {handleUpsertAccountModalClose} = this.props;
        handleUpsertAccountModalClose(false);
        this.initFlag = false;
    }
    
    async handleRecordingModalClose () {
        await this.setState({...this.state, openRecordingModal:false});
        this.handleClose(null);
    }
    
    async handleAccountNameChange (e:any)  {
        const newAccountName = e.target.value
        await this.setState({
            ...this.state, 
            accountName:{value:newAccountName, disabled:false}
        })
    }
    
    async handleLoginUrlChange  (e:any)  {
        const newLoginUrl = e.target.value
        await this.setState({
            ...this.state, 
            loginURL:{value:newLoginUrl, disabled:false}
        })
    }
    
    async handleLoginClick (e:any)  {
        await this.setState({...this.state, openRecordingModal:true});
    }

    async handleCancelBtnClick (e:any) {
        this.handleClose(false);
    }

    async handleDoneBtnClick (e:any) {
        
    }
    
}


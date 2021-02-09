import { User } from "../../models/User.model";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";


const serviceStore = new ServiceStore();

const serviceEventEmitter = serviceStore.getEventEmitter();


let instance :any = null;
export default class UserUpsertModalEvents {
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
         this.setState = setStatePromisifed.bind(setState);
         this.props = props;
         if(!this.initFlag) {
            this.initFlag = true;
            await this.init();
         }
        if(!serviceEventEmitter) {
            serviceEventEmitter.on(`DB-reread-users`,()=> {
                this.setState({...this.state, accountsView:this.readUserAccounts()});
                this.setState({...this.state, actionsView:this.readUserActions()});
            });
        }
    }

    async init () {
        const currentUserPicked = this.props.currentUserPicked;
        const accounts =  this.readUserAccounts();
        const actions =  this.readUserActions();
        await this.setState({...this.state, currentUserPicked:currentUserPicked 
            ,accountsView:accounts, actionsView:actions}) 
        serviceStore.getEventEmitter().on(`DB-reread-users`,()=> {
          this.setState({...this.state, accountsView:accounts});
          this.setState({...this.state, actionsView:actions});
      });
    }

    async handleClose (e:any)  {
        this.initFlag = false;
        const {handleUpsertUserModalClose} = this.props;
        handleUpsertUserModalClose(false);
        await this.setState({...this.state, accountsView:[], actionsView:[], userNameView:''});
    }

    readUserAccounts ()  {
        const { currentUserPicked } = this.state
        const users = serviceStore.readDocs('users')
        if(currentUserPicked) {
          const user = users[currentUserPicked.id]
          if(user.accountsIds.length > 0) {
          const accounts = serviceStore.readDocs('accounts')
            let temp = []
            for(const acccountId of user.accountsIds) {
              temp.push(accounts[acccountId])
            }
            return temp;
          } else {
            return []
          }
        }
        return [];
    }
    
    readUserActions  ()  { 
        const { currentUserPicked } = this.state
        const users = serviceStore.readDocs('users')
        if(currentUserPicked) {
          const user = users[currentUserPicked.id]
          if(user.actionsIds.length > 0) {
          const actions = serviceStore.readDocs('actions')
          let temp = []
          for(const actionId of user.actionsIds) {
            temp.push(actions[actionId])
          }
          return temp;
         } else {
           return []
         }
       }
       return []
    }
      
    
    async deleteAccountOrAction  (collectionName:any, item:any)  {
        await this.setState({...this.state, openDeletePopup:true, itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
    }
    
    async handleDeletePopupClose  (e:any) {
        await this.setState({...this.state, itemAndCollectionNameToDelete:null, openDeletePopup:false})
    }
    
    async handleUpsertAccountModalClose  (e:any) {
        await this.setState({...this.state, openUpsertAccountModal:false})
    }
    
    async handleUpsertActionModalClose  (e:any) {
        await this.setState({...this.state, openUpsertActionModal:false})
    }
    
    async handleChange  (event: React.ChangeEvent<{}>, newValue: number)  {
        await this.setState({...this.state, tabIndex:newValue})
    }
    
    async handleUserNameChange (e:any)  {
        const currentUserPicked = this.props.currentUserPicked;
        const users = serviceStore.readDocs('users')
        const userNameKey = "userName"
        const newUserName = e.target.value
        await this.setState({...this.state, userNameView:newUserName});
        serviceStore.upsertAppStateValue(userNameKey, newUserName);
        if(this.props.currentUserPicked) {
          users[currentUserPicked.id].name = newUserName
          serviceStore.updateDocs('users', users)
        }
    }
    
    async editAction  (action:any)  {
         await this.setState({...this.state, openUpsertActionModal:true, pickedAction:action});
    }
    
    async editAccount  (account:any)  {
        await this.setState({...this.state, openUpsertAccountModal:account, pickedAccount:account})
    }
    
    async handleFloatingButtonClick (e:any)  {
        if(!this.props.currentUserPicked) {
          const userName = serviceStore.getAppStateValue('userName');
          const userToInsert:User = {
            name:userName,
            accountsIds:[],
            actionsIds:[]
          }
          const userId = serviceStore.createDoc('users', userToInsert);
          userToInsert["id"] = userId;
          serviceStore.upsertAppStateValue('currentUser', userToInsert);
        }
        if(this.state.tabIndex === 0) {
          await this.setState({...this.state, pickedAccount:null, openUpsertAccountModal: !this.state.openUpsertAccountModal})
        } else {
          await this.setState({...this.state, pickedAction:null, openUpsertActionModal: !this.state.openUpsertActionModal})
        }
    }

}


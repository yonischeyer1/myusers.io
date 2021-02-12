import { User } from "../../models/User.model";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";


const serviceStore = new ServiceStore();

let initFlag:boolean = false;
export default class UserUpsertModalEvents {
    initFlag:any
    setState:any
    state:any
    props:any

    constructor() {}

    async setConstructor(state:any, setState:any, props:any) {
         this.state = state;
         this.setState = setStatePromisifed.bind(null, setState);
         this.props = props;
         if(this.props.open && !initFlag) {
            initFlag = true;
            await this.init();
         }
    }

    async init () {
        const { currentUserPicked } = this.props;
        const accounts =  this.readUserAccounts();
        const actions =  this.readUserActions();
        if(currentUserPicked) {
          await this.setState({...this.state, currentUserPicked, 
            accountsView:accounts, actionsView:actions})  
        } else {
          await this.setState({...this.state, currentUserPicked:{name:''}, 
            accountsView:accounts, actionsView:actions})  
        }
    }

    async handleClose (e:any)  {
        initFlag = false;
        const {handleUpsertUserModalClose} = this.props;
        handleUpsertUserModalClose(false);
        await this.setState({...this.state, accountsView:[], actionsView:[], currentUserPicked:null});
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


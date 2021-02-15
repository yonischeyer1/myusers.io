import ServiceStore from "../../services /store.service";
import { APP_CWD, setStatePromisifed } from "../../utils/general";
import { removeUserSessionFolder } from "../../utils/IHost";

export const DEFAULT_COMPONENT_STATE = {
  itemAndCollectionName: {
    item: {
      name:''
    },
    collectionName: ''
 }
}

const serviceStore = new ServiceStore();
let instance:any = null;

export default class ActionsDropdownEvents {
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
       if(!this.initFlag && this.props.itemAndCollectionName) {
          this.initFlag = true;
          await this.init();
       }
    }

    async init () {
      const { itemAndCollectionName } = this.props;
       await this.setState({...this.state, itemAndCollectionName})
    }

    async handleClose (e:any) {
        await this.setState({...this.state, itemAndCollectionName:{
          item:{name:''},collectionName:''
        }})
        const {handleDeletePopupClose} = this.props;
        handleDeletePopupClose(false);
    };
    
    async handleDeleteItemClick (e:any)  {
        const { collectionName, item, currentUserPicked } = this.props.itemAndCollectionName;
        if(currentUserPicked) {
          const users = serviceStore.readDocs('users')
          const user = users[currentUserPicked.id]
          if(collectionName === 'accounts') {
              //TODO:Start login container with message for user to logout from the account manually when he hits finish delete 
              user.accountsIds = user.accountsIds.filter(accountId => accountId !== item.id)
          } else if (collectionName === 'actions') {
              user.actionsIds = user.actionsIds.filter(actionId => actionId !== item.id)
          }
          serviceStore.updateDocs('users', users)
          serviceStore.deleteDoc(collectionName, item)
          this.handleClose(null)
        } else {
          if(collectionName === "tests") {
            serviceStore.deleteDoc(collectionName, item)
          } else if(collectionName === "users") {
            const users = serviceStore.readDocs('users')
            const user = users[item.id]
            if(user.actionsIds.length > 0) {
              const actions = serviceStore.readDocs('actions');
              for(const actionId of user.actionsIds) {
                delete actions[actionId];
              }
              serviceStore.updateDocs('actions',actions)
            }
            if(user.accountsIds.length > 0) {
              const accounts = serviceStore.readDocs('accounts');
              for(const accountId of user.accountsIds) {
                delete accounts[accountId];
              }
              serviceStore.updateDocs('accounts',accounts)
            }
            this.handleClose(null)
            serviceStore.deleteDoc(collectionName, item)
            await removeUserSessionFolder(`${APP_CWD}sessions/${user.id}`.trim());
          }
        }
      }
    
}


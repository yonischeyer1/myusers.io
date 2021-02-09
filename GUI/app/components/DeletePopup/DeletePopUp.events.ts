import ServiceStore from "../../services /store.service";
import { APP_CWD } from "../../utils/general";
import { removeUserSessionFolder } from "../../utils/IHost";

let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();
export default class ActionsDropdownEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose (e:any) {
        const {handleDeletePopupClose} = _props;
        handleDeletePopupClose(false);
      };
    
    async handleDeleteItemClick (e:any)  {
        const { collectionName, item, currentUserPicked } = _props.itemAndCollectionName;
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


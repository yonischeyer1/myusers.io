import { Test, TestModel, TEST_STATUS } from "../../models/Test.model";
import ServiceStore from "../../services /store.service";

let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();

export default class TestUpsertModalEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async handleClose (e:any) {
        const {handleUpsertTestModalClose} = _props;
        handleUpsertTestModalClose(false);
        await _setState({..._state, suite:[], suiteName:''})
    }
    
    async getUserActions  (e:any)  {
        const users = serviceStore.readDocs('users')
        const actions = serviceStore.readDocs('actions')
        const menuItemSelected = e.target.value;
        const user:any = users[menuItemSelected];
        let userActions = []
        for(const userActionId of user.actionsIds) {
          userActions.push(actions[userActionId])
        }
        return {userActions, user};
    }
    
    async handleUserPick (e:any)  {
        const {userActions, user} = this.getUserActions(e);
        await _setState({..._state, pickedUserId:user.id, pickedUserActions:userActions});
    }
    
    async handleActionPick  (e:any)  {
        const pickedAction = e.target.value
        await _setState({..._state, pickedUserAction:pickedAction})
    }
    
    async save (e:any)  {
        const test:Test = {
          suiteName:_state.suiteName,
          suite:_state.suite,
          lastFailResult:null
        }
        serviceStore.createDoc('tests', test);
        this.handleClose(null)
    }
    
    async addTestToSuite (e:any) {
        const test:TestModel = {
          testName:_state.testName,
          userId:_state.pickedUserId,
          actionId:_state.pickedUserAction,
          schedule:{},
          status:TEST_STATUS.IDLE
        }
        await _setState({..._state, suite:[..._state.suite, test], testName:"", pickedUserId:"", pickedUserAction:"", pickedUserActions:null});
      }
    async deleteTestFromSuite (test:any) {
        const newSuite = _state.suite.filter(item => item.testName !== test.testName)
        await _setState({..._state, suite:newSuite})
    }
}


import { Test, TestModel, TEST_STATUS } from "../../models/Test.model";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";


const serviceStore = new ServiceStore();

export default class TestUpsertModalEvents {
  initFlag:any
  setState:any
  state:any
  props:any
  constructor() {}

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

  async handleClose (e:any) {
        const { handleUpsertTestModalClose } = this.props;
        handleUpsertTestModalClose(false);
        await this.setState({...this.state, suite:[], suiteName:''})
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
        await this.setState({...this.state, pickedUserId:user.id, pickedUserActions:userActions});
    }
    
    async handleActionPick  (e:any)  {
        const pickedAction = e.target.value
        await this.setState({...this.state, pickedUserAction:pickedAction})
    }
    
    async save (e:any)  {
        const test:Test = {
          suiteName: this.state.suiteName,
          suite:this.state.suite,
          lastFailResult:null
        }
        serviceStore.createDoc('tests', test);
        this.handleClose(null)
    }
    
    async addTestToSuite (e:any) {
        const test:TestModel = {
          testName:this.state.testName,
          userId:this.state.pickedUserId,
          actionId:this.state.pickedUserAction,
          schedule:{},
          status:TEST_STATUS.IDLE
        }
        await this.setState({...this.state, suite:[...this.state.suite, test], testName:"", pickedUserId:"", pickedUserAction:"", pickedUserActions:null});
      }
    async deleteTestFromSuite (test:any) {
        const newSuite = this.state.suite.filter(item => item.testName !== test.testName)
        await this.setState({...this.state, suite:newSuite})
    }
}


import { TEST_STATUS } from "../../models/Test.model";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";

let _state:any = null;
let _setState:any = null; 

const serviceStore = new ServiceStore();
export default class HomeEvents {
    constructor() {}

    setConstructor(state:any, setState:any) {
         _state = state;
        _setState = setState;
    }

    //*** Modals Close events */

    async handleTroubleshootMenuClose () {
        await _setState({..._state, openTroubleshootMenu:false})
    }

    async handleUpsertTestModalClose () {
        await _setState({..._state, currentTestPicked:null, openUpsertTestModal:false})
    }

    async handleUpsertUserModalClose () {
        await _setState({..._state, openUpsertUserModal:false, currentUserPicked:null})
    }

    async handleDeletePopupClose () {
        await _setState({..._state, itemAndCollectionNameToDelete:null, openDeletePopup:false})
    }

    async handleLivePreviewModalClose () {
        await _setState({_state, stopLiveView:true})
        setTimeout(async ()=>{
          await _setState({..._state, liveViewPort:null})
        }, 0)
    }

    //*** Inputs handles */

    async handleChangeTab (event: React.ChangeEvent<{}>, newValue: number) {
        await _setState({..._state, tabIndex:newValue})
    }

    async handleLiveViewClick (test:any) {
        await _setState({..._state, liveViewPort:_state.portsPlaying[test.id], 
            stopLiveView:false, liveViewPortModalOpen:true})
    }

    async handleFloatingButtonClick (e:any)  {
        if(_state.tabIndex === 0) {
            await _setState({..._state, openUpsertTestModal: !_state.openUpsertTestModal})
          } else {
            await _setState({..._state, currentUserPicked:null, openUpsertUserModal:!_state.openUpsertUserModal})
          }
    }

    async handleFailClick (testSuite:any) {
        await _setState({..._state, openTroubleshootMenu:true, testTroubleshootPick:testSuite})
    }

    async handleTestMenuItemClick (e:any, option:any, test:any, testSuiteIdx:any) {
        switch (option.label) {
            case "Play":
              await this.playTestSuite(test, testSuiteIdx)
            break;
        
            case "Live view":
              await this.handleLiveViewClick(test)
            break;
        
            case "Edit":
              await this.editTest(test)
            break;
        
            case "Delete":
              await this.deleteTest(test)
            break;
          
            default:
              break;
          }
    }

    async handleUserMenuItemClick (e:any, option:any, user:any) {
        switch (option.label) {
            case "Edit":
              await this.editUser(user);
            break;
        
            case "Delete":
              await this.deleteUser(user)
            break;
          
            default:
              break;
          }
    }

    //*** Output handles */

    async changeTestStatus (test:any, status:any ) {
        await _setState({..._state, currentRuningTestName:{name:test.testName, status }})
    }

    async editUser (user:any) {
        await _setState({..._state, currentUserPicked:user, openUpsertUserModal:true})
    }

    async editTest (test:any) {
        await _setState({..._state, currentTestPicked:test, openUpsertTestModal:true})
    }

    async deleteUser (user:any) {
        const { currentUserPicked } = _state;
        await _setState({..._state, openDeletePopup:true , itemAndCollectionNameToDelete:{collectionName, item:user, currentUserPicked}})
    }

    async deleteTest (test:any) {
        await _setState({..._state, openDeletePopup:true , itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
    }

    async playTestSuite (testSuite:any, testSuiteIdx:any)  {
        let testIdx = 0;
        for(const test of testSuite.suite) {
           await this.playTest(test, testSuite.id, testIdx, testSuiteIdx)
           testIdx++;
        }
    }

    async saveTestFail (testResp:any, testSuiteIdx:any) { 
        const tests = serviceStore.readDocs('tests');
        tests[testSuiteIdx].lastFailResult = testResp;
        serviceStore.updateDocs('tests', tests)
    }

    async playTest (test:any, testSuiteId:any, testIdx:any, testSuiteIdx:any) {
        const users = serviceStore.readDocs('users');
        await this.changeTestStatus(test, TEST_STATUS.PLAYING)
        const actions = serviceStore.readDocs('actions');
        const user = users[test.userId];
        const action = actions[test.actionId]
        const playingContainerInstance = new Container(CONTAINER_MODE.player);
        await playingContainerInstance.init(action.startUrl, user.id);
        await _setState({..._state, portsPlaying:{..._state.portsPlaying, [testSuiteId]:playingContainerInstance._port}})
        const testResp:any = await (await playingContainerInstance.play(true, action)).json()
        if(testResp.success) {
          await this.changeTestStatus(test, TEST_STATUS.SUCCESS)
        } else {
          testResp.testIdx = testIdx;
          this.saveTestFail(testResp, testSuiteIdx)
          await this.changeTestStatus(test, TEST_STATUS.FAIL)
        }
        await _setState({..._state, portsPlaying:{..._state.portsPlaying, [test.id]:false}})
    }

    
}


import { TEST_STATUS } from "../../models/Test.model";
import Container, { CONTAINER_MODE } from "../../services /container.service";
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";

export const DEFAULT_COMPONENT_STATE = {
    tabIndex:0,
    openUpsertTestModal:false,
    openUpsertUserModal:false,
    openliveViewPortModal:false,
    openDeletePopup:false,
    openTroubleshootMenu:false,
    liveViewPort:null,
    currentUserPicked:null,
    currentTestPicked:null,
    stopLiveView:true,
    itemAndCollectionNameToDelete:null,
    currentRuningTestName: {name:"",status:""},
    testTroubleshootPick:false,
    optionsTest:[
      {label:'Play',disabled:false}, 
      {label:'Live view', disabled:false}, 
      {label:'Edit', disabled:false},  
      {label:'Delete', disabled:false}, 
      {label:'Export', disabled:false}
    ],
    optionsUser:[
      {label:'Edit',disabled:false}, 
      {label:'Delete', disabled:false}
    ],
    tests:[],
    users:[]
}

const serviceStore = new ServiceStore();

let instance :any = null;
export default class HomeEvents {
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
         if(!this.initFlag) {
            this.initFlag = true;
            await this.init();
         }
   }

   async init () {
       const tests = Object.values(serviceStore.readDocs('tests'));
       const users =  Object.values(serviceStore.readDocs('users'));
       this.setState({...this.state, users, tests})
   }

    //*** Modals Close events */

    async handleTroubleshootMenuClose () {
        await this.setState({...this.state, openTroubleshootMenu:false})
    }

    async handleUpsertTestModalClose () {
        await this.setState({...this.state, currentTestPicked:null, openUpsertTestModal:false})
    }

    async handleUpsertUserModalClose () {
        await this.setState({...this.state, openUpsertUserModal:false, currentUserPicked:null})
    }

    async handleDeletePopupClose () {
        await this.setState({...this.state, itemAndCollectionNameToDelete:null, openDeletePopup:false})
    }

    async handleLivePreviewModalClose () {
        await this.setState({...this.state, stopLiveView:true})
        setTimeout(async ()=>{
          await this.setState({...this.state, liveViewPort:null})
        }, 0)
    }

    //*** Inputs handles */

    async handleChangeTab (event: React.ChangeEvent<{}>, newValue: number) {
        await this.setState({...this.state, tabIndex:newValue})
    }

    async handleLiveViewClick (test:any) {
        await this.setState({...this.state, liveViewPort:this.state.portsPlaying[test.id], 
            stopLiveView:false, liveViewPortModalOpen:true})
    }

    async handleFloatingButtonClick (e:any)  {
        if(this.state.tabIndex === 0) {
            await this.setState({...this.state, openUpsertTestModal: !this.state.openUpsertTestModal})
          } else {
            await this.setState({...this.state, currentUserPicked:null, openUpsertUserModal:!this.state.openUpsertUserModal})
          }
    }

    async handleFailClick (testSuite:any) {
        await this.setState({...this.state, openTroubleshootMenu:true, testTroubleshootPick:testSuite})
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
        await this.setState({...this.state, currentRuningTestName:{name:test.testName, status }})
    }

    async editUser (user:any) {
        await this.setState({...this.state, currentUserPicked:user, openUpsertUserModal:true})
    }

    async editTest (test:any) {
        await this.setState({...this.state, currentTestPicked:test, openUpsertTestModal:true})
    }

    async deleteUser (user:any) {
        await this.setState({...this.state, openDeletePopup:true , itemAndCollectionNameToDelete:{collectionName:'users', item:user}})
    }

    async deleteTest (test:any) {
        await this.setState({...this.state, openDeletePopup:true , itemAndCollectionNameToDelete:{collectionName:'tests', item:test}})
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
        await this.setState({...this.state, portsPlaying:{...this.state.portsPlaying, [testSuiteId]:playingContainerInstance._port}})
        const testResp:any = await (await playingContainerInstance.play(true, action)).json()
        if(testResp.success) {
          await this.changeTestStatus(test, TEST_STATUS.SUCCESS)
        } else {
          testResp.testIdx = testIdx;
          this.saveTestFail(testResp, testSuiteIdx)
          await this.changeTestStatus(test, TEST_STATUS.FAIL)
        }
        await this.setState({...this.state, portsPlaying:{...this.state.portsPlaying, [test.id]:false}})
    }

    
}


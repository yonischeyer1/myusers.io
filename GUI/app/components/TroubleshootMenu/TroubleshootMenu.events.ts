
import ServiceStore from "../../services /store.service";


let _state:any = null;
let _setState:any = null; 
let _props:any = null;

const serviceStore = new ServiceStore();

export default class TroubleshootMenuEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any) {
         _state = state;
         _setState = setState;
         _props = props;
    }

    async init () {
        const pickedTest = _props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions');
        const failedTag:any = {
          tag:actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx],
          idx:pickedTest.lastFailResult.currentTagIdx
        }
        const failedTest:any = {
          test:pickedTest.suite[pickedTest.lastFailResult.testIdx],
          idx:pickedTest.lastFailResult.testIdx
        }
        await _setState({..._state, failedTag: {...failedTag},failedTest: {...failedTest}})
    }

    async handleClose  (e:any)  {
        const {handleTroubleshootMenuClose} = _props;
        handleTroubleshootMenuClose(false);
    }
    
    async handleDynamicSnapshotModalClose (e:any) {
        await _setState({..._state, dynamicSnapshotOpen:false})
    }
    
    async handleEditTagModalClose  (e:any)  {
        await _setState({..._state, openEditTagModal:false})
    }
    
    async handleOpenMaksingWizard (e:any)  {
        await _setState({..._state, dynamicSnapshotModalData:_state.failedTag.tag, dynamicSnapshotOpen:true})
    }

    async handleDynamicSnapshotModalSave({tag, coords, drawURI}) {
        const pickedTest = _props.pickedTest;
        tag["dynamic"] = {coords, drawURI}
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
        serviceStore.updateDocs('actions', actions);
    }

    async handleUIChange (e:any) {
        const pickedTest = _props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].originalReferenceSnapshotURI = pickedTest.lastFailResult.uri;
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }

    async handleAddSnapshotToTag (e:any) {
        const pickedTest = _props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].moreSnapshots.push(pickedTest.lastFailResult.uri);
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].distances.push(pickedTest.lastFailResult.dist);
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }

    async handleSetTagWaitTime (e:any) {
        await _setState({..._state, openEditTagModal:true});
    }

    async handleSkipTag (e:any) {
        const pickedTest = _props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].skip = true
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }

    async handleBugReport(e:any) {
        this.handleClose(false)
    }

    async handleLiveSnapshot (e:any) {
        this.handleClose(false)
    }

    async handleEditTagSave (tag:any) {
        const pickedTest = _props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
        serviceStore.updateDocs('actions', actions);
    }
}


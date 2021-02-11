
import ServiceStore from "../../services /store.service";
import { setStatePromisifed } from "../../utils/general";


const serviceStore = new ServiceStore();

export default class TroubleshootMenuEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    constructor() {}

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
        const pickedTest = this.props.pickedTest;
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
        await this.setState({...this.state, failedTag: {...failedTag},failedTest: {...failedTest}})
    }

    async handleClose  (e:any)  {
        const {handleTroubleshootMenuClose} = this.props;
        handleTroubleshootMenuClose(false);
    }
    
    async handleDynamicSnapshotModalClose (e:any) {
        await this.setState({...this.state, dynamicSnapshotOpen:false})
    }
    
    async handleEditTagModalClose  (e:any)  {
        await this.setState({...this.state, openEditTagModal:false})
    }
    
    async handleOpenMaksingWizard (e:any)  {
        await this.setState({...this.state, dynamicSnapshotModalData:this.state.failedTag.tag, dynamicSnapshotOpen:true})
    }

    async handleDynamicSnapshotModalSave({tag, coords, drawURI}) {
        const pickedTest = this.props.pickedTest;
        tag["dynamic"] = {coords, drawURI}
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
        serviceStore.updateDocs('actions', actions);
    }

    async handleUIChange (e:any) {
        const pickedTest = this.props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].originalReferenceSnapshotURI = pickedTest.lastFailResult.uri;
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }

    async handleAddSnapshotToTag (e:any) {
        const pickedTest = this.props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].moreSnapshots.push(pickedTest.lastFailResult.uri);
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].distances.push(pickedTest.lastFailResult.dist);
        serviceStore.updateDocs('actions', actions);
        this.handleClose(false)
    }

    async handleSetTagWaitTime (e:any) {
        await this.setState({...this.state, openEditTagModal:true});
    }

    async handleSkipTag (e:any) {
        const pickedTest = this.props.pickedTest;
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
        const pickedTest = this.props.pickedTest;
        const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
        const actions = serviceStore.readDocs('actions')
        actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
        serviceStore.updateDocs('actions', actions);
    }
}


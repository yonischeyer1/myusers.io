import React from 'react';

// ** Material **
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

//** Others **
import ServiceStore from '../../services /store.service';
import styles from './TroubleshootMenu.css';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal';
import EditTagModal from '../EditTagModal/EditTagModal';

const serviceStore = new ServiceStore();


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let runonce:any = false

export default function FullScreenDialog(props:any) {
  const { open, pickedTest } = props;
  const [state, _setState] = React.useState({
      failedTag:null,
      failedTest:null,
      dynamicSnapshotModalData:null,
      dynamicSnapshotOpen:false,
      openEditTagModal:false
  });
  
  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  const handleClose = (e:any) => {
    const {handleTroubleshootMenuClose} = props;
    handleTroubleshootMenuClose(false);
  };

  const handleDynamicSnapshotModalClose = async (e:any) => {
    await setState({...state, dynamicSnapshotOpen:false})
  }

  const handleEditTagModalClose = async (e:any) => {
    await setState({...state, openEditTagModal:false})
  }

  const handleOpenMaksingWizard = async (e:any) => {
    await setState({...state, dynamicSnapshotModalData:state.failedTag.tag, dynamicSnapshotOpen:true})
  }

  const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
    tag["dynamic"] = {coords, drawURI}
    const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
    const actions = serviceStore.readDocs('actions')
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
    serviceStore.updateDocs('actions', actions);
  }

  const handleUIChange = (e:any) => {
    const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
    const actions = serviceStore.readDocs('actions')
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].originalReferenceSnapshotURI = pickedTest.lastFailResult.uri;
    serviceStore.updateDocs('actions', actions);
    handleClose(false)
  }

  const handleAddSnapshotToTag = (e:any) => {
    const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
    const actions = serviceStore.readDocs('actions')
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].moreSnapshots.push(pickedTest.lastFailResult.uri);
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].distances.push(pickedTest.lastFailResult.dist);
    serviceStore.updateDocs('actions', actions);
    handleClose(false)
  }

  const handleSetTagWaitTime = async (e:any) => {
    await setState({...state, openEditTagModal:true});
  }

  const handleSkipTag = (e:any) => {
    const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
    const actions = serviceStore.readDocs('actions')
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx].skip = true
    serviceStore.updateDocs('actions', actions);
    handleClose(false)
  }

  const handleBugReport = (e:any) => {
    handleClose(false)
  }

  const handleLiveSnapshot = (e:any) => {
    handleClose(false)
  }

  const handleEditTagSave = (tag:any) => { 
    const actionId = pickedTest.suite[pickedTest.lastFailResult.testIdx].actionId
    const actions = serviceStore.readDocs('actions')
    actions[actionId].tags[pickedTest.lastFailResult.currentTagIdx] = tag;
    serviceStore.updateDocs('actions', actions);
  }


  (async ()=>{
    if(!runonce && pickedTest) {
      runonce = true; 
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
      await setState({...state, failedTag: {...failedTag},failedTest: {...failedTest}})
      console.log("state",state)
    }
  })()



   //** HTML */
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Troubleshoot Menu
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
        <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography className={styles["heading"]}>Dynamic snapshot</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
             When a tag snapshot has chaging parts in the UI its confusing the snapshot matching enigne
             You can use static masking wizard in order to cover those parts 
          </Typography>
          <br/>
          <Button onClick={handleOpenMaksingWizard} variant="outlined" color="primary">Open Static Masking wizard</Button>
          </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content">
          <Typography className={styles["heading"]}>UI Change</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                The website UI has changed to this snapshot.
                Replace current tag image with the faild tag image.
            </Typography>
            <br/>
          <Button onClick={handleUIChange} variant="outlined" color="primary">Replace tag snapshot</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={styles["heading"]}>Performance issue / slowness</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                You can increase the wait time of each tag and number of attempts
            </Typography>
            <br/>
          <Button onClick={handleSetTagWaitTime} variant="outlined" color="primary">Increase tag wait time</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={styles["heading"]}>Bug</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <div>
            <Typography>
                As a QA your point of refernce to check that the website behaves as it should is
                the Features user stories.
                <br/>
                When you do detect an exepction in behaviour you should report it to a ticketing system.
            </Typography>
            <br/>
          <Button onClick={handleBugReport} variant="outlined" color="primary">Report Bug</Button>
            </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={styles["heading"]}>A/B Test</Typography>
        </AccordionSummary>
        <AccordionDetails>
         <div>
            <Typography>
                Thier can be multiple themes for the same interface but elements you did an action on stay in thier postion.<br/>
                You can add this snapshot to the tag and it will check to see of one of the options is correct
            </Typography>
            <br/>
          <Button onClick={handleAddSnapshotToTag} variant="outlined" color="primary">Add snaphsot to tag</Button>
        </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={styles["heading"]}>Skip</Typography>
        </AccordionSummary>
        <AccordionDetails>
         <div>
            <Typography>
                You can skip tag snapshot matching (Be carful with this option it can lead to unexpeceted behaviour). 
            </Typography>
            <br/>
          <Button onClick={handleSkipTag} variant="outlined" color="primary"> Skip tag</Button>
         </div>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
        >
          <Typography className={styles["heading"]}>Live Snapshot</Typography>
        </AccordionSummary>
        <AccordionDetails>
        <div>
            <Typography>
                Add this as a live snapshot tag.<br/>
                If there is a match the test will wait for live action on it
                from user and when he finishes it will continue the test.
            </Typography>
            <br/>
          <Button onClick={handleLiveSnapshot} variant="outlined" color="primary">Open Static Masking wizard</Button>
        </div>
        </AccordionDetails>
      </Accordion><br/>
      <div style={{display:"flex", justifyContent:"space-around"}}>
        <div>
            faild frame image 
            <img src={pickedTest.lastFailResult.uri}/>
       </div>
        <div>
            tag image 
            <img src={state.failedTag ? state.failedTag.tag.originalReferenceSnapshotURI : null}/>
        </div>
      </div><br/>
      </div>
      <EditTagModal open={state.openEditTagModal} handleEditTagModalClose={handleEditTagModalClose} 
       handleEditTagSave={handleEditTagSave} tag={state.failedTag ? state.failedTag.tag : null}/>
      <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      </Dialog>
    </div>
  ) : <div></div>
}
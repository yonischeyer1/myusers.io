import React from 'react';

// ** Material **
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

//** Others **
import styles from './TroubleshootMenu.css';
import DynamicSnapshotModal from '../StaticMaskingWizard/StaticMaskingWizard';
import EditTagModal from '../EditTagModal/EditTagModal';
import { Transition } from '../../utils/general';
import TroubleshootMenuEvents from './TroubleshootMenu.events';


export default function FullScreenDialog(props:any) {
  const _events = new TroubleshootMenuEvents();
  const { open, pickedTest } = props;
  const [state, _setState] = React.useState({
      failedTag:null,
      failedTest:null,
      dynamicSnapshotModalData:null,
      dynamicSnapshotOpen:false,
      openEditTagModal:false
  });

  _events.setConstructor(state, _setState, props);

   //** HTML */
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Troubleshoot Menu
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
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
          <Button onClick={_events.handleOpenMaksingWizard.bind(_events)} variant="outlined" color="primary">Open Static Masking wizard</Button>
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
          <Button onClick={_events.handleUIChange.bind(_events)} variant="outlined" color="primary">Replace tag snapshot</Button>
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
          <Button onClick={_events.handleSetTagWaitTime.bind(_events)} variant="outlined" color="primary">Increase tag wait time</Button>
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
          <Button onClick={_events.handleBugReport.bind(_events)} variant="outlined" color="primary">Report Bug</Button>
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
          <Button onClick={_events.handleAddSnapshotToTag.bind(_events)} variant="outlined" color="primary">Add snaphsot to tag</Button>
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
          <Button onClick={_events.handleSkipTag.bind(_events)} variant="outlined" color="primary"> Skip tag</Button>
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
          <Button onClick={_events.handleLiveSnapshot.bind(_events)} variant="outlined" color="primary">Open Static Masking wizard</Button>
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
      <EditTagModal open={state.openEditTagModal} handleEditTagModalClose={_events.handleEditTagModalClose.bind(_events)} 
       handleEditTagSave={_events.handleEditTagSave.bind(_events)} tag={state.failedTag ? state.failedTag.tag : null}/>
      <DynamicSnapshotModal handleDynamicSnapshotModalSave={_events.handleDynamicSnapshotModalSave.bind(_events)}
        handleDynamicSnapshotModalClose={_events.handleDynamicSnapshotModalClose.bind(_events)} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
      </Dialog>
    </div>
  ) : <div></div>
}
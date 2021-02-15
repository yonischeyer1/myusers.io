import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TextField, FormControl } from '@material-ui/core';


import RecordingModal from '../RecordingModal/RecordingModal'
import styles from './AccountUpsertModal.css';
import { Transition } from '../../utils/general';
import AccountUpsertModalEvents, { DEFAULT_COMPONENT_STATE } from './AccountUpsertModal.events';


const _events = new AccountUpsertModalEvents();

export default function FullScreenDialog(props:any) {
  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE});

  _events.setConstructor(state, setState, props);

  const { open, accountName, loginURL, openRecordingModal } = state;

  console.log("AccountUpsertModalEvents",state)

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Account Upsert 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={accountName.disabled} value={accountName.value}
             onChange={_events.handleAccountNameChange.bind(_events)} 
             label="Account name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
          <div className={styles["test-name-container"]}>
             <TextField disabled={loginURL.disabled} value={loginURL.value}
             onChange={_events.handleLoginUrlChange.bind(_events)} 
             label="Login URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
         </div>
         <div className={styles["pick-action-combobox-container"]}>
             <FormControl className={styles["form-control"]}>
             <Button size="small" variant="outlined" color="primary" onClick={_events.handleLoginClick.bind(_events)}>Login</Button>
        </FormControl>
       </div>
            <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={_events.handleCancelBtnClick.bind(_events)}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={_events.handleDoneBtnClick.bind(_events)}>Done</Button>
         </div>
      </div>
      </Dialog>
      <RecordingModal handleRecordingModalClose={_events.handleRecordingModalClose.bind(_events)} open={openRecordingModal}/>
    </div>
  ) : <div></div>
}
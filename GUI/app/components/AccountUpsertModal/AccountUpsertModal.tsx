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
import AccountUpsertModalEvents from './AccountUpsertModal.events';


const _events = new AccountUpsertModalEvents();

export default function FullScreenDialog(props:any) {
  const { open } = props;
  const [state, _setState] = React.useState({
    openRecordingModal:false,
    accountName:{value:'', disabled:false},
    loginURL:{value:'', disabled:false},
  });

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  _events.setConstructor(state, setState, props);


   //** HTML */
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Account Upsert 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={state.accountName.disabled} value={state.accountName.value}
             onChange={_events.handleAccountNameChange} 
             label="Account name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
          <div className={styles["test-name-container"]}>
             <TextField disabled={state.loginURL.disabled} value={state.loginURL.value}
             onChange={_events.handleLoginUrlChange} 
             label="Login URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
         </div>
         <div className={styles["pick-action-combobox-container"]}>
             <FormControl className={styles["form-control"]}>
             <Button size="small" variant="outlined" color="primary" onClick={_events.handleLoginClick}>Login</Button>
        </FormControl>
       </div>
            <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={_events.handleCancelBtnClick}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={_events.handleDoneBtnClick}>Done</Button>
         </div>
      </div>
      </Dialog>
      <RecordingModal handleRecordingModalClose={_events.handleRecordingModalClose} open={state.openRecordingModal}/>
    </div>
  ) : <div></div>
}
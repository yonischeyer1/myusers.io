import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { TextField, FormControl } from '@material-ui/core';

//** Others **
import ServiceStore from '../../services /store.service';
import RecordingModal from '../RecordingModal/RecordingModal'
import styles from './AccountUpsertModal.css';

const serviceStore = new ServiceStore();


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let onceflag = false
export default function FullScreenDialog(props:any) {
  const { open, pickedAccount } = props;
  const [state, _setState] = React.useState({
    openRecordingModal:false,
    accountName:'',
    loginURL:'',
  });

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },300)
    })
  }

  const handleClose = async (e:any) => {
    const {handleUpsertAccountModalClose} = props;
    handleUpsertAccountModalClose(false);
    onceflag = false;
    await setState({})
  };

  const handleRecordingModalClose = async () => {
    await setState({...state,openRecordingModal:false});
    const {handleUpsertAccountModalClose} = props;
    handleUpsertAccountModalClose(false);
  }

  const handleAccountNameChange = async (e:any) => {
    const key = "accountName"
    const newAccountName = e.target.value
    await setState({...state, accountName:newAccountName})
    serviceStore.upsertAppStateValue(key, newAccountName)
  }

  const handleLoginUrlChange = async (e:any) => {
    const key = "loginURL"
    const newLoginUrl = e.target.value
    await setState({...state, loginURL:newLoginUrl})
    serviceStore.upsertAppStateValue(key, newLoginUrl)
  }

  const handleLoginClick = async (e:any) => {
    serviceStore.upsertAppStateValue('isLoginMode', true)
    await setState({...state, openRecordingModal:false});
  }

  (async ()=>{
    if(open && pickedAccount && !onceflag) {
      onceflag = true;
      await setState({...state, accountName:pickedAccount.name, loginURL:pickedAccount.loginURL})
   } 
  })()


   //** HTML */
  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Account Upsert 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={state.accountName}
             onChange={handleAccountNameChange} 
             label="Account name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={state.loginURL}
             onChange={handleLoginUrlChange} 
             label="Login URL:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
         </div>
         <div className={styles["pick-action-combobox-container"]}>
             <FormControl className={styles["form-control"]}>
             <Button size="small" variant="outlined" color="primary" onClick={handleLoginClick}>Login</Button>
        </FormControl>
       </div>
            <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={()=>{}}>Done</Button>
         </div>
      </div>
      </Dialog>
      <RecordingModal handleRecordingModalClose={handleRecordingModalClose} open={state.openRecordingModal}/>
    </div>
  ) : <div></div>
}
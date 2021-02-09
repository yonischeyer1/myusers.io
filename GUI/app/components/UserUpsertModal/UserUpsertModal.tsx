import React, {Suspense} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountUpsertModal from '../AccountUpsertModal/AccountUpsertModal';
import ActionUpsertModal from '../ActionUpsertModal/ActionUpsertModal';
import DeletePopup from '../DeletePopup/DeletePopup'
import { TextField, Tabs, Tab, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import styles from './UserUpsertModal.css'
import { a11yProps, TabPanel, Transition } from '../../utils/general';
import UserUpsertModalEvents from './UserUpsertModal.events';

const _events = new UserUpsertModalEvents();

export default function FullScreenDialog(props:any) {
  const { open } = props;
  const [state, _setState] = React.useState({
    tabIndex:0,
    openUpsertAccountModal:false,
    openUpsertActionModal:false,
    pickedAction:null,
    pickedAccount:null,
    openDeletePopup:false,
    itemAndCollectionNameToDelete:null,
    accountsView:[],
    actionsView:[],
    userNameView:'',
    currentUserPicked:null
  })

  _events.setConstructor(state, _setState, props);


  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {state.currentUserPicked ? `Edit ${state.currentUserPicked.name}` : 'Create new user'}
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <div className={styles["modal-content-container"]}>
        </div>
        <div className={styles["add-test-floating-btn"]}>
          <Fab color="primary" aria-label="add" onClick={_events.handleFloatingButtonClick.bind(_events)}>
          <AddIcon />
        </Fab>
        </div>
        <br/>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} 
             value={state.userNameView}
             onChange={_events.handleUserNameChange.bind(_events)} 
             label="User name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             </div>
             <br/>
          <div className={styles["root"]} style={{height:"100vh",color:"white"}}>
        <AppBar style={{backgroundColor:"#232c39",color:"white"}}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={state.tabIndex} onChange={_events.handleChange.bind(_events)} aria-label="simple tabs example">
            <Tab label="Accounts" {...a11yProps(0)} />
            <Tab label="Actions" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={state.tabIndex} index={state.tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className={styles["user-upsert-row-container"]} style={{display: state.tabIndex === 0 ? 'flex' : 'none'}}> 
          {
              !state.accountsView ||  state.accountsView.length === 0 ? <div>
                   User have 0 Accounts
              </div> : state.accountsView.map((account:any)=>{
                
                return <div className={styles["user-upsert-row"]}> <div>
                  Account Name: {account.name}
                  </div>
                  <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="primary" disabled={false} onClick={()=>{
                      _events.editAccount(account);
                    }}>Edit</Button>     
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                      _events.deleteAccountOrAction.bind(_events)('accounts', account);
                    }}>Delete</Button>     
                    </div>
                  </div>
              })
          }
          </div>
          <div className={styles["user-upsert-row-container"]} style={{display: state.tabIndex === 1 ? 'flex' : 'none'}}>
            {
              !state.actionsView ||  state.actionsView.length === 0 ? <div>
                User have 0 Actions
              </div> : state.actionsView.map((action:any)=>{
                return <div className={styles["user-upsert-row"]}>
                  <div className={styles["user-upsert-row-item-name"]}>
                  Action Name: {action.name || null}
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="primary" disabled={false} onClick={()=>{
                      _events.editAction.bind(_events)(action);
                    }}>Edit</Button>     
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                      _events.deleteAccountOrAction.bind(_events)('actions', action);
                    }}>Delete</Button>     
                    </div>
                  </div>
              })
            }
          </div>
          </Suspense>
        </TabPanel>
      </div>
      <DeletePopup handleDeletePopupClose={_events.handleDeletePopupClose.bind(_events)} open={state.openDeletePopup} itemAndCollectionName={state.itemAndCollectionNameToDelete} />
      <AccountUpsertModal handleUpsertAccountModalClose={_events.handleUpsertAccountModalClose.bind(_events)} open={state.openUpsertAccountModal} pickedAccount={state.pickedAccount}/>
      <ActionUpsertModal handleUpsertActionModalClose={_events.handleUpsertActionModalClose.bind(_events)} open={state.openUpsertActionModal} pickedAction={state.pickedAction}/>
      </Dialog>
    </div>
  ) : <div></div>
}
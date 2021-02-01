import React, {Suspense} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import AccountUpsertModal from '../AccountUpsertModal/AccountUpsertModal'
import ActionUpsertModal from '../ActionUpsertModal/ActionUpsertModal'
import DeletePopup from '../DeletePopup/DeletePopup'
import { TextField, Tabs, Tab, Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ServiceStore from '../../services /store.service'
import styles from './UserUpsertModal.css'
import { User } from '../../models/User.model';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
}
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }


function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const serviceStore = new ServiceStore();

let lastcurrentUserPicked:any = null
let serviceStoreEmitter:any = serviceStore.getEventEmitter()
let readUserAccountsFunc:any = null;
let readUserActionsFunc:any = null;
let setStateFunc:any = null;
let currentState:any = null;

serviceStoreEmitter.on(`DB-reread-users`,()=> {
  setStateFunc({...currentState, accountsView:readUserAccountsFunc()});
  setStateFunc({...currentState, actionsView:readUserActionsFunc()});
});



let runonce:any = false;

export default function FullScreenDialog(props:any) {
  const { open, currentUserPicked } = props;
  const [state, _setState] = React.useState({
    tabIndex:0,
    openUpsertAccountModal:false,
    openUpsertActionModal:false,
    pickedAction:null,
    pickedAccount:null,
    openDeletePopup:false,
    itemAndCollectionNameToDelete:null,
    accountsView:null,
    actionsView:null,
    userNameView:'',
  })

  currentState = state;

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },300)
    })
  }

  setStateFunc = setState;

  const readUserAccounts = () => {
    const users = serviceStore.readDocs('users')
    const userPicked = currentUserPicked || lastcurrentUserPicked || serviceStore.getAppStateValue('currentUser')
    if(userPicked) {
      const user = users[userPicked.id]
      if(user.accountsIds.length > 0) {
      const accounts = serviceStore.readDocs('accounts')
        let temp = []
        for(const acccountId of user.accountsIds) {
          temp.push(accounts[acccountId])
        }
        return temp;
      } else {
        return []
      }
    }
  }

  const readUserActions = () => {
    const users = serviceStore.readDocs('users')
    const userPicked = currentUserPicked || lastcurrentUserPicked || serviceStore.getAppStateValue('currentUser')
    if(userPicked) {
      const user = users[userPicked.id]
      if(user.actionsIds.length > 0) {
      const actions = serviceStore.readDocs('actions')
      let temp = []
      for(const actionId of user.actionsIds) {
        temp.push(actions[actionId])
      }
      return temp;
     } else {
       return []
     }
   }
 }

 readUserAccountsFunc = readUserAccounts;
 readUserActionsFunc = readUserActions
  

  const deleteAccountOrAction = async (collectionName:any, item:any) => {
    await setState({...state, openDeletePopup:true, itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
  }

  const handleDeletePopupClose = async (e:any) =>{
    await setState({...state, itemAndCollectionNameToDelete:null, openDeletePopup:false})
  }

  const handleUpsertAccountModalClose = async (e:any) =>{
    await setState({...state, openUpsertAccountModal:false})
  }

  const handleUpsertActionModalClose = async (e:any) =>{
    runonce = false;
    await setState({...state, openUpsertActionModal:false})
  }

  const handleClose = async (e:any) => {
    await setState({...state, accountsView:null, actionsView:null, userNameView:''});
    serviceStore.upsertAppStateValue('currentUser', null)
    const {handleUpsertUserModalClose} = props;
    handleUpsertUserModalClose(false);
    runonce = false;
    currentState = false;
  };

  const handleChange = async (event: React.ChangeEvent<{}>, newValue: number) => {
    await setState({...state, tabIndex:newValue})
  }

  const handleUserNameChange = async (e:any) => {
    const users = serviceStore.readDocs('users')
    const userNameKey = "userName"
    const newUserName = e.target.value
    await setState({...state, userNameView:newUserName});
    serviceStore.upsertAppStateValue(userNameKey, newUserName);
    if(currentUserPicked) {
      users[currentUserPicked.id].name = newUserName
      serviceStore.updateDocs('users', users)
    }
  }

  const editAction = async (action:any) => {
     await setState({...state, openUpsertActionModal:true, pickedAction:action});
  }

  const editAccount = async (account:any) => {
    await setState({...state, openUpsertAccountModal:account, pickedAccount:account})
 }

  const handleFloatingButtonClick = (e:any) => {
    if(!currentUserPicked) {
      const userName = serviceStore.getAppStateValue('userName');
      const userToInsert:User = {
        name:userName,
        accountsIds:[],
        actionsIds:[]
      }
      const userId = serviceStore.createDoc('users', userToInsert);
      userToInsert["id"] = userId;
      serviceStore.upsertAppStateValue('currentUser', userToInsert);
    }
    if(state.tabIndex === 0) {
      setState({...state, pickedAccount:null, openUpsertAccountModal: !state.openUpsertAccountModal})
    } else {
      setState({...state, pickedAction:null, openUpsertActionModal: !state.openUpsertActionModal})
    }
  }

  if(open) {
    if(currentUserPicked && !state.accountsView && !state.actionsView && !runonce) {
      runonce = true;
      lastcurrentUserPicked = currentUserPicked;
      setState({...state, userNameView:currentUserPicked.name ,accountsView:readUserAccounts(), actionsView:readUserActions()})
    }
  } 


  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              {currentUserPicked ? `Edit ${currentUserPicked.name}` : 'Create new user'}
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <div className={styles["modal-content-container"]}>
        </div>
        <div className={styles["add-test-floating-btn"]}>
          <Fab color="primary" aria-label="add" onClick={handleFloatingButtonClick}>
          <AddIcon />
        </Fab>
        </div>
        <br/>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} 
             value={state.userNameView}
             onChange={handleUserNameChange} 
             label="User name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             </div>
             <br/>
          <div className={styles["root"]} style={{height:"100vh",color:"white"}}>
        <AppBar style={{backgroundColor:"#232c39",color:"white"}}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={state.tabIndex} onChange={handleChange} aria-label="simple tabs example">
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
                      editAccount(account);
                    }}>Edit</Button>     
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                      deleteAccountOrAction('accounts', account);
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
                      editAction(action);
                    }}>Edit</Button>     
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="secondary" disabled={false} onClick={()=>{
                      deleteAccountOrAction('actions', action);
                    }}>Delete</Button>     
                    </div>
                  </div>
              })
            }
          </div>
          </Suspense>
        </TabPanel>
      </div>
      <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={state.openDeletePopup} itemAndCollectionName={state.itemAndCollectionNameToDelete} />
      <AccountUpsertModal handleUpsertAccountModalClose={handleUpsertAccountModalClose} open={state.openUpsertAccountModal} pickedAccount={state.pickedAccount}/>
      <ActionUpsertModal handleUpsertActionModalClose={handleUpsertActionModalClose} open={state.openUpsertActionModal} pickedAction={state.pickedAction}/>
      </Dialog>
    </div>
  ) : <div></div>
}
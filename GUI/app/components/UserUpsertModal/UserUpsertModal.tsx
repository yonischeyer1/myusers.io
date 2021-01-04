import React, {Suspense, useEffect} from 'react';
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

const serviceStore = new ServiceStore();



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


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width:200
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    userActionSelectContainer: {
      display: "flex"
    },
    doneCancelBtnsContianer: {
      display:"flex"
    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
  }),
);


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});




export default function FullScreenDialog(props:any) {
  const classes = useStyles();

  const [tabIndex, setTabIndex] = React.useState(0);
  const [openUpsertAccountModal, setOpenUpsertAccountModal] = React.useState(false)
  const [openUpsertActionModal, setOpenUpsertActionModal] = React.useState(false)
  const [pickedAction, setPickedAction] = React.useState(null)
  const [pickedAccount, setPickedAccount] = React.useState(null)
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false)
  const [itemAndCollectionNameToDelete, setItemAndCollectionNameToDelete] = React.useState(null)
  const { open, currentUserPicked } = props;
  let accounts = []
  let actions = []
  let userNameTextFieldValue = null;
  if(open) {
     accounts = serviceStore.readDocs('accounts')
     actions = serviceStore.readDocs('actions')
    if(currentUserPicked) {
      if(currentUserPicked.accountsIds.length > 0) {
        let temp = []
        for(const acccountId of currentUserPicked.accountsIds) {
          temp.push(accounts[acccountId])
        }
        accounts = temp
      }
      if(currentUserPicked.actionsIds.length > 0) { 
        let temp = []
        for(const actionId of currentUserPicked.actionsIds) {
          temp.push(actions[actionId])
        }
        actions = temp
      }
    } else {
      accounts = []
      actions = []
    }
    userNameTextFieldValue = currentUserPicked ?  currentUserPicked.name : serviceStore.getAppStateValue('userName')  
  }

  const deleteAccountOrAction = (collectionName:any, item:any) => {
    setItemAndCollectionNameToDelete({collectionName, item, currentUserPicked})
    setOpenDeletePopup(true);
  }

  const handleUpsertAccountModalClose = (e:any) =>{
    setOpenUpsertAccountModal(false)
  }

  const handleDeletePopupClose = (e:any) =>{
    setItemAndCollectionNameToDelete(null);
    setOpenDeletePopup(false)
  }

  const handleUpsertActionModalClose = (e:any) =>{
    setOpenUpsertActionModal(false)
  }

  const handleClose = (e:any) => {
    const {handleUpsertUserModalClose} = props;
    handleUpsertUserModalClose(false);
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  }

  const handleUserNameChange = (e:any) => {
    const userNameKey = "userName"
    const newUserName = e.target.value
    serviceStore.upsertAppStateValue(userNameKey, newUserName);
  }

  const editAction = (action:any) => {
     setOpenUpsertActionModal(true)
     setPickedAction(action)
  }

  const editAccount = (account:any) => {
    setOpenUpsertAccountModal(account)
    setPickedAccount(account)
 }

  const handleFloatingButtonClick = (e:any) => {
    if(tabIndex === 0) {
      setPickedAccount(null)
      setOpenUpsertAccountModal(!openUpsertAccountModal)
    } else {
      setPickedAction(null)
      setOpenUpsertActionModal(!openUpsertActionModal)
    }
  }


  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
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
             value={userNameTextFieldValue}
             onChange={handleUserNameChange} 
             label="User name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
             </div>
             <br/>
          <div className={classes.root} style={{height:"100vh",color:"white"}}>
        <AppBar style={{backgroundColor:"#232c39",color:"white"}}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={tabIndex} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Accounts" {...a11yProps(0)} />
            <Tab label="Actions" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{display: tabIndex === 0 ? 'block' : 'none', color:"black"}}> 
          {
              !accounts ||  Object.values(accounts).length === 0 ? <div>
                   User have 0 Accounts
              </div> : Object.values(accounts).map((account:any)=>{
                
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
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
            {
              !actions ||  Object.values(actions).length === 0 ? <div>
                User have 0 Actions
              </div> : Object.values(actions).map((action:any)=>{
                return <div className={styles["user-upsert-row"]}>
                  <div>
                  Action Name: {action.name}
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
      <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={openDeletePopup} itemAndCollectionName={itemAndCollectionNameToDelete} />
      <AccountUpsertModal handleUpsertAccountModalClose={handleUpsertAccountModalClose} open={openUpsertAccountModal} pickedAccount={pickedAccount}/>
      <ActionUpsertModal handleUpsertActionModalClose={handleUpsertActionModalClose} open={openUpsertActionModal} pickedAction={pickedAction}/>
      </Dialog>
    </div>
  ) : <div></div>
}
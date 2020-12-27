import React, {Suspense, useEffect} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import {APP_CWD } from '../../utils/general';
import AccountUpsertModal from '../AccountUpsertModal/AccountUpsertModal'
import ActionUpsertModal from '../ActionUpsertModal/ActionUpsertModal'
import { TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LocalDB, { MODELS } from '../../utils/localDB.core'
import ServiceStore from '../../services /store';
// import { IMAGE_HASH_BITS, convertURIToImageData } from '../../utils/testIoFile';

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

const state = {
  imageArray:[],
  totalRecordTime:null,
  screen: "validate"
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

let actions:any;
let accounts:any;
let loadDbOnceFlag = false;
// setTimeout(()=>{
//   (async ()=> {
//     //TODO filter out by currentUserPicked
//     actions = await (new LocalDB().getModelArrayByName(MODELS.Action))
//     accounts = await (new LocalDB().getModelArrayByName(MODELS.Account))
//   })()
// },5000)

let setAcountFunc:any = null
let setActionFunc:any = null

async function loadActionAndAccountsByUser(currentUserPicked:any) {
  actions = await (new LocalDB().getModelArrayByName(MODELS.Action))
  if(actions && actions.length > 0) {
    actions = actions.filter(action => currentUserPicked.actionsIds.find(actionId => action.id === actionId))
    setActionFunc(actions)
  }
  accounts = await (new LocalDB().getModelArrayByName(MODELS.Account))
  if(accounts && accounts.length > 0) {
    accounts = accounts.filter(account => currentUserPicked.accountsIds.find(accountId => account.id === accountId)) 
    setAcountFunc(accounts)
  }
}



export default function FullScreenDialog(props:any) {
  const classes = useStyles();
  //const [actions, setActions] = React.useState();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [openUpsertAccountModal, setOpenUpsertAccountModal] = React.useState(false)
  const [openUpsertActionModal, setOpenUpsertActionModal] = React.useState(false)
   
  const [accountsView, setAccountsView] = React.useState(null);
  const [actionsView, setActionsView] = React.useState(null);

  const [pickedAction, setPickedAction] = React.useState(null)

  setAcountFunc = setAccountsView;
  setActionFunc = setActionsView

  const { open, currentUserPicked } = props;

  if(open && currentUserPicked && !accounts && !actions) {
    (async ()=>{
      await loadActionAndAccountsByUser(currentUserPicked)
    })()
  }


  const handleUpsertAccountModalClose = (e:any) =>{
    setOpenUpsertAccountModal(false)
  }

  const handleUpsertActionModalClose = (e:any) =>{
    setOpenUpsertActionModal(false)
  }

  const handleClose = (recordAgain = false) => {
    actions = null 
    accounts = null
    setAcountFunc(null)
    const {handleUpsertUserModalClose} = props;
    handleUpsertUserModalClose(false);
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  }

  const handleUserNameChange = (e:any) => {
    const userNameKey = "userName"
    const newUserName = e.target.value
    serviceStore.upsert(userNameKey, newUserName);
  }

  const editAction = (action:any) => {
     setOpenUpsertActionModal(true)
     setPickedAction(action)
  }

  useEffect(()=>{
    console.log("Upserer USer modal state",actions)
  })

  let userNameTextFieldValue = currentUserPicked ?  currentUserPicked.name : serviceStore.get('userName') 

  return (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              {currentUserPicked ? `Edit ${currentUserPicked.name}` : 'Create new user'}
            </Typography>
            <Button color="inherit" onClick={()=>{
                handleClose(false)
              }}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <div className="modal-content-container">
        </div>
        <div className="add-test-floating-btn">
          <Fab color="primary" aria-label="add" onClick={(e)=>{
          if(tabIndex === 0) {
            setOpenUpsertAccountModal(!openUpsertAccountModal)
          } else {
            setOpenUpsertActionModal(!openUpsertActionModal)
          }
        }}>
          <AddIcon />
        </Fab>
        </div>
        <br/>
          <div className="test-name-container">
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
              !accountsView ? null : accountsView.map((account:any)=>{
                return <div>
                  Account Name: {account.name}
                  </div>
              })
          }
          </div>
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
            {
              !actionsView ? null : actionsView.map((action:any)=>{
                return <div>
                  <div>
                  Action Name: {action.name}
                    </div>
                    <div>
                    <Button style={{position:'relative',marginLeft:'10px'}} size="small" variant="outlined" color="primary" disabled={false} onClick={()=>{
                      editAction(action);
                    }}>Edit</Button>     
                    </div>
                  </div>
              })
            }
          </div>
          </Suspense>
        </TabPanel>
      </div>
      <AccountUpsertModal handleUpsertAccountModalClose={handleUpsertAccountModalClose} open={openUpsertAccountModal}/>
      <ActionUpsertModal handleUpsertActionModalClose={handleUpsertActionModalClose} open={openUpsertActionModal} pickedAction={pickedAction}/>
      </Dialog>
    </div>
  );
}
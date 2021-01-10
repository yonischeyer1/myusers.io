import React, {Suspense} from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import { Fab, Button } from '@material-ui/core';
import TestUpsertModal from '../TestUpsertModal/TestUpsertModal'
import UserUpsertModal from '../UserUpsertModal/userUpsertModal'
import Container, { CONTAINER_MODE } from '../../utils/Container.controller';
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DeletePopup from '../DeletePopup/DeletePopup'
import {TEST_STATUS} from '../../models/Test.model'
import ServiceStore from '../../services /store.service'
import styles from './Home.css'

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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SimpleTabs(props:any) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [openUpsertTestModal, setOpenUpsertTestModal] = React.useState(false)
  const [openUpsertUserModal, setOpenUpsertUserModal] = React.useState(false)
  const [liveViewPort, setLiveViewPort] = React.useState(null)
  const [liveViewPortModalOpen, setLiveViewPortModalOpen] = React.useState(false)
  const [currentUserPicked, setCurrentUserPicked] = React.useState(null)
  const [portsPlaying, setPortsPlaying] = React.useState({})
  const [stopLiveView, setStopLiveView] = React.useState(true)
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false)
  const [itemAndCollectionNameToDelete, setItemAndCollectionNameToDelete] = React.useState(null)
  const tests = serviceStore.readDocs('tests');
  const users = serviceStore.readDocs('users');
  const handleUpsertTestModalClose = (e:any) =>{
    setOpenUpsertTestModal(false)
  }

  const handleUpsertUserModalClose = (e:any) =>{
    setOpenUpsertUserModal(false)
  }

  const handleLivePreviewModalClose = (e:any) => {
    setStopLiveView(true)
    setTimeout(()=>{
      setLiveViewPortModalOpen(false)
    }, 300)
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleLiveViewClick = (test:any) => {
    setLiveViewPort(portsPlaying[test.id])
    setStopLiveView(false)
    setLiveViewPortModalOpen(true)
  }

  const deleteAccountOrAction = (collectionName:any, item:any) => {
    debugger
    setItemAndCollectionNameToDelete({collectionName, item, currentUserPicked})
    setOpenDeletePopup(true);
  }

  const handleDeletePopupClose = (e:any) =>{
    setItemAndCollectionNameToDelete(null);
    setOpenDeletePopup(false)
  }

  const playTest = async (test:any) => {
    await changeTestStatus(test, TEST_STATUS.PLAYING)
    const actions = serviceStore.readDocs('actions');
    const user = users[test.userId];
    const action = actions[test.actionId]
    const playingContainerInstance = new Container(CONTAINER_MODE.player);
    await playingContainerInstance.init(action.startUrl, user.id);
    setPortsPlaying({...portsPlaying, [test.id]:playingContainerInstance._port})
    const testResp:any = await (await playingContainerInstance.play(true, action)).json()
    if(testResp.success) {
      await changeTestStatus(test, TEST_STATUS.SUCCESS)
    } else {
      await changeTestStatus(test, TEST_STATUS.FAIL)
      //pop up troubleshoot menu 
    }

    setPortsPlaying({...portsPlaying, [test.id]:false})
  }

  const changeTestStatus = async (test:any, status:any) => {
    test.status = status;
    tests[test.id] = test;
    serviceStore.updateDocs('tests', tests);
  }

  const handleUserClick = async (user:any) => {
    serviceStore.upsertAppStateValue('currentUser', user)
    setCurrentUserPicked(user)
    setOpenUpsertUserModal(true)
    //TODO: open upsert user Modal with user 
  }

  const handleFloatingButtonClick = (e:any) => {
    if(tabIndex === 0) {
      setOpenUpsertTestModal(!openUpsertTestModal)
    } else {
      setCurrentUserPicked(null)
      serviceStore.upsertAppStateValue('userName', null)
      setOpenUpsertUserModal(!openUpsertUserModal)
    }
  }



    return (
      <div className={classes.root} style={{height:"100vh",color:"white"}}>
        <AppBar style={{backgroundColor:"#232c39",color:"white"}}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={tabIndex} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Tests" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tabIndex} index={tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{display: tabIndex === 0 ? 'block' : 'none', color:"black"}}> 
             <div className={styles["tests-menu-container"]}>
                {
                  !tests || Object.values(tests).length === 0 ? <div> 
                          You have 0 Tests
                     </div>: Object.values(tests).map((test:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]}>
                        name: {test.name}
                       </div>
                       <div className={styles["test-status-container"]}>  
                         status : {test.status}
                       </div>
                       <div className={styles["test-due-date-container"]}>
                         dueDate: {test.dueDate}
                       </div>
                       <div className={styles["test-due-date-container"]}>
                       <Button disabled={false} size="small" variant="outlined" color="primary" 
                       onClick={(e:any)=>{handleLiveViewClick(test)}}>Edit</Button>
                       </div>
                       <div className={styles["play-button-container"]}>
                       <Button size="small" variant="outlined" color="primary" 
                       onClick={(e:any)=>{playTest(test)}}>Play</Button>
                       </div>
                       <div className={styles["test-due-date-container"]}>
                       <Button disabled={!portsPlaying[test.id]} size="small" variant="outlined" color="primary" 
                       onClick={(e:any)=>{handleLiveViewClick(test)}}>Live Preview</Button>
                       </div>
                       <div className={styles["test-due-date-container"]}>
                       <Button disabled={false} size="small" variant="outlined" color="secondary" 
                       onClick={(e:any)=>{deleteAccountOrAction('tests', test);}}>Delete</Button>
                       </div>
                    </div>)
                  }) 
                }
             </div>
          </div>
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
          <div className={styles["tests-menu-container"]}>
                {
                  !users || Object.values(users).length === 0 ? <div>
                    You have 0 Users
                  </div> :  Object.values(users).map((user:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]}>
                         name : {user.name}
                       </div>
                       <div>
                         <Button size="small" variant="outlined" color="primary" onClick={(e:any)=>{handleUserClick(user)}}>Edit</Button>
                       </div>
                       <div>
                         <Button size="small" variant="outlined" color="secondary" onClick={(e:any)=>{deleteAccountOrAction('users', user)}}>Delete</Button>
                       </div>
                    </div>)
                  }) 
                }
             </div>
          </div>
          </Suspense>
        </TabPanel>
        <div className={styles["add-test-floating-btn"]}>
          
        <Fab color="primary" aria-label="add" onClick={handleFloatingButtonClick}>
         <AddIcon />
        </Fab>
        </div>
        <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={openDeletePopup} itemAndCollectionName={itemAndCollectionNameToDelete} />
        <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} open={liveViewPortModalOpen} stopPlaying={stopLiveView} port={liveViewPort}/>
        <TestUpsertModal handleUpsertTestModalClose={handleUpsertTestModalClose} open={openUpsertTestModal}/>
        <UserUpsertModal currentUserPicked={currentUserPicked} handleUpsertUserModalClose={handleUpsertUserModalClose} open={openUpsertUserModal}/>
      </div>
    );
  
}
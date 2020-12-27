import React, {Suspense} from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import { Fab, Button } from '@material-ui/core';
import TestUpsertModal from './TestUpsertModal/TestUpsertModal'
import UserUpsertModal from './UserUpsertModal/userUpsertModal'
import Container, { CONTAINER_MODE } from '../utils/Container.controller';
import LocalDB, { MODELS } from '../utils/localDB.core';
import PlayerLiveViewModal from './PlayerLiveViewModal/PlayerLiveView.component'
import {TEST_STATUS} from '../models/Test.model'
import ServiceStore from '../services /store';
import styles from './Home.css'

const serviceStore = new ServiceStore();
const localDB = new LocalDB();
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

let tests:any;
let users:any;
setInterval(()=>{
  (async()=>{
    const [t,u] = await Promise.all([localDB.getModelArrayByName(MODELS.Test),localDB.getModelArrayByName(MODELS.User)])
    tests = t;
    users = u;
  })()
}, 2500)

export default function SimpleTabs(props:any) {
  const classes = useStyles();
  const [tabIndex, setTabIndex] = React.useState(0);
  const [openUpsertTestModal, setOpenUpsertTestModal] = React.useState(false)
  const [openUpsertUserModal, setOpenUpsertUserModal] = React.useState(false)
  const [liveViewPort, setLiveViewPort] = React.useState(null)
  const [liveViewPortModalOpen, setLiveViewPortModalOpen] = React.useState(false)
  const [currentUserPicked, setCurrentUserPicked] = React.useState(null)

  const handleUpsertTestModalClose = (e:any) =>{
    setOpenUpsertTestModal(false)
  }

  const handleUpsertUserModalClose = (e:any) =>{
    setOpenUpsertUserModal(false)
  }

  const handleLivePreviewModalClose = (e:any) => {
    setLiveViewPortModalOpen(false)
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const playTest = async (e:any, test:any) => {
    await changeTestStatus(test, TEST_STATUS.PLAYING)
    const users:any = await localDB.getModelArrayByName(MODELS.User)
    const user:any = users.find(userItem => userItem.id === test.userId)
    const actions:any = await localDB.getModelArrayByName(MODELS.Action)
    const action:any = actions.find(actionItem => actionItem.id === test.actionId)
    const playingContainerInstance = new Container(CONTAINER_MODE.player);
    await playingContainerInstance.init(action.startUrl, user.name);
    setLiveViewPort(playingContainerInstance._port)
    setLiveViewPortModalOpen(true)
    const testResp:any = await (await playingContainerInstance.play(true, action)).json()
    console.log("testResp",testResp)
    if(testResp.success) {
      await changeTestStatus(test, TEST_STATUS.SUCCESS)
    } else {
      await changeTestStatus(test, TEST_STATUS.FAIL)
  
      //pop up troubleshoot menu 
    }
  }

  const changeTestStatus = async (test:any, status:any) => {
    test.status = status;
    const Tests:any = await localDB.getModelArrayByName(MODELS.Test)
    const onlyIds = Tests.map( testItem => testItem.id)
    const choosenIdIndex = onlyIds.indexOf(test.id)
    Tests[choosenIdIndex] = test;
    localDB.saveModel(MODELS.Test, Tests);
  }

  const handleUserClick = async (user:any) => {
    serviceStore.upsert('currentUser', user)
    setCurrentUserPicked(user)
    setOpenUpsertUserModal(true)
    //TODO: open upsert user Modal with user 
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
                  !tests ? null : tests.map((test:any)=> {
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
                       <div className={styles["play-button-container"]}>
                       <Button size="small" variant="outlined" color="primary" 
                       onClick={(e)=>{
                         playTest(e, test)
                         }}>Play</Button>
                       </div>
                    </div>)
                  }) 
                }
             </div>
          </div>
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
          <div className={styles["tests-menu-container"]}>
                {
                  !users ? null : users.map((user:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]} onClick={()=>{handleUserClick(user)}}>
                         {user.name}
                       </div>
                    </div>)
                  }) 
                }
             </div>
          </div>
          </Suspense>
        </TabPanel>
        <div className={styles["add-test-floating-btn"]}>
          
        <Fab color="primary" aria-label="add" onClick={(e)=>{
          if(tabIndex === 0) {
            setOpenUpsertTestModal(!openUpsertTestModal)
          } else {
            setCurrentUserPicked(null)
            serviceStore.upsert('userName', null)
            setOpenUpsertUserModal(!openUpsertUserModal)
          }
        }}>
         <AddIcon />
        </Fab>
        </div>
        <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} open={liveViewPortModalOpen} stopPlaying={false} port={liveViewPort}/>
        <TestUpsertModal handleUpsertTestModalClose={handleUpsertTestModalClose} open={openUpsertTestModal}/>
        <UserUpsertModal currentUserPicked={currentUserPicked} handleUpsertUserModalClose={handleUpsertUserModalClose} open={openUpsertUserModal}/>
      </div>
    );
  
}
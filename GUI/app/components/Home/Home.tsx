import React, {Suspense} from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import { Fab, Button, ButtonGroup, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
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
  const [currentTestPicked, setCurrentTestPicked] = React.useState(null)
  const [portsPlaying, setPortsPlaying] = React.useState({})
  const [stopLiveView, setStopLiveView] = React.useState(true)
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false)
  const [itemAndCollectionNameToDelete, setItemAndCollectionNameToDelete] = React.useState(null)
  const [currentRuningTestName, setCurrentRuningTestName] = React.useState("")
  const [openTestActionBtnGrp, setOpenTestActionBtnGrp] = React.useState(false)
  const [openUserActionBtnGrp, setOpenUserActionBtnGrp] = React.useState(false)
  const tests = serviceStore.readDocs('tests');
  const users = serviceStore.readDocs('users');
  const handleUpsertTestModalClose = (e:any) =>{
    setCurrentTestPicked(null)
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

  const handleDeletePopupClose = (e:any) =>{
    setItemAndCollectionNameToDelete(null);
    setOpenDeletePopup(false)
  }

  const playTestSuite = async (testSuite:any) => {
    for(const test of testSuite.suite) {
       await playTest(test, testSuite.id)
    }
  }

  const playTest = async (test:any, testSuiteId:any) => {
    await changeTestStatus(test, TEST_STATUS.PLAYING)
    const actions = serviceStore.readDocs('actions');
    const user = users[test.userId];
    const action = actions[test.actionId]
    const playingContainerInstance = new Container(CONTAINER_MODE.player);
    await playingContainerInstance.init(action.startUrl, user.id);
    setPortsPlaying({...portsPlaying, [testSuiteId]:playingContainerInstance._port})
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
    setCurrentRuningTestName({name:test.testName, status })
    // test.status = status;
    // tests[test.id] = test;
    // serviceStore.updateDocs('tests', tests);
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

  const handleToggleTest = () => {
    setOpenTestActionBtnGrp(!openTestActionBtnGrp);
  };

  const handleToggleUser = () => {
    setOpenUserActionBtnGrp(!openUserActionBtnGrp);
  };

  const handleCloseTest = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRefTest.current && anchorRefTest.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpenTestActionBtnGrp(false);
  };

  const handleCloseUser = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRefUser.current && anchorRefUser.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpenUserActionBtnGrp(false);
  }

  const editUserOrTest = (collectionName:any, item:any) => {
    if(collectionName === 'users') {
      handleUserClick(item)
    } else {
      setCurrentTestPicked(item)
      setOpenUpsertTestModal(true)
    }
  } 

  const deleteUserOrTest = (collectionName:any, item:any) => {
    setItemAndCollectionNameToDelete({collectionName, item, currentUserPicked})
    setOpenDeletePopup(true);
  }

  const handleUserMenuItemClick =  (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
    user:any
  ) => {
    switch (index) {
      case 0:
        editUserOrTest('users', user);
      break;

      case 1:
        deleteUserOrTest('users', user)
      break;
    
      default:
        break;
    }
    //TODO: execute action by Index
    setOpenUserActionBtnGrp(false);
  };

  const handleTestMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
    test:any
  ) => {
    switch (index) {
      case 1:
        playTestSuite(test)
      break;

      case 2:
        handleLiveViewClick(test)
      break;

      case 3:
        editUserOrTest('tests', test)
      break;

      case 4:
        deleteUserOrTest('tests', test)
      break;
    
      default:
        break;
    }
    //TODO: execute action by Index
    setOpenTestActionBtnGrp(false);
  };


   const optionsTest = ['Actions','Play', 'Live view' ,'Edit', 'Delete'];
   const optionsUser = ['Edit','Delete'];
   const anchorRefTest = React.useRef<HTMLDivElement>(null);
   const anchorRefUser = React.useRef<HTMLDivElement>(null);
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
                     </div>: Object.values(tests).map((testSuite:any)=> {
                    return (
                      <div className={styles["test-row"]}>
                         <div className={styles["test-name-container"]}>
                              Test suite name:&nbsp; {testSuite.suiteName}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test runing:&nbsp; {currentRuningTestName.name}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test status:&nbsp; {currentRuningTestName.status}
                         </div>
                         <div>
                         <ButtonGroup variant="contained" color="primary" ref={anchorRefTest} aria-label="split button">
                        <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
                        <Button
                          color="primary"
                          size="small"
                          aria-controls={openTestActionBtnGrp ? 'split-button-menu' : undefined}
                          aria-expanded={openTestActionBtnGrp ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={handleToggleTest}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper open={openTestActionBtnGrp} anchorEl={anchorRefTest.current} role={undefined} transition disablePortal>
                       {({ TransitionProps, placement }) => (
                         <Grow
                           {...TransitionProps}
                           style={{
                             transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                           }}
                         >
                           <Paper>
                             <ClickAwayListener onClickAway={handleCloseTest}>
                               <MenuList id="split-button-menu">
                                 {optionsTest.map((option, index) => (
                                   <MenuItem
                                     style={index === 0 ? {display:'none'} : {}}
                                     key={option}
                                     disabled={index === 2 && !portsPlaying[testSuite.id]}
                                     onClick={(event:any) => handleTestMenuItemClick(event, index, testSuite)}
                                   >
                                     {option}
                                   </MenuItem>
                                 ))}
                               </MenuList>
                             </ClickAwayListener>
                           </Paper>
                         </Grow>
                       )}
                        </Popper>
                         </div>
                      </div>
                    )
                  }) 
                }
             </div>
          </div>
          <div style={{display: tabIndex === 1 ? 'block' : 'none', color:"black"}}>
           {
             tabIndex !== 1 ? null:
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
                       <ButtonGroup variant="contained" color="primary" ref={anchorRefUser} aria-label="split button">
                        <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
                        <Button
                          color="primary"
                          size="small"
                          aria-controls={openUserActionBtnGrp ? 'split-button-menu-test' : undefined}
                          aria-expanded={openUserActionBtnGrp ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={handleToggleUser}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper open={openUserActionBtnGrp} anchorEl={anchorRefUser.current} role={undefined} transition disablePortal>
                       {({ TransitionProps, placement }) => (
                         <Grow
                           {...TransitionProps}
                           style={{
                             transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                           }}
                         >
                           <Paper>
                             <ClickAwayListener onClickAway={handleCloseUser}>
                               <MenuList id="split-button-menu-test">
                                 {optionsUser.map((option, index) => (
                                   <MenuItem
                                     key={option}
                                     onClick={(event:any) => handleUserMenuItemClick(event, index, user)}
                                   >
                                     {option}
                                   </MenuItem>
                                 ))}
                               </MenuList>
                             </ClickAwayListener>
                           </Paper>
                         </Grow>
                       )}
                        </Popper>
                       </div>
                    </div>)
                  }) 
                }
             </div>
             }
          </div>
          </Suspense>
        </TabPanel>
        <div className={styles["add-test-floating-btn"]}>
          
        <Fab color="primary" aria-label="add" onClick={handleFloatingButtonClick}>
         <AddIcon />
        </Fab>
        </div>
         
        <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={openDeletePopup} itemAndCollectionName={itemAndCollectionNameToDelete} />

        <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} 
        open={liveViewPortModalOpen} stopPlaying={stopLiveView} port={liveViewPort}/>

        <TestUpsertModal style={{overflow:"hidden"}} 
        handleUpsertTestModalClose={handleUpsertTestModalClose} 
        open={openUpsertTestModal} currentTestPicked={currentTestPicked}/>

        <UserUpsertModal currentUserPicked={currentUserPicked} 
        handleUpsertUserModalClose={handleUpsertUserModalClose} open={openUpsertUserModal}/>
      </div>
    );
  
}
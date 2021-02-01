import React, {createRef, Suspense} from 'react';
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
import TroubleshootMenu from '../TroubleshootMenu/TroubleshootMenu'
import Container, { CONTAINER_MODE } from '../../utils/Container.controller';
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DeletePopup from '../DeletePopup/DeletePopup'
import {TEST_STATUS} from '../../models/Test.model'
import ServiceStore from '../../services /store.service'
import styles from './Home.css';


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


let runOnceUser:any = false;
let runOnceTest:any = false;

export default function SimpleTabs(props:any) {
  const elRefsUser = React.useRef([]);
  const elRefsTest = React.useRef([]);
  
  const optionsTest = ['Actions','Play', 'Live view' ,'Edit', 'Delete','Export'];
  const optionsUser = ['Edit','Delete'];


  const tests = serviceStore.readDocs('tests');
  const users = serviceStore.readDocs('users');

  const [state, _setState] = React.useState({
    tabIndex:0,
    openUpsertTestModal:false,
    openUpsertUserModal:false,
    liveViewPort:null,
    liveViewPortModalOpen:false,
    currentUserPicked:null,
    currentTestPicked:null,
    portsPlaying:{},
    stopLiveView:true,
    openDeletePopup:false,
    itemAndCollectionNameToDelete:null,
    currentRuningTestName: {
      name:"",
      status:""
    },
    openTroubleshootMenu:false,
    testTroubleshootPick:false,
    openUserActionBtnGrp:[],
    openTestActionBtnGrp:[]

  });

  const setState = (newState:any) => {
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      _setState(newState)
      resolve(null);
    },300)
  })
  }

  const handleTroubleshootMenuClose = async (e:any) => {
    runOnceUser = false;
    runOnceTest = false;
    await setState({...state, openTroubleshootMenu:false})
  }

  const handleUpsertTestModalClose = async (e:any) =>{
    runOnceUser = false;
    runOnceTest = false;
    await setState({...state, currentTestPicked:null, openUpsertTestModal:false})
  }

  const handleUpsertUserModalClose = async (e:any) =>{
    await setState({...state, openUpsertUserModal:false, currentUserPicked:null})
  }

  const handleLivePreviewModalClose = async (e:any) => {
    await setState({...state, stopLiveView:true})
    setTimeout(async ()=>{
      await setState({...state, liveViewPort:null})
    }, 300)
  }

  const handleChange = async (event: React.ChangeEvent<{}>, newValue: number) => {
    await setState({...state, tabIndex:newValue})
  };

  const handleLiveViewClick = async (test:any) => {
    await setState({...state, liveViewPort:state.portsPlaying[test.id], 
      stopLiveView:false, liveViewPortModalOpen:true})
  }

  const handleDeletePopupClose = async (e:any) =>{
    runOnceUser = false;
    runOnceTest = false;
    await setState({...state, itemAndCollectionNameToDelete:null, openDeletePopup:false})
  }

  const playTestSuite = async (testSuite:any, testSuiteIdx:any) => {
    let testIdx = 0;
    for(const test of testSuite.suite) {
       await playTest(test, testSuite.id, testIdx, testSuiteIdx)
       testIdx++;
    }
  }

  const saveTestFail = (testResp:any, testSuiteIdx:any) => {
    tests[testSuiteIdx].lastFailResult = testResp;
    serviceStore.updateDocs('tests', tests)
  }

  const playTest = async (test:any, testSuiteId:any, testIdx:any, testSuiteIdx:any) => {
    await changeTestStatus(test, TEST_STATUS.PLAYING)
    const actions = serviceStore.readDocs('actions');
    const user = users[test.userId];
    const action = actions[test.actionId]
    const playingContainerInstance = new Container(CONTAINER_MODE.player);
    await playingContainerInstance.init(action.startUrl, user.id);
    await setState({...state, portsPlaying:{...state.portsPlaying, [testSuiteId]:playingContainerInstance._port}})
    const testResp:any = await (await playingContainerInstance.play(true, action)).json()
    if(testResp.success) {
      await changeTestStatus(test, TEST_STATUS.SUCCESS)
    } else {
      testResp.testIdx = testIdx;
      saveTestFail(testResp, testSuiteIdx)
      await changeTestStatus(test, TEST_STATUS.FAIL)
      //TODO : save failed testResp
      //pop up troubleshoot menu 
    }
    await setState({...state, portsPlaying:{...state.portsPlaying, [test.id]:false}})
  }

  const changeTestStatus = async (test:any, status:any) => {
    await setState({...state, currentRuningTestName:{name:test.testName, status }})
  }

  const handleUserClick = async (user:any) => {
    serviceStore.upsertAppStateValue('currentUser', user)
    await setState({...state, currentUserPicked:user, openUpsertUserModal:true})
    //TODO: open upsert user Modal with user 
  }

  const handleFloatingButtonClick = async (e:any) => {
    if(state.tabIndex === 0) {
      await setState({...state, openUpsertTestModal:!state.openUpsertTestModal})
    } else {
      await setState({...state, currentUserPicked:null, openUpsertUserModal:!state.openUpsertUserModal})
      serviceStore.upsertAppStateValue('userName', null)
    }
  }

  const handleToggleTest = async (index:any) => {
    const newArr = state.openTestActionBtnGrp.map((item:any,idx:any)=>{
      if(idx === index){
         return !item;
      }
      return false;
   })
   await setState({...state, openTestActionBtnGrp:newArr})
  };

  const handleToggleUser = async (index:any) => {
    const newArr = state.openUserActionBtnGrp.map((item:any,idx:any)=>{
      if(idx === index){
         return !item;
      }
      return false;
   })
   await setState({...state, openUserActionBtnGrp:newArr})
  };

  const handleCloseTest = async (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
    if (elRefsTest.current[index] && elRefsTest.current[index].current.contains(event.target as HTMLElement)) {
      return;
    }
    await setState({...state, openTestActionBtnGrp:state.openTestActionBtnGrp.map(i => false)})
  };

  const handleCloseUser = async (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
    if (elRefsUser.current[index] && elRefsUser.current[index].current.contains(event.target as HTMLElement)) {
      return;
    }
    await setState({...state, openUserActionBtnGrp:state.openUserActionBtnGrp.map(i => false)})
  }

  const editUserOrTest = async (collectionName:any, item:any) => {
    if(collectionName === 'users') {
      handleUserClick(item)
    } else {
      await setState({...state, currentTestPicked:item, openUpsertTestModal:true})
    }
  } 

  const deleteUserOrTest = async (collectionName:any, item:any) => {
    await setState({...state, openDeletePopup:true , itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
  }

  const handleUserMenuItemClick =  (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    optionIdx: number,
    user:any
  ) => {
    switch (optionIdx) {
      case 0:
        editUserOrTest('users', user);
      break;

      case 1:
        deleteUserOrTest('users', user)
      break;
    
      default:
        break;
    }
  };

  const handleFailClick = async (testSuite:any) => {
    await setState({...state, openTroubleshootMenu:true, testTroubleshootPick:testSuite})
  }


  const handleTestMenuItemClick = async (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    optionIdx: number,
    test:any,
    testSuiteIdx: number
  ) => {
    switch (optionIdx) {
      case 1:
        playTestSuite(test, testSuiteIdx)
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
    await setState({...state, openTestActionBtnGrp:false})
  };

  (async ()=>{
    if(Object.values(tests).length > 0 && !runOnceTest) {
      runOnceTest = true;
      elRefsTest.current = Array(Object.values(tests).length).fill(null).map((_, i) => elRefsTest.current[i] || createRef())
      await setState({...state, openTestActionBtnGrp:Array(Object.values(tests).length).fill(false)})
    }
    if(Object.values(users).length > 0 && !runOnceUser) {
      runOnceUser = true;
      elRefsUser.current = Array(Object.values(users).length).fill(null).map((_, i) => elRefsUser.current[i] || createRef())
      await setState({...state, openUserActionBtnGrp:Array(Object.values(users).length).fill(false)})
    }
  })()

   
    return (
      <div className={styles["root"]} style={{height:"100vh",color:"white"}}>
        <AppBar style={{backgroundColor:"#232c39",color:"white"}}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={state.tabIndex} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Tests" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={state.tabIndex} index={state.tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{display: state.tabIndex === 0 ? 'block' : 'none', color:"black"}}> 
             <div className={styles["tests-menu-container"]}>
                {
                  !tests || Object.values(tests).length === 0 ? <div> 
                          You have 0 Tests
                     </div>: Object.values(tests).map((testSuite:any, testSuiteIdx:any)=> {
                    return (
                      <div className={styles["test-row"]}>
                         <div className={styles["test-name-container"]}>
                              Test suite name:&nbsp; {testSuite.suiteName}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test runing:&nbsp; {state.currentRuningTestName.name}
                         </div>
                         <div className={styles["test-name-container"]}>
                              Test status:&nbsp; {state.currentRuningTestName.status !== "FAIL" ? <Button variant="outlined" color="secondary" onClick={(e:any)=>{
                                 handleFailClick(testSuite)
                              }}>FAIL</Button> : state.currentRuningTestName.status}
                         </div>
                         <div>
                        <ButtonGroup variant="contained" color="primary" ref={elRefsTest.current[testSuiteIdx]} aria-label="split button">
                        <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
                        <Button
                          color="primary"
                          size="small"
                          aria-controls={state.openTestActionBtnGrp[testSuiteIdx] ? `split-button-menu-${testSuiteIdx}` : undefined}
                          aria-expanded={state.openTestActionBtnGrp[testSuiteIdx] ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={(e)=>{handleToggleTest(testSuiteIdx)}}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper style={{zIndex:1}} open={state.openTestActionBtnGrp[testSuiteIdx]} anchorEl={elRefsTest.current[testSuiteIdx].current} role={undefined} transition disablePortal>
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
                                 {optionsTest.map((option, optionIdx) => (
                                   <MenuItem
                                     style={optionIdx === 0 ? {display:'none'} : {}}
                                     key={option}
                                     disabled={optionIdx === 2 && !state.portsPlaying[testSuite.id]}
                                     onClick={(event:any) => handleTestMenuItemClick(event, optionIdx, testSuite, testSuiteIdx)}
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
          <div style={{display: state.tabIndex === 1 ? 'block' : 'none', color:"black"}}>
           {
             state.tabIndex !== 1 ? null:
          <div className={styles["tests-menu-container"]}>
                {
                  !users || Object.values(users).length === 0 ? <div>
                    You have 0 Users
                  </div> :  Object.values(users).map((user:any, userIdx:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]}>
                         name : {user.name}
                       </div>
                       <div>
                       <ButtonGroup variant="contained" color="primary" ref={elRefsUser.current[userIdx]} aria-label="split button">
                        <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
                        <Button
                          color="primary"
                          size="small"
                          aria-controls={state.openUserActionBtnGrp[userIdx] ? `split-button-menu-test-${userIdx}` : undefined}
                          aria-expanded={state.openUserActionBtnGrp[userIdx] ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={(e)=>{handleToggleUser(userIdx)}}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper style={{zIndex:1}} open={state.openUserActionBtnGrp[userIdx]} anchorEl={elRefsUser.current[userIdx].current} role={undefined} transition disablePortal>
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
                                 {optionsUser.map((option, optionIdx) => (
                                   <MenuItem
                                     key={option}
                                     onClick={(event:any) => handleUserMenuItemClick(event, optionIdx, user)}
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
          
        <Fab disabled={state.tabIndex === 0 && Object.values(users).length === 0} color="primary" aria-label="add" onClick={handleFloatingButtonClick}>
         <AddIcon />
        </Fab>
        </div>
         
        <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={state.openDeletePopup} itemAndCollectionName={state.itemAndCollectionNameToDelete} />

        <PlayerLiveViewModal handleLivePreviewModalClose={handleLivePreviewModalClose} 
        open={state.liveViewPortModalOpen} stopPlaying={state.stopLiveView} port={state.liveViewPort}/>

        <TestUpsertModal style={{overflow:"hidden"}} 
        handleUpsertTestModalClose={handleUpsertTestModalClose} 
        open={state.openUpsertTestModal} currentTestPicked={state.currentTestPicked}/>

        <UserUpsertModal currentUserPicked={state.currentUserPicked} 
        handleUpsertUserModalClose={handleUpsertUserModalClose} open={state.openUpsertUserModal}/>

        <TroubleshootMenu open={state.openTroubleshootMenu} 
        pickedTest={state.testTroubleshootPick}
        handleTroubleshootMenuClose={handleTroubleshootMenuClose} />
      </div>
    );
  
}
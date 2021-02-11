import React, { Suspense } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AddIcon from '@material-ui/icons/Add';
import { Fab, Button } from '@material-ui/core';
import TestUpsertModal from '../TestUpsertModal/TestUpsertModal'
import UserUpsertModal from '../UserUpsertModal/userUpsertModal'
import TroubleshootMenu from '../TroubleshootMenu/TroubleshootMenu'
import PlayerLiveViewModal from '../PlayerLiveViewModal/PlayerLiveView.component'
import DeletePopup from '../DeletePopup/DeletePopup'
import styles from './Home.css';
import { a11yProps, TabPanel } from '../../utils/general';
import ActionsDropdown from '../ActionsDropdown/ActionsDropdown';
import HomeEvents from './Home.events';


const _events = new HomeEvents();

export default function SimpleTabs(props:any) {


const [state, setState] = React.useState({
  tabIndex:0,
  openUpsertTestModal:false,
  openUpsertUserModal:false,
  openliveViewPortModal:false,
  openDeletePopup:false,
  openTroubleshootMenu:false,
  liveViewPort:null,
  currentUserPicked:null,
  currentTestPicked:null,
  portsPlaying:{},
  stopLiveView:true,
  itemAndCollectionNameToDelete:null,
  currentRuningTestName: {name:"",status:""},
  testTroubleshootPick:false,
  optionsTest:[
    {label:'Play',disabled:false}, 
    {label:'Live view', disabled:false}, 
    {label:'Edit', disabled:false},  
    {label:'Delete', disabled:false}, 
    {label:'Export', disabled:false}
  ],
  optionsUser:[
    {label:'Edit',disabled:false}, 
    {label:'Delete', disabled:false}
  ],
  tests:[],
  users:[]
});


_events.setConstructor(state, setState, props);

const {tests, users} = state;
   
return (
      <div className={styles["root"]} >
        <AppBar className={styles["app-bar"]}  position="static">
          <Tabs  indicatorColor="primary"  textColor="inherit" value={state.tabIndex} onChange={_events.handleChangeTab.bind(_events)} aria-label="simple tabs example">
            <Tab label="Tests" {...a11yProps(0)} />
            <Tab label="Users" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={state.tabIndex} index={state.tabIndex}>
        <Suspense fallback={<div>Loading...</div>}>
          <div style={{display: state.tabIndex === 0 ? 'block' : 'none', color:"black"}}> 
             <div className={styles["tests-menu-container"]}>
                {
                  !tests ||tests.length === 0 ? <div> 
                          You have 0 Tests
                     </div>: tests.map((testSuite:any, testSuiteIdx:any)=> {
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
                                 _events.handleFailClick(testSuite)
                              }}>FAIL</Button> : state.currentRuningTestName.status}
                         </div>
                         <ActionsDropdown options={state.optionsTest} handleMenuItemClick={_events.handleTestMenuItemClick.bind(_events)} />
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
                  !users || users.length === 0 ? <div>
                    You have 0 Users
                  </div> : users.map((user:any, userIdx:any)=> {
                    return (<div className={styles["test-row"]}>
                       <div className={styles["test-name-container"]}>
                         name : {user.name}
                       </div>
                       <ActionsDropdown options={state.optionsUser} 
                       handleMenuItemClick={(option:any)=>{
                        _events.handleUserMenuItemClick.bind(_events)(null, option, user);
                       }} />
                    </div>)
                  }) 
                }
             </div>
             }
          </div>
          </Suspense>
        </TabPanel>

        <div className={styles["add-test-floating-btn"]}>
           <Fab disabled={state.tabIndex === 0 && Object.values(users).length === 0} 
           color="primary" aria-label="add" onClick={_events.handleFloatingButtonClick.bind(_events)}>
            <AddIcon />
           </Fab>
        </div>
         
        <DeletePopup handleDeletePopupClose={_events.handleDeletePopupClose.bind(_events)} 
        open={state.openDeletePopup} 
        itemAndCollectionName={state.itemAndCollectionNameToDelete} />

        <PlayerLiveViewModal handleLivePreviewModalClose={_events.handleLivePreviewModalClose.bind(_events)} 
        open={state.openliveViewPortModal} stopPlaying={state.stopLiveView} port={state.liveViewPort}/>

        <TestUpsertModal style={{overflow:"hidden"}} 
        handleUpsertTestModalClose={_events.handleUpsertTestModalClose.bind(_events)} 
        open={state.openUpsertTestModal} currentTestPicked={state.currentTestPicked}/>

        <UserUpsertModal currentUserPicked={state.currentUserPicked} 
        handleUpsertUserModalClose={_events.handleUpsertUserModalClose.bind(_events)} open={state.openUpsertUserModal}/>

        <TroubleshootMenu open={state.openTroubleshootMenu} 
        pickedTest={state.testTroubleshootPick}
        handleTroubleshootMenuClose={_events.handleTroubleshootMenuClose.bind(_events)} />
      </div>
    );
  
}
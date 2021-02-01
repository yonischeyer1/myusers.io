import React, { createRef } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, TextField } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import RecordingModal from '../RecordingModal/RecordingModal'
import ServiceStore from '../../services /store.service';
import DynamicSnapshotModal from '../DynamicSnapshotModal/DynamicSnapshotModal'
import styles from './ActionUpsertModal.css';
import DeletePopup from '../DeletePopup/DeletePopup';
import EditTagModal from '../EditTagModal/EditTagModal'

const serviceStore = new ServiceStore();


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let onceflag = false;
export default function FullScreenDialog(props:any) {
  const { open, pickedAction } = props;
  const elRefs = React.useRef([]);
  const optionsUser = ['Edit','Delete'];
  const [state, _setState] = React.useState({
    openRecordingModal:false,
    dynamicSnapshotModalData:false,
    dynamicSnapshotOpen:false,
    actionName:'',
    openDeletePopup:false,
    openEditTagModal:false,
    zeTag:false,
    itemAndCollectionNameToDelete:false,
    openUserActionBtnGrp:[]
  })

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  const handleClose = async (e:any) => {
    const {handleUpsertActionModalClose} =  props;
    handleUpsertActionModalClose(false);
    onceflag = false
  };

  const handleDeletePopupClose = async (e:any) =>{
    await setState({...state, itemAndCollectionNameToDelete:false, openDeletePopup:false})
  }

  const handleEditTagModalClose = async (e:any) => {
    await setState({...state, openEditTagModal:false, zeTag:null})
    onceflag = false;
  }
 

  const handleRecordingModalClose = async () =>{
    await setState({...state, openRecordingModal:false})
    onceflag = false;
  }

  const handleRecordBtnClick = async (e:any) => {
    await setState({...state, openRecordingModal:true})
  }


 const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
    tag["dynamic"] = {coords, drawURI}
 }

 const handleDynamicSnapshotModalClose = async (e:any) => {
    await setState({...state, dynamicSnapshotOpen:false})
 }

 const handleActionNameChange = async (e:any) => {
    const key = "actionName"
    const newActionName = e.target.value
    await setState({...state, actionName:newActionName})
    serviceStore.upsertAppStateValue(key, newActionName)
 }

 const handleAddLiveSnapshotClick = (e:any) =>{

 }
 
 const editTag = async (tag:any) => {
  await setState({...state, zeTag:tag, openEditTagModal:true})
} 

const deleteTag = async (collectionName:any, item:any) => {
  await setState({...state, openDeletePopup:true ,itemAndCollectionNameToDelete:{collectionName, item, currentUserPicked}})
}

const handleTagMenuItemClick =  (
  event: React.MouseEvent<HTMLLIElement, MouseEvent>,
  index: number,
  tag:any
) => {
  switch (index) {
    case 0:
      editTag(tag);
    break;

    case 1:
      return;
      //deleteTag('users', user)
    break;
  
    default:
      break;
  }
};

 const saveCurrentActionTags = async (e:any) => {
   const actions = serviceStore.readDocs('actions')
   actions[pickedAction.id].tags = pickedAction.tags;
   serviceStore.updateDocs('actions', actions);
 }

 const handleCloseTag = async (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
  if (elRefs.current[index] && elRefs.current[index].current.contains(event.target as HTMLElement)) {
    return;
  }
  await setState({...state, openUserActionBtnGrp:state.openUserActionBtnGrp.map(i => false)})
}

 const handleToggleTag = async (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
  const newArr = state.openUserActionBtnGrp.map((item:any,idx:any)=>{
     if(idx === index){
        return !item;
     }
     return false;
  })
  await setState({...state, openUserActionBtnGrp:newArr})
};

(async ()=>{
  if(open && pickedAction && !onceflag) {
    console.log("hara")
    onceflag = true;
    elRefs.current = Array(pickedAction.tags.length).fill(null).map((_, i) => elRefs.current[i] || createRef())
    await setState({...state, actionName:pickedAction.name ,openUserActionBtnGrp:Array(pickedAction.tags.length).fill(false)})
  }
})()

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={state.actionName}
             onChange={handleActionNameChange} 
             label="Action Name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
            <br/>
        <div style={{display:"flex", alignItems:"center"}}>
        <div className={styles["recoreder-control-button"]}>
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={handleRecordBtnClick}>
                 {pickedAction ? "Record Again" : "Record"}</Button>
        </div>
        <div className={styles["live-snapshot-controls"]}>
        <Button size="small" variant="outlined" color="primary" disabled={false} onClick={handleAddLiveSnapshotClick}>ADD Live snapshot +</Button>
        </div>
        </div>
        <br/><br/> 
         {
           !pickedAction ? null : 
           <div>
          <h3>Tag List:</h3>
           <div className={styles["tags-editor-container"]}>
              {
                 pickedAction.tags.map((tag, index)=>{
                  return (
                  <div style={{display:'flex', marginTop:'20px'}}>
                    <div>
                       Tag name : {tag.name}
                    </div>
                    <div style={{marginLeft:'250px'}}>
                    <ButtonGroup variant="contained" color="primary" ref={elRefs.current[index]} aria-label="split button">
                        <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
                        <Button
                          color="primary"
                          size="small"
                          aria-controls={state.openUserActionBtnGrp[index] ? `split-button-menu-test-${index}` : undefined}
                          aria-expanded={state.openUserActionBtnGrp[index] ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={(e)=>{handleToggleTag(e,index)}}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper style={{zIndex:1}} open={state.openUserActionBtnGrp[index]} anchorEl={elRefs.current[index].current} role={undefined} transition disablePortal>
                       {({ TransitionProps, placement }) => (
                         <Grow
                           {...TransitionProps}
                           style={{
                             zIndex:1,
                             transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                           }}
                         >
                           <Paper>
                             <ClickAwayListener onClickAway={(e:any)=>{handleCloseTag(e,index)}}>
                               <MenuList style={{zIndex:1}} id={`split-button-menu-test-${index}`}>
                                 {optionsUser.map((option, index) => (
                                   <MenuItem
                                     key={option}
                                     onClick={(event:any) => handleTagMenuItemClick(event, index, tag)}
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
                  )})
            }
           </div>
           </div>
         }
         <br/><br/>
         <div className={styles["done-cancel-btns"]}>
         <Button size="small" variant="outlined" color="secondary" onClick={()=>{}}>Cancel</Button>
         &nbsp;&nbsp;
         <Button size="small" variant="outlined" color="primary" onClick={saveCurrentActionTags}>Save</Button>
         </div>
     </div>
     <EditTagModal open={state.openEditTagModal} handleEditTagModalClose={handleEditTagModalClose} tag={state.zeTag}/>
     <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={state.openDeletePopup} itemAndCollectionName={state.itemAndCollectionNameToDelete} />
     <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
     <RecordingModal handleRecordingModalClose={handleRecordingModalClose} open={state.openRecordingModal}/>
      </Dialog>
    </div>
  ) : <div></div>
}
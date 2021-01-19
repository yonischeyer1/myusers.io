import React, { createRef } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
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

const serviceStore = new ServiceStore();

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

let onceflag = false;
let anchorRefUser:any = []
export default function FullScreenDialog(props:any) {
  const classes = useStyles();
  const [openRecordingModal, setOpenRecordingModal] = React.useState(false)
  const [dynamicSnapshotModalData, setdynamicSnapshotModalData] = React.useState(null)
  const [dynamicSnapshotOpen, setDynamicSnapshotOpen] = React.useState(false)
  const [actionName, setActionName] = React.useState(false);
  const [openUserActionBtnGrp, setOpenUserActionBtnGrp] = React.useState([])
  const [openDeletePopup, setOpenDeletePopup] = React.useState(false)
  const [itemAndCollectionNameToDelete, setItemAndCollectionNameToDelete] = React.useState(null)
  const { open, pickedAction } = props;
  const elRefs = React.useRef([]);
  const optionsUser = ['Edit','Delete'];

  const handleClose = (e:any) => {
    const {handleUpsertActionModalClose} = props;
    handleUpsertActionModalClose(false);
    onceflag = false
    setActionName(null)
  };

  const handleDeletePopupClose = (e:any) =>{
    setItemAndCollectionNameToDelete(null);
    setOpenDeletePopup(false)
  }

  const handleRecordingModalClose = () =>{
     setOpenRecordingModal(false)
  }

  const handleRecordBtnClick = (e:any) => {
    setOpenRecordingModal(true)
  }

  const handleAddLiveSnapshotClick = (e:any) => {

  }


  const handleDynamicSnapshotModalSave = ({tag, coords, drawURI}) => {
    tag["dynamic"] = {coords, drawURI}
 }

 const handleDynamicSnapshotModalClose = (e:any) => {
  setDynamicSnapshotOpen(false)
 }

  const handleActionNameChange = (e:any) => {
    const key = "actionName"
    const newActionName = e.target.value
    setActionName(newActionName)
    serviceStore.upsertAppStateValue(key, newActionName)
  }
 

const editTag = (collectionName:any, item:any) => {
  if(collectionName === 'users') {
    handleUserClick(item)
  } else {
    setCurrentTestPicked(item)
    setOpenUpsertTestModal(true)
  }
} 

const deleteTag = (collectionName:any, item:any) => {
  setItemAndCollectionNameToDelete({collectionName, item, currentUserPicked})
  setOpenDeletePopup(true);
}

const handleTagMenuItemClick =  (
  event: React.MouseEvent<HTMLLIElement, MouseEvent>,
  index: number,
  user:any
) => {
  switch (index) {
    case 0:
      editTag('users', user);
    break;

    case 1:
      deleteTag('users', user)
    break;
  
    default:
      break;
  }
  //TODO: execute action by Index
  setOpenUserActionBtnGrp(false);
};

 const saveCurrentActionTags = async (e:any) => {
   const actions = serviceStore.readDocs('actions')
   actions[pickedAction.id].tags = pickedAction.tags;
   serviceStore.updateDocs('actions', actions);
 }

 const handleCloseTag = (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
  if (elRefs.current[index] && elRefs.current[index].current.contains(event.target as HTMLElement)) {
    return;
  }
  setOpenUserActionBtnGrp(openUserActionBtnGrp.map(i => false));
}

 const handleToggleTag = (event: React.MouseEvent<Document, MouseEvent>, index:any) => {
  const newArr = openUserActionBtnGrp.map((item:any,idx:any)=>{
     if(idx === index){
        return !item;
     }
     return false;
  })
  setOpenUserActionBtnGrp(newArr);
};

 if(open && pickedAction && !onceflag) {
   elRefs.current = Array(pickedAction.tags.length).fill(null).map((_, i) => elRefs.current[i] || createRef())
   setOpenUserActionBtnGrp(Array(pickedAction.tags.length).fill(false))
   onceflag = true;
   setActionName(pickedAction.name)
 }

  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={actionName}
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
                          aria-controls={openUserActionBtnGrp[index] ? `split-button-menu-test-${index}` : undefined}
                          aria-expanded={openUserActionBtnGrp[index] ? 'true' : undefined}
                          aria-label="select merge strategy"
                          aria-haspopup="menu"
                          onClick={(e)=>{handleToggleTag(e,index)}}
                        >
                        <ArrowDropDownIcon />
                       </Button>
                       </ButtonGroup>
                       <Popper style={{zIndex:1}} open={openUserActionBtnGrp[index]} anchorEl={elRefs.current[index].current} role={undefined} transition disablePortal>
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
     <DeletePopup handleDeletePopupClose={handleDeletePopupClose} open={openDeletePopup} itemAndCollectionName={itemAndCollectionNameToDelete} />
     <DynamicSnapshotModal handleDynamicSnapshotModalSave={handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={handleDynamicSnapshotModalClose} open={dynamicSnapshotOpen} dataURI={dynamicSnapshotModalData}/>
     <RecordingModal handleRecordingModalClose={handleRecordingModalClose} open={openRecordingModal}/>
      </Dialog>
    </div>
  ) : <div></div>
}
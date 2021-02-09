import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { TextField } from '@material-ui/core';
import RecordingModal from '../RecordingModal/RecordingModal'
import DynamicSnapshotModal from '../StaticMaskingWizard/StaticMaskingWizard'
import styles from './ActionUpsertModal.css';
import DeletePopup from '../DeletePopup/DeletePopup';
import EditTagModal from '../EditTagModal/EditTagModal'
import { Transition } from '../../utils/general';
import ActionsUpsertModalEvents from './ActionUpsertModal.events';
import ActionsDropdown from '../ActionsDropdown/ActionsDropdown';

const _events = new ActionsUpsertModalEvents();

export default function FullScreenDialog(props:any) {
  const { open, pickedAction } = props;
  const [state, _setState] = React.useState({
    actionsDropdownOptions: [
      {label:'Edit', disabled:false},
      {label:'Delete', disabled:false}
    ],
    openRecordingModal:false,
    dynamicSnapshotModalData:false,
    dynamicSnapshotOpen:false,
    actionName:'',
    openDeletePopup:false,
    openEditTagModal:false,
    zeTag:false,
    itemAndCollectionNameToDelete:false,
  })

  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  _events.setConstructor(state, setState, props);


  return open ? (
    <div>
      <Dialog fullScreen open={open} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Action Upsert 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
          <div className={styles["test-name-container"]}>
             <TextField disabled={false} value={state.actionName}
             onChange={_events.handleActionNameChange} 
             label="Action Name:" variant="outlined" style={{width:"1024px", height:"45px"}} size="small"/>
          </div>
            <br/>
        <div style={{display:"flex", alignItems:"center"}}>
        <div className={styles["recoreder-control-button"]}>
               <Button size="small" variant="outlined" color="secondary" disabled={false} onClick={_events.handleRecordBtnClick}>
                 {pickedAction ? "Record Again" : "Record"}</Button>
        </div>
        <div className={styles["live-snapshot-controls"]}>
        <Button size="small" variant="outlined" color="primary" disabled={false} onClick={_events.handleAddLiveSnapshotClick}>ADD Live snapshot +</Button>
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
                    <ActionsDropdown options={state.optionsUser} handleMenuItemClick={_events.handleUserMenuItemClick} />
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
         <Button size="small" variant="outlined" color="primary" onClick={_events.saveCurrentActionTags}>Save</Button>
         </div>
     </div>
     <EditTagModal open={state.openEditTagModal} handleEditTagModalClose={_events.handleEditTagModalClose} tag={state.zeTag}/>
     <DeletePopup handleDeletePopupClose={_events.handleDeletePopupClose} open={state.openDeletePopup} itemAndCollectionName={state.itemAndCollectionNameToDelete} />
     <DynamicSnapshotModal handleDynamicSnapshotModalSave={_events.handleDynamicSnapshotModalSave}
        handleDynamicSnapshotModalClose={_events.handleDynamicSnapshotModalClose} open={state.dynamicSnapshotOpen} dataURI={state.dynamicSnapshotModalData}/>
     <RecordingModal handleRecordingModalClose={_events.handleRecordingModalClose} open={state.openRecordingModal}/>
      </Dialog>
    </div>
  ) : <div></div>
}
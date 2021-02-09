import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styles from './DeletePopup.css'
import { Transition } from '../../utils/general';
import DeletePopUpEvents from './DeletePopUp.events';

const _events = new DeletePopUpEvents();

export default function FullScreenDialog(props:any) {
  const { itemAndCollectionName } = props;
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
  _events.setConstructor(state, setState, props);

  return itemAndCollectionName ? (
    <div>
      <Dialog fullScreen open={itemAndCollectionName} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Remove {itemAndCollectionName.item.name} 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
            <div>
                Are you sure you want to delete {itemAndCollectionName.item.name} &nbsp; 
                 From {itemAndCollectionName.collectionName} ? 
            </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleDeleteItemClick}>Yes</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleClose}>No</Button>
            </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}
import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styles from './DeletePopup.css'
import { Transition } from '../../utils/general';
import DeletePopUpEvents, {DEFAULT_COMPONENT_STATE} from './DeletePopUp.events';

const _events = new DeletePopUpEvents();

export default function FullScreenDialog(props:any) {
  const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE})

  _events.setConstructor(state, setState, props);

  const { itemAndCollectionName } = state;

  const doOpen = !!itemAndCollectionName.item.name && !!itemAndCollectionName.collectionName

  return doOpen ? (
    <div>
      <Dialog fullScreen open={doOpen} TransitionComponent={Transition}>
        <AppBar className={styles["app-bar"]}>
          <Toolbar>
            <Typography variant="h6" className={styles["title"]}>
              Remove {itemAndCollectionName.item.name} 
            </Typography>
            <Button color="inherit" onClick={_events.handleClose.bind(_events)}>
                Close
              </Button>
            </Toolbar>
          </AppBar>
        <div className={styles["modal-content-container"]}>
            <div>
                Are you sure you want to delete 
                {` ${itemAndCollectionName.item.name} `}  
                 From {itemAndCollectionName.collectionName} ? 
            </div>
            <br/><br/><br/>
            <div>
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleDeleteItemClick.bind(_events)}>Yes</Button>
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            <Button size="small" variant="outlined" color="primary" onClick={_events.handleClose.bind(_events)}>No</Button>
            </div>
       </div>
      </Dialog>
    </div>
  ) : <div></div>;
}
import React from 'react';
import styles from './VncViewer.css'
import VncViewerEvents, { DEFAULT_COMPONENT_STATE } from '../VncViewer/VncViewer.events'

const _events = new VncViewerEvents();


export default function FullScreenDialog(props:any) {
    const [state, setState] = React.useState({...DEFAULT_COMPONENT_STATE})

    _events.setConstructor(state, setState, props);

    const { mode } = state;

    const disableClicks = mode === "player";

    return (
        <div className={styles["vnc-view-container"]}  data-tid="container">
          <div id={"screen-" + mode} style={disableClicks ? {pointerEvents:"none"}: {}}></div> 
        </div>
    );
}

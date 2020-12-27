import React from 'react';
import RFB from '@novnc/novnc/core/rfb';

export default class VncViewerComponent extends React.Component {
rfb:any;
constructor(props: any) {
    super(props);
    this.state = {record:false}
}
init(){}

componentDidMount() {
    this.connectToContainerVnc()
}

componentWillUnmount() {

}
connectedToServer(e:any) {
            
}

componentDidUpdate(prevProps) {
    if(this.props.stopRecord) {
        console.log("stopRecord")
        this.stopRecording();
    } else if (this.props.port && prevProps.port !== this.props.port) {
      this.connectToContainerVnc();
    }
  }

disconnectedFromServer(e:any) {
    if (e.detail.clean) {
        //status("Disconnected cleanly");
    } else {
       // status("Something went wrong, connection is closed");
    }
}

credentialsAreRequired(e:any) {
    const password = prompt("Password Required:");
    this.rfb.sendCredentials({ password: password });
}

readQueryVariable(name:any, defaultValue:any) {
    // A URL with a query parameter can look like this:
    // https://www.example.com?myqueryparam=myvalue
    //
    // Note that we use location.href instead of location.search
    // because Firefox < 53 has a bug w.r.t location.search
    const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
          match = document.location.href.match(re);

    if (match) {
        // We have to decode the URL since want the cleartext value
        return decodeURIComponent(match[1]);
    }

    return defaultValue;
}
connectToContainerVnc() {
const { port } = this.props
console.log("port",port)
return new Promise((resolve, reject)=>{
        const host = "localhost"
        const password = this.readQueryVariable('password',"");
        const path = this.readQueryVariable('path', 'websockify');
        let url;
        if (window.location.protocol === "https:") {
            url = 'wss';
        } else {
            url = 'ws';
        }
        url += '://' + host;
        if(port) {
            url += ':' + port;
        }
        url += '/' + path;
        const element = document.getElementById(`screen-${this.props.mode}`);
        this.rfb = new RFB(element, url, {
          credentials: { password: 'TestVNC' }
        });
        this.rfb.addEventListener('connect', this.connectedToServer);
        this.rfb.addEventListener('disconnect', this.disconnectedFromServer);
        this.rfb.addEventListener('credentialsrequired', this.credentialsAreRequired);
    
        // Set parameters that can be changed on an active connection
        this.rfb.viewOnly = this.readQueryVariable('view_only', false);
        this.rfb.scaleViewport = this.readQueryVariable('scale', false);
        resolve();
  })
}

stopRecording() {
    this.rfb.sendKey(65307)
    this.rfb.disconnect();
}



render() {
let disableClicks;
const { mode } = this.props;
if(mode === "player") {
    disableClicks = true;
} else {
    disableClicks = false;
}

return (
  <div id="vnc-view-container"  data-tid="container">
    <div id={"screen-" + mode} style={disableClicks ? {pointerEvents:"none"}: {}}></div> </div>
   );
  }
}

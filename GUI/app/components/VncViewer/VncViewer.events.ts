import { setStatePromisifed } from "../../utils/general"
import RFB from '@novnc/novnc/core/rfb';

export const DEFAULT_COMPONENT_STATE = { 
    rfb:null,
    mode:"player",
    port:null,
    stopPlaying:false
}

let instance:any = null
export default class VncViewerEvents {
    initFlag:any
    setState:any
    state:any
    props:any

    constructor() {
      if(instance) {
        return instance;
      }
      this.initFlag = false;
      instance = this;
      return this;
    }

    async setConstructor(state:any, setState:any, props:any) {
         this.state = state;
         this.setState = setStatePromisifed.bind(null, setState);
         this.props = props;
         if(props.stopRecord) {
             this.stopRecording();
         } else if(!this.initFlag && this.props.port) {
            this.initFlag = true;
            await this.init();
         }
    }

    async init () {
        const { port, mode } = this.props;
        await this.setState({...this.state, port, mode}) 
        this.connectToContainerVnc();
    }

    async handleClose() {

    }

    async stopRecording() {
        this.state.rfb.disconnect();
        await this.setState({...DEFAULT_COMPONENT_STATE})
        this.initFlag = false;
    }

    connectedToServer(e:any) {
        
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
        this.state.rfb.sendCredentials({ password: password });
    }
    
    readQueryVariable(name:any, defaultValue:any) {
        const re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
              match = document.location.href.match(re);
    
        if (match) {
            return decodeURIComponent(match[1]);
        }
    
        return defaultValue;
    }

    connectToContainerVnc() {
    const { port } = this.state;
    return new Promise(async (resolve, reject)=>{
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
            const element = document.getElementById(`screen-${this.state.mode}`);
            const rfb = new RFB(element, url, {
              credentials: { password: 'TestVNC' }
            });
            rfb.addEventListener('connect', this.connectedToServer);
            rfb.addEventListener('disconnect', this.disconnectedFromServer);
            rfb.addEventListener('credentialsrequired', this.credentialsAreRequired);
        
            // Set parameters that can be changed on an active connection
            rfb.viewOnly = this.readQueryVariable('view_only', false);
            rfb.scaleViewport = this.readQueryVariable('scale', false);
            await this.setState({...this.state, rfb})
            resolve(null);
      })
    }
}
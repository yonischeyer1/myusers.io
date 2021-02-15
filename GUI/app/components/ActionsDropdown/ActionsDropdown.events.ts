import { setStatePromisifed } from "../../utils/general";
import { MenuItemOption } from "./ActionsDropdown";


let initFlag:any = false;
export default class ActionsDropdownEvents {
    initFlag:any
    setState:any
    state:any
    props:any
    anchorRef:any
    constructor() {   }
  
     async setConstructor(state:any, setState:any, props:any, anchorRef:any) {
         this.anchorRef = anchorRef;
         this.state = state;
         this.setState = setStatePromisifed.bind(null, setState);
         this.props = props;
        //  if(!initFlag) {
        //     initFlag = true;
        //     await this.init();
        //  }
      }
  
    async init () {
      // const options:MenuItemOption = this.props.options;
      // this.setState({...this.state, options})
    }
    
    async handleMenuItemClick  (option:any) {
        this.props.handleMenuItemClick(option); 
    }
   
   async handleToggle (index:any)  {
      await this.setState({...this.state, open: !this.state.open})
   };
   
   async handleClose (e: any) {
       if (this.anchorRef.current && this.anchorRef.current.contains(e.target as HTMLElement)) {
         return;
       }
       await this.setState({...this.state, open:false})
   };
    
}


import ServiceStore from "../../services /store.service";

let _state:any = null;
let _setState:any = null; 
let _props:any = null;
let _anchorRef:any = null;

export default class ActionsDropdownEvents {
    constructor() {}

    setConstructor(state:any, setState:any, props:any, anchorRef:any) {
         _state = state;
         _setState = setState;
         _props = props;
         _anchorRef = anchorRef;
    }
    async handleMenuItemClick  (option:any) {
        _props.handleMenuItemClick(option); 
    }
   
   async handleToggle (index:any)  {
      await _setState({..._state, open: !_state.open})
   };
   
   async handleClose (e: any) {
       if (_anchorRef.current && _anchorRef.current.contains(e.target as HTMLElement)) {
         return;
       }
       await _setState({..._state, open:false})
   };
    
}


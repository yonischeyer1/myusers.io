import React from "react";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@material-ui/core";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getRandomId } from "../../utils/general";
import ActionsDropdownEvents from "./ActionsDropdown.events";


export interface MenuItemOption {
    label:string;
    disabled:boolean;
}

const _events = new ActionsDropdownEvents();

export default function ActionsDropdown (props:any) {
  const options:MenuItemOption = props.options;
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const randomId = getRandomId();

  const [state, _setState] = React.useState({
        open:false
  });
  const setState = (newState:any) => {
    return new Promise((resolve)=>{
      setTimeout(()=>{
        _setState(newState)
        resolve(null);
      },0)
    })
  }

  _events.setConstructor(state, setState, props, anchorRef)


 return (
 <div>
  <ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
  <Button style={{pointerEvents:"none"}} >{'Actions'}</Button>
  <Button
   color="primary"
   size="small"
   aria-controls={state.open ? `split-button-menu-${randomId}` : undefined}
   aria-expanded={state.open ? 'true' : undefined}
   aria-label="select merge strategy"
   aria-haspopup="menu"
   onClick={_events.handleToggle}
  >
   <ArrowDropDownIcon />
  </Button>
 </ButtonGroup>
 <Popper style={{zIndex:1}} open={state.open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
  {({ TransitionProps, placement }) => (
  <Grow
    {...TransitionProps}
    style={{
      transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
    }}>
    <Paper>
      <ClickAwayListener onClickAway={_events.handleClose}>
        <MenuList id={`split-button-menu-${randomId}`}>
          {options.map((option:any) => (
            <MenuItem
              key={option.label}
              disabled={option.disabled}
              onClick={(e:any)=>{_events.handleMenuItemClick(option)}}
            >
              {option.label}
            </MenuItem>
          ))}
        </MenuList>
      </ClickAwayListener>
    </Paper>
   </Grow>
   )}
   </Popper>
  </div>
 )
}
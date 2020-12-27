// import React from 'react';
// import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress } from '@material-ui/core';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import StopIcon from '@material-ui/icons/Stop';
// import PlayArrowIcon from '@material-ui/icons/PlayArrow';
// export default class User extends React.Component {
//     constructor(props: any) {
//       super(props);
//     }
//     render() {
//     let { buttonOpreation , buttonFuntion, user } = this.props
//     return (
//     <div style={{display:"flex", color:"black", width:"100%"}}>
//      <Accordion style={{width:"100%"}}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel1a-content"
//           id="panel1a-header">
//         <div style={{display:"flex"}}>
//     <Typography style={{alignSelf:"center"}}> {user.name} &nbsp;&nbsp;&nbsp;</Typography> 
//            <CircularProgressWithLabel value={50} buttonOpreation={buttonOpreation} buttonFuntion={buttonFuntion}/> &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
//           <Typography style={{alignSelf:"center"}}>Accordion 2</Typography> 
//         </div>
//         </AccordionSummary>
//         <AccordionDetails>
//           <Typography>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
//             sit amet blandit leo lobortis eget.
//           </Typography>
//         </AccordionDetails>
//       </Accordion>
//      </div>
//         )
//     }
// }
// function CircularProgressWithLabel(props:any) {
//     const copyOfProps = Object.assign({},props)
//     if(props.buttonOpreation !== "stop") {
//         copyOfProps.value = 0
//     }
//     return (
//       <Box position="relative" display="inline-flex">
//         <CircularProgress variant="static" {...copyOfProps} />
//         <Box
//           top={0}
//           left={0}
//           bottom={0}
//           right={0}
//           position="absolute"
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//         >
//         <div style={{ width:"100%", height:"auto", display:"flex", justifyContent:"center"}}>
//             {
//                 props.buttonOpreation === "stop" ?
//                 <StopIcon style={{color:"blue"}} onClick={props.buttonFuntion}/> :
//                 <PlayArrowIcon style={{color:"green"}} onClick={props.buttonFuntion}/>

//             }
//         </div>
//         </Box>
//       </Box>
//     );
//   }


//   //<Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
//  //   props.value,
//  // )}%`}</Typography>
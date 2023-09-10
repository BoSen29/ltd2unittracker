import { useState } from 'react'
import * as React from 'react';
import './index.css'
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { css } from "@emotion/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { GlobalStyles } from '@mui/material';


export default function UnitOverlayConfig({overlayConfigValues, setOverlayConfigValues}) {
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };
  
let sxStyle = {
  backgroundColor:"#444444",
   "&.Mui-selected": {   backgroundColor: "#993333","&:hover": {   backgroundColor: "#aa4444"  }  },
   "&:hover": {   backgroundColor: "#666666"  },
   height:"2.5vh",
   width:"10vw",
  };

    return (
      <Box className="Box" sx={{ width: '100%', maxWidth: 280, bgcolor: 'background.black', fontSize:8 }}>      
        <List component="nav" aria-label="main mailbox folders">
          <ListItemButton
sx={sxStyle}
            selected={overlayConfigValues.AttackDefense}
            onClick={e => {
              setOverlayConfigValues({...overlayConfigValues, AttackDefense:!overlayConfigValues.AttackDefense});
            }}
          >
            <ListItemText primary="Attack/Defense" />
          </ListItemButton>
          <ListItemButton
          sx={sxStyle}   
          selected={overlayConfigValues.Aura}
            onClick={e => {
              setOverlayConfigValues({...overlayConfigValues, Aura:!overlayConfigValues.Aura});
            }}
          >
            <ListItemText primary="Aura" />
          </ListItemButton>
          <ListItemButton
          sx={sxStyle}          
          selected={overlayConfigValues.Cost}
            onClick={e => {
              setOverlayConfigValues({...overlayConfigValues, Cost:!overlayConfigValues.Cost});
            }}
          >
            <ListItemText primary="Cost" />
          </ListItemButton>
        </List>
        <Divider />
      </Box>
    );
}
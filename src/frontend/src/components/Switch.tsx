import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import { orange, pink, yellow } from '@mui/material/colors';
import Switch from '@mui/material/Switch';

const OrangeSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: yellow[300],
    '&:hover': {
      backgroundColor: alpha(yellow[600], theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase': {
    color: orange[700],
    '&.Mui-checked + .MuiSwitch-track': {
      backgroundColor: yellow[500],
    },
    
  },
  '& .MuiSwitch-switchBase + .MuiSwitch-track': {
    backgroundColor: orange[300],
  },

  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: yellow[600],
  },
}));

const label = { inputProps: { 'aria-label': 'Color switch demo' } };

type MethodSwitchProps = {
    BFSMethod: boolean,
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    }

export function MethodSwitch({BFSMethod, handleChange}: MethodSwitchProps) {
  return (
    <div className='flex flex-row items-center'>
    <span>IDS</span>
      <OrangeSwitch {...label} checked = {BFSMethod} onChange={handleChange} />
      <span>BFS</span>
    </div>
  );
}

type FindPathSwitchProps = {
  AllPaths: boolean,
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  }

export function FindPathSwitch({AllPaths, handleChange}: FindPathSwitchProps) {
  return (
    <div className='flex flex-row items-center'>
    <span>One path</span>
      <OrangeSwitch {...label} checked = {AllPaths} onChange={handleChange} />
      <span>All path</span>
    </div>
  );
}
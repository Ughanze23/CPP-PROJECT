import React from 'react'
import api from "../api";
import { Box, Button, TextField ,Snackbar, Alert ,Typography} from '@mui/material'; 
import { useForm } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import MyTextField from './Forms/MyTextField';
import MySelectField from './Forms/MySelectField';
import MyMultiLineField from './Forms/MyMultilineField';

const PurchaseOrder = () => {
  return (
   
    <div>
    
      <form >

      <Box sx={{display:'flex', justifyContent:'space-between',width:'100%', marginBottom:'10px'}}>
         <Typography sx={{marginLeft:'20px'}}>
            Create Purchase Order
         </Typography>

      </Box>

      <Box sx={{display:'flex', width:'100%', boxShadow:3, padding:4, flexDirection:'column'}}>

          <Box sx={{display:'flex', justifyContent:'space-around', marginBottom:'40px'}}> 
              
             

          </Box>

          <Box sx={{display:'flex', justifyContent:'space-around'}}> 
             

              

              
    
          </Box>

          <Box sx={{display:'flex', justifyContent:'space-around', marginTop: '40px'}}> 

           

          </Box>

          <Box sx={{display:'flex', justifyContent:'start', marginTop:'40px'}}> 
                <Button variant="contained" type="submit" sx={{width:'10%'}}>
                   Submit
                </Button>
          </Box>

      </Box>

      </form> 

  
    </div>
  )
}

export default PurchaseOrder
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListIcon from '@mui/icons-material/List';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { Link,useLocation } from 'react-router-dom';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';



export default function Navbar(props) {
  const {drawerWidth ,content} = props
  const location = useLocation()
  const path = location.pathname
  const [open, setOpen] = React.useState(false);

  const changeOpenStatus = () => {
    setOpen(!open)
  }


  const myDrawer = (
    <div> 
    <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            
              <ListItem >
                <ListItemButton component={Link} to="/" selected={"/" === path}>
                  <ListItemIcon>
                  <DashboardIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Dashboard"} />
                </ListItemButton>
              </ListItem>
              <ListItem >
              <ListItemButton component={Link} to="/products" selected={"/products" === path}>
                  <ListItemIcon>
                    <ListIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Products"} />
                </ListItemButton>
              </ListItem>
              <ListItem >
              <ListItemButton component={Link} to="/inventory" selected={"/inventory" === path}>
                  <ListItemIcon>
                    <InventoryIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Inventory"} />
                </ListItemButton>
              </ListItem>
              <ListItem >
              <ListItemButton component={Link} to="/purchase-order" selected={"/purchase-order" === path}>
                  <ListItemIcon>
                    <ShoppingCartIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Purchase Order"} />
                </ListItemButton>
              </ListItem>
              <ListItem >
              <ListItemButton component={Link} to="/shippments" selected={"/shippments" === path}>
                  <ListItemIcon>
                    <LocalShippingIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Shippments"} />
                </ListItemButton>
              </ListItem>
              <ListItem >
              <ListItemButton component={Link} to="/users" selected={"/users" === path}>
                  <ListItemIcon>
                  <PeopleIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Users"} />
                </ListItemButton>
              </ListItem>

          </List>
        
        </Box>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton onclick={changeOpenStatus} 
          color= "inheret"
          sx={{mr:2,display:{sm:"none"}}}>
            <MenuIcon/>
            </IconButton>
        <WarehouseIcon/>
          <Typography variant="h6" noWrap component="div" sx={{ pl: 2 }}>
          FMCG Inventory Management Web App
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          display: {xs:"none",sm:"block"},
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {myDrawer}
      </Drawer>
      <Drawer
        variant="temporary"
        open = {open}
        onclose = {changeOpenStatus}
        sx={{
          display: {xs:"block",sm:"none"},
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        {myDrawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {content}
      </Box>
    </Box>
  );
}
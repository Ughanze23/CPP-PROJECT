import './App.css';
import { Routes,Route,Navigate,BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import Users from  './components/Users';
import Navbar from './components/Navbar';
import Products from './components/Products';
import PurchaseOrder from './components/PurchaseOrder';
import Shipments from './components/Shipments';
import Inventory from './components/Inventory';
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register/>
}

function App() {
  const myWidth = 220
  return (
    <div className="App">
     
       <Navbar
       drawerWidth = {myWidth}
       content = {
        <Routes>
        <Route path=""  element= {<Home/>}/>
        <Route path="/users"  element= {<Users/>} />
        <Route path="/products"  element= {<Products/>} />
        <Route path="/purchase-order"  element= {<PurchaseOrder/>} />
        <Route path="/shipments"  element= {<Shipments/>} />
        <Route path="/inventory"  element= {<Inventory/>} />
       </Routes>
       }
       
       />
       
      
    </div>
  );
}

export default App;

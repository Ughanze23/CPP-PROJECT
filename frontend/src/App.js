import './App.css';
import { Routes,Route } from 'react-router-dom';
import Home from './components/Home';
import Users from  './components/Users';
import Navbar from './components/Navbar';
import Products from './components/Products';
import PurchaseOrder from './components/PurchaseOrder';
import Shippments from './components/Shippments';
import Inventory from './components/Inventory';






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
        <Route path="/shippments"  element= {<Shippments/>} />
        <Route path="/inventory"  element= {<Inventory/>} />
       </Routes>
       }
       />
       
      
    </div>
  );
}

export default App;

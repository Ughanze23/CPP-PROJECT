import './App.css';
import { Routes,Route,Navigate,BrowserRouter } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Products from './components/Products';
import PurchaseOrder from './components/PurchaseOrder';
import Shipments from './components/Shipments';
import Inventory from './components/Inventory';
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Suppliers from './components/Suppliers';

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register/>
}


function App() {
  const myWidth = 230
  return (
    <div className="App">
     
     
     <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterAndLogout />} />

      {/* Protected Routes with Navbar */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navbar drawerWidth={myWidth} />
          </ProtectedRoute>
        }
      >
        {/* Nested Routes that will render inside Navbar via Outlet */}
        <Route index element={<Home />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="products" element={<Products />} />
        <Route path="purchase-order" element={<PurchaseOrder />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
        
    </div>
  );
}

export default App;

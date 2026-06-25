import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import NewInvoice from './pages/NewInvoice';
import Search from './pages/Search';
import InvoiceDetail from './pages/InvoiceDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { clearLoggedIn, isLoggedIn } from './auth/storage';

function Nav() {
  const navigate = useNavigate();
  if (!isLoggedIn()) return null;
  const handleLogout = () => {
    clearLoggedIn();
    navigate('/login');
  };
  return (
    <nav className="app-nav no-print">
      <NavLink to="/" end>New Invoice</NavLink>
      <NavLink to="/search">Search</NavLink>
      <button onClick={handleLogout} style={{ marginLeft: 'auto', cursor: 'pointer' }}>
        Logout
      </button>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><NewInvoice /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
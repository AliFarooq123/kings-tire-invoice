import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import NewInvoice from './pages/NewInvoice';
import Search from './pages/Search';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  return (
    <BrowserRouter>
      <nav className="app-nav no-print">
        <NavLink to="/" end>
          New Invoice
        </NavLink>
        <NavLink to="/search">Search</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<NewInvoice />} />
        <Route path="/search" element={<Search />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

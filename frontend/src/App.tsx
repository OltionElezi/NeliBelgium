import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import InvoiceForm from './pages/InvoiceForm';
import Products from './pages/Products';
import Workers from './pages/Workers';
import Expenses from './pages/Expenses';
import CompanyExpenses from './pages/CompanyExpenses';
import Trash from './pages/Trash';
import Settings from './pages/Settings';
import ClientElectricalProjects from './pages/ClientElectricalProjects';
import ElectricalEditorPage from './pages/ElectricalEditorPage';
import Portfolio from './pages/Portfolio';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Portfolio Page - Default landing page */}
      <Route path="/" element={<Portfolio />} />
      <Route path="/portfolio" element={<Portfolio />} />

      {/* Login Page */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected Dashboard Routes - Only after login */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="products" element={<Products />} />
        <Route path="workers" element={<Workers />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="company-expenses" element={<CompanyExpenses />} />
        <Route path="trash" element={<Trash />} />
        <Route path="settings" element={<Settings />} />
        <Route path="clients/:clientId/electrical" element={<ClientElectricalProjects />} />
      </Route>

      {/* Full-screen editor page (outside Layout) */}
      <Route
        path="/dashboard/clients/:clientId/electrical/:projectId"
        element={
          <ProtectedRoute>
            <ElectricalEditorPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'
import LoginPage from './pages/LoginPage/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ClientsPage from './pages/ClientsPage/ClientsPage';
import StatsPage from './pages/StatsPage/StatsPage';
import NavBar from './components/NavBar/NavBar';
import { AuthProvider, useAuth } from './hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to='/' replace />;
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route
          path='/clients'
          element={
            <PrivateRoute>
              <>
                <NavBar />
                <ClientsPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path='/stats'
          element={
            <PrivateRoute>
              <>
                <NavBar />
                <StatsPage />
              </>
            </PrivateRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer />
  </AuthProvider>
);

export default App;

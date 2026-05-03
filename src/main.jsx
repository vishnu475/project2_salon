import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ServiceDetailsPage from './pages/ServiceDetailsPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminRegisterPage from './pages/AdminRegisterPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx'
import ProtectedUserRoute from './components/ProtectedUserRoute.jsx'
import AccountPage from './pages/AccountPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/services/:slug" element={<ServiceDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route element={<ProtectedUserRoute />}>
            <Route path="/account" element={<AccountPage />} />
          </Route>
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)

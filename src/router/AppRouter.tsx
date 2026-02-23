
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ChatPage } from '../pages/chat/ChatPage';
import ProtectedRouteLayout from './route-layouts/ProtectedRouteLayout';
import AuthRouteLayout from './route-layouts/AuthRouteLayout';


export function AppRouter() {
  return (
    <Router>
      <Routes>

        <Route path='/' element={<ProtectedRouteLayout />}>
          <Route index element={<ChatPage />} />
        </Route>


        <Route path='auth' element={<AuthRouteLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

      </Routes>
    </Router>
  )
}
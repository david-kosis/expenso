import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import Account from "./pages/Account";
import AccountSettings from "./pages/AccountSettings";
import ForgotPassword from "./ForgotPassword";
import RecoveryOptions from "./RecoveryOptions";
import VerifyCode from "./VerifyCodeV2";
import ResetPassword from "./ResetPasswordV2";
import VerifyEmail from "./VerifyEmail";

import ProtectedRoute from "./components/auth/ProtectedRouteV2";
import WorkspaceSync from "./components/auth/WorkspaceSync";
import { ThemeProvider } from "./context/ThemeContext";
import "./mobile-ui.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recovery-options" element={<RecoveryOptions />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<WorkspaceSync />}>
              <Route path="/" element={<Index />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product" element={<Products />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/settings" element={<AccountSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

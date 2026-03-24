import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VendorOnboarding from "./pages/vendor/VendorOnboarding";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Admin login */}
        <Route path="/admin/home" element={<AdminDashboard />} />

        {/* Vendor login */}
        <Route
          path="/partner/partner-onboarding"
          element={<VendorOnboarding />}
        />
      </Route>
    </Routes>
  );
}

export default App;

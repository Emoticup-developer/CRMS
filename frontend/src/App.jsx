import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateTicket from "./pages/customer/ticketing/CreateTicket";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/* Admin login */}
        <Route path="/admin/home" element={<AdminDashboard />} />
  <Route path="/admin/ticket/create" element={<CreateTicket />} />
</Route>
    </Routes>
  );
}

export default App;

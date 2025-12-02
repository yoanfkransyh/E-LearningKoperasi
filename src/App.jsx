import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTables from "./pages/AdminTables";
import DetailKursus from "./pages/DetailKursus.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Beranda from "./pages/beranda.jsx";
import PageKursus from "./pages/pagekursus.jsx";
import ProfilePage from "./pages/pageprofil.jsx";
import Tentangkami from "./pages/tentangkami.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/kursus" element={<PageKursus />} />
          <Route path="/kursus/:id" element={<DetailKursus />} />
          <Route path="/tentang-kami" element={<Tentangkami />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profil" element={<ProfilePage />} />
          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tables"
            element={
              <AdminRoute>
                <AdminTables />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
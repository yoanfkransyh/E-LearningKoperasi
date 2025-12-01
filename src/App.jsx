import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTables from "./pages/AdminTables";
import ConfirmEmail from "./pages/ConfirmEmail";
import DetailKursus from "./pages/DetailKursus.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Beranda from "./pages/beranda.jsx";
import PageKursus from "./pages/pagekursus.jsx";
import ProfilePage from "./pages/pageprofil.jsx";
import SignupPage from "./pages/signinpage.jsx";
import Tentangkami from "./pages/tentangKami.jsx";
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

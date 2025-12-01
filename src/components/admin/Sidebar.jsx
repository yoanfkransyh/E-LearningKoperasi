// src/components/admin/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
    <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
    <nav className="space-y-4">
      <Link to="/admin/dashboard" className="block hover:text-blue-600">
        Dashboard
      </Link>
      <Link to="/admin/courses" className="block hover:text-blue-600">
        Manajemen Kursus
      </Link>
    </nav>
  </aside>
);

export default Sidebar;

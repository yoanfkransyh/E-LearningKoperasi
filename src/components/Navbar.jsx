import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-bogor.png";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate("/");
  };

  const isAdminPage = location.pathname === "/admin";
  const isHomePage = location.pathname === "/";

  // Tambahkan helper untuk menandai route aktif
  const isRouteActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-md inline-block transition text-sm ${
      isRouteActive(path)
        ? "bg-blue-700 text-white shadow"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* <header className="fixed w-full bg-white shadow-lg z-100"> */}
      <header className="fixed w-full bg-white shadow-lg z-50 h-16">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3" aria-label="Beranda">
              <img src={logo} alt="Kota Bogor" className="w-10" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg">Dinas Koperasi</span>
                <span className="text-sm text-gray-500">Kota Bogor</span>
              </div>
            </Link>
          </div>

          {/* Navigasi - Centered */}
          <nav className="absolute right-24 md:right-32 lg:right-40 space-x-4 font-medium">
            <Link
              to="/"
              className={navLinkClass("/")}
              aria-current={isRouteActive("/") ? "page" : undefined}
            >
              Beranda
            </Link>
            <Link
              to="/kursus"
              className={navLinkClass("/kursus")}
              aria-current={isRouteActive("/kursus") ? "page" : undefined}
            >
              Kursus
            </Link>
            {isAdmin() ? (
              <Link to="/admin/tables" className={navLinkClass("/admin")}>
                Data Tables
              </Link>
            ) : (
              <Link
                to="/tentang-kami"
                className={navLinkClass("/tentang-kami")}
              >
                Tentang Kami
              </Link>
            )}
          </nav>

          {/* Bagian kanan */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* Profile picture or initial */}
                <div className="w-8 h-8 rounded-full bg-blue-700 overflow-hidden flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
                <span className="font-medium text-gray-800">
                  {profile?.full_name || user.email}
                </span>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 bg-white border shadow-md rounded-lg w-44 overflow-hidden">
                  {isAdmin() && (
                    <>
                      {/* Show Dashboard Admin only if not on admin page */}
                      {!isAdminPage && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/admin");
                          }}
                          className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100"
                        >
                          Dashboard Admin
                        </button>
                      )}
                      {/* Show Beranda only if not on home page */}
                      {!isHomePage && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/");
                          }}
                          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Beranda
                        </button>
                      )}
                    </>
                  )}
                  {/* Profile accessible for both admin and regular users */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/profil");
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profil
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-blue-700 text-white px-4 py-1.5 rounded-md hover:bg-blue-800">
                Masuk
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* spacer supaya konten berikutnya tidak tertutup oleh header fixed */}
      <div aria-hidden="true" className="h-16" />
    </>
  );
};

export default Navbar;

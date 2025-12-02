import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-bogor.png";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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
    setMobileOpen(false);
    const { error } = await signOut();
    if (error) {
      console.error("Logout error:", error);
      alert("Gagal logout: " + (error.message || String(error)));
      return;
    }
    navigate("/");
  };

  const isAdminPage = location.pathname === "/admin";
  const isHomePage = location.pathname === "/";

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
      <header className="fixed w-full bg-white shadow-lg z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/" className="flex items-center gap-3" aria-label="Beranda">
                <img src={logo} alt="Kota Bogor" className="w-10" />
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="font-bold text-lg">Dinas Koperasi</span>
                  <span className="text-sm text-gray-500">Kota Bogor</span>
                </div>
              </Link>
            </div>

            {/* Nav center (desktop) */}
            <nav className="hidden md:flex flex-1 justify-center space-x-4 font-medium">
              <Link to="/" className={navLinkClass("/")} aria-current={isRouteActive("/") ? "page" : undefined}>
                Beranda
              </Link>
              <Link to="/kursus" className={navLinkClass("/kursus")} aria-current={isRouteActive("/kursus") ? "page" : undefined}>
                Kursus
              </Link>
              {isAdmin() ? (
                <Link to="/admin/tables" className={navLinkClass("/admin")}>
                  Data Tables
                </Link>
              ) : (
                <Link to="/tentang-kami" className={navLinkClass("/tentang-kami")}>
                  Tentang Kami
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>

              {/* Auth area desktop */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((s) => !s)}
                    className="flex items-center gap-2 cursor-pointer select-none rounded-md px-2 py-1 hover:bg-gray-100"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <span
                      className="ml-1 font-medium text-gray-800 max-w-[8rem] md:max-w-xs truncate"
                      title={profile?.full_name || user.email}
                    >
                      {profile?.full_name || user.email}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-lg w-48 overflow-hidden z-50">
                      <div className="py-1">
                        {isAdmin() && !isAdminPage && (
                          <button onClick={() => { setDropdownOpen(false); navigate("/admin"); }} className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-gray-100">Dashboard Admin</button>
                        )}
                        {!isHomePage && (
                          <button onClick={() => { setDropdownOpen(false); navigate("/"); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Beranda</button>
                        )}
                        <button onClick={() => { setDropdownOpen(false); navigate("/profil"); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Profil</button>
                        <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Keluar</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden md:inline-block">
                  <button className="bg-blue-700 text-white px-4 py-1.5 rounded-md hover:bg-blue-800">Masuk</button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="md:hidden absolute inset-x-0 top-16 bg-white shadow-lg z-40">
            <div className="px-4 py-4 space-y-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Beranda</Link>
              <Link to="/kursus" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Kursus</Link>
              {isAdmin() ? (
                <Link to="/admin/tables" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Data Tables</Link>
              ) : (
                <Link to="/tentang-kami" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Tentang Kami</Link>
              )}

              <div className="border-t pt-3">
                {user ? (
                  <>
                    <button onClick={() => { setMobileOpen(false); navigate("/profil"); }} className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">Profil</button>
                    <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50">Keluar</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block">
                    <button className="w-full bg-blue-700 text-white px-4 py-2 rounded-md">Masuk</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <div aria-hidden="true" className="h-16" />
    </>
  );
};

export default Navbar;
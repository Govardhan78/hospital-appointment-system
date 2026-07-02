import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHospitalSymbol, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinks = user
    ? [
        { to: "/dashboard", label: "Dashboard" },
        ...(user.role === "patient" ? [{ to: "/doctors", label: "Find Doctors" }] : []),
        { to: "/appointments", label: user.role === "doctor" ? "My Schedule" : "Appointments" },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaHospitalSymbol className="text-white text-sm" />
            </div>
            <span className="font-bold text-gray-800 text-lg">MediBook</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.to)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 leading-none">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize leading-none mt-0.5">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  aria-label="Logout"
                >
                  <FaSignOutAlt size={14} />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>

                <button
                  className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {menuOpen && user && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.to)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

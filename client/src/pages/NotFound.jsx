import { Link } from "react-router-dom";
import { FaHospitalSymbol } from "react-icons/fa";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
        <FaHospitalSymbol className="text-blue-300 text-4xl" />
      </div>
      <h1 className="text-8xl font-bold text-gray-100 mb-2">404</h1>
      <p className="text-gray-500 text-lg mb-6">Oops! Page not found.</p>
      <Link
        to="/dashboard"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-md"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;

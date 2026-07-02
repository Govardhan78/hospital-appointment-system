import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../api/users";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";
import { FaUserMd, FaSearch, FaStar, FaCalendarPlus, FaPhone, FaClock } from "react-icons/fa";

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

const Doctors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const LIMIT = 6;

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  useEffect(() => {
    const params = { page, limit: LIMIT, ...(debouncedSearch ? { specialization: debouncedSearch } : {}) };
    setLoading(true);
    getDoctors(params)
      .then((res) => {
        setDoctors(res.data.data.doctors);
        setPagination(res.data.data.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, page]);

  if (user?.role === "doctor") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <FaUserMd className="text-blue-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Doctor Directory</h2>
        <p className="text-gray-500 text-sm mb-5">
          As a doctor, you can manage your appointments from your schedule.
        </p>
        <button
          onClick={() => navigate("/appointments")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          View My Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Our Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading..." : `${pagination.total} specialists available`}
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by specialization..."
            className="w-full border border-gray-200 bg-white rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          />
          {search !== debouncedSearch && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <FaUserMd className="text-6xl mb-4 opacity-20" />
          <p className="text-gray-500 font-medium">
            {debouncedSearch ? `No doctors found for "${debouncedSearch}"` : "No doctors available"}
          </p>
          {debouncedSearch && (
            <button onClick={() => setSearch("")} className="mt-2 text-sm text-blue-600 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc, index) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">Dr. {doc.name}</h3>
                    <p className="text-sm text-blue-600 font-medium truncate">
                      {doc.specialization || "General Physician"}
                    </p>
                    {doc.experience && (
                      <div className="flex items-center gap-1 mt-1">
                        <FaStar className="text-amber-400 text-xs" />
                        <span className="text-xs text-gray-500">{doc.experience} yrs experience</span>
                      </div>
                    )}
                  </div>
                </div>

                {doc.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <FaPhone className="text-gray-300" />
                    <span>{doc.phone}</span>
                  </div>
                )}

                {doc.availableDays?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-1.5">
                      <FaClock className="text-gray-300 text-xs" />
                      <span className="text-xs text-gray-500 font-medium">Available days</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {doc.availableDays.map((day) => (
                        <span key={day} className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-medium">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(`/book/${doc._id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <FaCalendarPlus size={13} />
                  Book Appointment
                </button>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={LIMIT}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </>
      )}
    </div>
  );
};

export default Doctors;

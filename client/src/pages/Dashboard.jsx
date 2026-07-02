import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAppointments } from "../api/appointments";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import {
  FaCalendarCheck, FaCalendarTimes, FaClock,
  FaCheckCircle, FaUserMd, FaArrowRight, FaCalendarAlt,
} from "react-icons/fa";

const StatCard = ({ icon, label, value, bgColor, iconColor }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
      <span className={`text-xl ${iconColor}`}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments({ limit: 5 })
      .then((res) => setAppointments(res.data.data.appointments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = (status) => appointments.filter((a) => a.status === status).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-7 text-white mb-8 overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500 text-blue-100 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Good day, {user?.name} 👋
          </h1>
          <p className="text-blue-200 mt-1 text-sm">
            {user?.role === "doctor"
              ? "Here's an overview of your appointments and schedule."
              : "Track your appointments and health visits all in one place."}
          </p>
          {user?.role === "patient" && (
            <Link
              to="/doctors"
              className="mt-4 inline-flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              Book Appointment <FaArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaClock />} label="Pending" value={count("pending")} bgColor="bg-amber-50" iconColor="text-amber-500" />
        <StatCard icon={<FaCalendarCheck />} label="Confirmed" value={count("confirmed")} bgColor="bg-blue-50" iconColor="text-blue-500" />
        <StatCard icon={<FaCheckCircle />} label="Completed" value={count("completed")} bgColor="bg-green-50" iconColor="text-green-500" />
        <StatCard icon={<FaCalendarTimes />} label="Cancelled" value={count("cancelled")} bgColor="bg-red-50" iconColor="text-red-400" />
      </div>

      {/* Recent appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Recent Appointments</h2>
          </div>
          <Link
            to="/appointments"
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            View all <FaArrowRight size={10} />
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaCalendarAlt className="text-5xl mb-3 opacity-20" />
            <p className="font-medium text-gray-500">No appointments yet</p>
            {user?.role === "patient" && (
              <Link
                to="/doctors"
                className="mt-4 bg-blue-600 text-white text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Book your first appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {appointments.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {user?.role === "patient"
                      ? appt.doctor?.name?.charAt(0)
                      : appt.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.role === "patient"
                        ? `Dr. ${appt.doctor?.name}`
                        : appt.patient?.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })} · {appt.timeSlot}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{appt.reason}</p>
                  </div>
                </div>
                <StatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor quick info */}
      {user?.role === "doctor" && user?.specialization && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl">
            <FaUserMd />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Dr. {user.name}</p>
            <p className="text-sm text-blue-600">{user.specialization}</p>
            {user.experience && <p className="text-xs text-gray-400 mt-0.5">{user.experience} years experience</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

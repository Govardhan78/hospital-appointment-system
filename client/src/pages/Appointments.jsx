import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAppointments, cancelAppointment,
  confirmAppointment, completeAppointment,
} from "../api/appointments";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";
import { FaCalendarAlt, FaTimesCircle, FaCheckCircle, FaArrowRight } from "react-icons/fa";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"];
const LIMIT = 8;

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [actionId, setActionId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = {
      page,
      limit: LIMIT,
      ...(activeStatus !== "all" ? { status: activeStatus } : {}),
    };
    setLoading(true);
    getAppointments(params)
      .then((res) => {
        setAppointments(res.data.data.appointments);
        setPagination(res.data.data.pagination);
      })
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, [page, activeStatus, refreshKey]);

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setActionId(id + "cancel");
    try {
      await cancelAppointment(id, { cancelReason: "Cancelled by user" });
      toast.success("Appointment cancelled");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel");
    } finally {
      setActionId(null);
    }
  };

  const handleConfirm = async (id) => {
    setActionId(id + "confirm");
    try {
      await confirmAppointment(id);
      toast.success("Appointment confirmed");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm");
    } finally {
      setActionId(null);
    }
  };

  const handleComplete = async (id) => {
    setActionId(id + "complete");
    try {
      await completeAppointment(id);
      toast.success("Marked as completed");
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.role === "doctor" ? "My Schedule" : "My Appointments"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {pagination.total} appointment{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        {user?.role === "patient" && (
          <Link
            to="/doctors"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Book New <FaArrowRight size={11} />
          </Link>
        )}
      </div>

      <div className="flex gap-2 flex-wrap mb-6 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm w-fit">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              activeStatus === s
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <FaCalendarAlt className="text-5xl mb-3 opacity-20" />
          <p className="font-medium text-gray-500">No appointments found</p>
          {user?.role === "patient" && (
            <Link to="/doctors" className="mt-3 text-sm text-blue-600 hover:underline">
              Book an appointment
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                      {(user?.role === "patient"
                        ? appt.doctor?.name
                        : appt.patient?.name
                      )?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {user?.role === "patient"
                            ? `Dr. ${appt.doctor?.name}`
                            : appt.patient?.name}
                        </h3>
                        <StatusBadge status={appt.status} />
                      </div>

                      {user?.role === "patient" && appt.doctor?.specialization && (
                        <p className="text-xs text-blue-600 font-medium mb-1">{appt.doctor.specialization}</p>
                      )}
                      {user?.role === "doctor" && appt.patient?.bloodGroup && (
                        <p className="text-xs text-gray-400 mb-1">Blood Group: {appt.patient.bloodGroup}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                        <span>
                          📅 {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                        <span>🕐 {appt.timeSlot}</span>
                      </div>

                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-500">Reason: </span>
                        {appt.reason}
                      </p>

                      {appt.cancelReason && appt.status === "cancelled" && (
                        <p className="text-xs text-red-500 mt-1.5 bg-red-50 px-2 py-1 rounded-lg inline-block">
                          ❌ {appt.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap shrink-0">
                    {user?.role === "doctor" && appt.status === "pending" && (
                      <button
                        onClick={() => handleConfirm(appt._id)}
                        disabled={actionId === appt._id + "confirm"}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <FaCheckCircle size={11} />
                        {actionId === appt._id + "confirm" ? "..." : "Confirm"}
                      </button>
                    )}
                    {user?.role === "doctor" && appt.status === "confirmed" && (
                      <button
                        onClick={() => handleComplete(appt._id)}
                        disabled={actionId === appt._id + "complete"}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <FaCheckCircle size={11} />
                        {actionId === appt._id + "complete" ? "..." : "Complete"}
                      </button>
                    )}
                    {["pending", "confirmed"].includes(appt.status) && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={actionId === appt._id + "cancel"}
                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <FaTimesCircle size={11} />
                        {actionId === appt._id + "cancel" ? "..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={pagination.pages}
            total={pagination.total}
            limit={LIMIT}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Appointments;

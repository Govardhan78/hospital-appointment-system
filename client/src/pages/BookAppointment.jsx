import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "../api/users";
import { bookAppointment } from "../api/appointments";
import toast from "react-hot-toast";
import { FaUserMd, FaCalendarAlt, FaClock, FaStar, FaArrowLeft, FaInfoCircle } from "react-icons/fa";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

const DAY_INDEX = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ appointmentDate: "", timeSlot: "", reason: "" });

  useEffect(() => {
    getUserById(doctorId)
      .then((res) => setDoctor(res.data.data))
      .catch(() => toast.error("Doctor not found"));
  }, [doctorId]);

  const allowedDayIndices = doctor?.availableDays?.length
    ? new Set(doctor.availableDays.map((d) => DAY_INDEX[d]))
    : null;

  const isDateAllowed = (dateStr) => {
    if (!dateStr) return true;
    if (!allowedDayIndices) return true;
    const [year, month, day] = dateStr.split("-").map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    return allowedDayIndices.has(dayOfWeek);
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    if (!isDateAllowed(dateStr)) {
      const dayName = new Date(...dateStr.split("-").map((n, i) => i === 1 ? n - 1 : Number(n)))
        .toLocaleDateString("en-US", { weekday: "long" });
      toast.error(`Dr. ${doctor.name} is not available on ${dayName}s. Available: ${doctor.availableDays.join(", ")}`);
      setForm((p) => ({ ...p, appointmentDate: "", timeSlot: "" }));
      return;
    }
    setForm((p) => ({ ...p, appointmentDate: dateStr, timeSlot: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.timeSlot) return toast.error("Please select a time slot");
    if (!isDateAllowed(form.appointmentDate)) {
      return toast.error("Selected date is not within doctor's available days");
    }
    setLoading(true);
    try {
      await bookAppointment({ doctorId, ...form });
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedDayName = form.appointmentDate
    ? new Date(
        ...form.appointmentDate.split("-").map((n, i) => (i === 1 ? n - 1 : Number(n)))
      ).toLocaleDateString("en-US", { weekday: "long" })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium"
      >
        <FaArrowLeft size={12} /> Back to Doctors
      </button>

      {doctor && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold shrink-0">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FaUserMd className="opacity-80 text-sm" />
                <h2 className="font-bold text-lg">Dr. {doctor.name}</h2>
              </div>
              <p className="text-blue-100 text-sm">{doctor.specialization || "General Physician"}</p>
              {doctor.experience && (
                <div className="flex items-center gap-1 mt-1">
                  <FaStar className="text-yellow-300 text-xs" />
                  <span className="text-xs text-blue-100">{doctor.experience} years experience</span>
                </div>
              )}
              {doctor.availableDays?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doctor.availableDays.map((day) => (
                    <span key={day} className="bg-white bg-opacity-20 text-white text-xs px-2 py-0.5 rounded-full">
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {doctor?.availableDays?.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6">
          <FaInfoCircle className="text-amber-500 mt-0.5 shrink-0" size={14} />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Available days only:</span>{" "}
            {doctor.availableDays.join(", ")}. Selecting any other day will not be allowed.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Book Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="text-blue-500" size={13} />
              Select Date
            </label>
            <input
              type="date"
              value={form.appointmentDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={handleDateChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
            />
            {form.appointmentDate && allowedDayIndices && !isDateAllowed(form.appointmentDate) && (
              <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                <FaInfoCircle size={11} />
                Doctor is not available on {selectedDayName}s
              </p>
            )}
            {form.appointmentDate && isDateAllowed(form.appointmentDate) && selectedDayName && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                ✓ {selectedDayName} is an available day
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <FaClock className="text-blue-500" size={13} />
              Select Time Slot
            </label>
            {!form.appointmentDate ? (
              <p className="text-sm text-gray-400 italic">Please select a date first</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, timeSlot: slot }))}
                    className={`py-2.5 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      form.timeSlot === slot
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 bg-white"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              required
              rows={4}
              placeholder="Describe your symptoms or reason for visiting the doctor..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white transition-all"
            />
          </div>

          {form.appointmentDate && form.timeSlot && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
              <p className="font-semibold text-blue-700 mb-2">Appointment Summary</p>
              <div className="space-y-1 text-gray-600">
                <p>📅 {new Date(
                  ...form.appointmentDate.split("-").map((n, i) => i === 1 ? n - 1 : Number(n))
                ).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}</p>
                <p>🕐 {form.timeSlot}</p>
                {doctor && <p>👨‍⚕️ Dr. {doctor.name}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.appointmentDate || !form.timeSlot}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Booking...
              </span>
            ) : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;

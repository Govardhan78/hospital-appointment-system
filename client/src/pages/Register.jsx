import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FaHospitalSymbol, FaUserMd, FaUser } from "react-icons/fa";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "patient", phone: "",
    specialization: "", experience: "", availableDays: [],
    dateOfBirth: "", bloodGroup: "",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleDay = (day) =>
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <FaHospitalSymbol className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Join MediBook and manage your health</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Role toggle */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
            {[
              { value: "patient", icon: <FaUser />, label: "I'm a Patient" },
              { value: "doctor", icon: <FaUserMd />, label: "I'm a Doctor" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r.value }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  form.role === r.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.icon}
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Minimum 6 characters" className={inputClass} />
            </div>

            {/* Doctor fields */}
            {form.role === "doctor" && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
                <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <FaUserMd /> Doctor Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
                    <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiology" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label>
                    <input type="number" name="experience" value={form.experience} onChange={handleChange} placeholder="5" min="0" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          form.availableDays.includes(day)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-600 hover:border-blue-400 bg-white"
                        }`}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Patient fields */}
            {form.role === "patient" && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-100 space-y-4">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                  <FaUser /> Patient Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass}>
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-md hover:shadow-lg mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

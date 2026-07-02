import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Navbar />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - any authenticated user */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute><Doctors /></ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute><Appointments /></ProtectedRoute>
            } />

            {/* Patient only */}
            <Route path="/book/:doctorId" element={
              <ProtectedRoute roles={["patient"]}>
                <BookAppointment />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

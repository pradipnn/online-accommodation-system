import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import AdminLogin from "../pages/AdminLogin";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Properties from "../pages/Properties";
import PropertyDetails from "../pages/PropertyDetails";
import PropertyForm from "../pages/PropertyForm";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Bookings from "../pages/Bookings";
import Wishlist from "../pages/Wishlist";
import RoomManagement from "../pages/RoomManagement";
import OwnerDashboard from "../pages/OwnerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/new"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <PropertyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:id/edit"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <PropertyForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:propertyId/rooms"
        element={
          <ProtectedRoute roles={["OWNER"]}>
            <RoomManagement />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

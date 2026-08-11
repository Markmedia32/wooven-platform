import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Homepage from "./pages/public/HomePage";
import ServicesPage from "./pages/public/ServicesPage";
import ExperiencePage from "./pages/public/ExperiencePage";
import DestinationsPage from "./pages/public/DestinationsPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./pages/portal/ProtectedRoute";
import PortalLayout from "./pages/portal/PortalLayout";
import LoginPage from "./pages/portal/LoginPage";
import SignupPage from "./pages/portal/SignupPage";
import DashboardPage from "./pages/portal/DashboardPage";
import NewBookingPage from "./pages/portal/NewBookingPage";
import BookingHistoryPage from "./pages/portal/BookingHistoryPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminProtectedRoute from "./pages/admin/AdminProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminPlaceholderPage from "./pages/admin/AdminPlaceholderPage";

import BookingsPage from "./pages/admin/BookingsPage";
import SupportPage from "./pages/admin/SupportPage";
import DispatchPage from "./pages/admin/DispatchPage";
import PartnerNetworkPage from "./pages/admin/PartnerNetworkPage";
import PartnersPage from "./pages/admin/PartnersPage";
import ClientsPage from "./pages/admin/ClientsPage";

function PublicLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route index element={<Homepage />} />

            <Route path="ServicesPage" element={<ServicesPage />} />
            <Route path="ExperiencePage" element={<ExperiencePage />} />
            <Route path="DestinationsPage" element={<DestinationsPage />} />
            <Route path="AboutPage" element={<AboutPage />} />
            <Route path="ContactPage" element={<ContactPage />} />

            <Route path="services" element={<ServicesPage />} />
            <Route path="experience" element={<ExperiencePage />} />
            <Route path="destinations" element={<DestinationsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Client authentication */}
          <Route path="/portal/login" element={<LoginPage />} />
          <Route path="/portal/signup" element={<SignupPage />} />
          <Route
            path="/LoginPage"
            element={<Navigate to="/portal/login" replace />}
          />

          {/* Client Portal */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route path="/portal/dashboard" element={<DashboardPage />} />
              <Route path="/portal/book" element={<NewBookingPage />} />
              <Route path="/portal/bookings" element={<BookingHistoryPage />} />
            </Route>
          </Route>

          {/* Admin authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Portal */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/bookings" element={<BookingsPage />} />
              <Route path="/admin/support" element={<SupportPage />} />
              <Route path="/admin/dispatch" element={<DispatchPage />} />

              {/* Partner onboarding: includes drivers and vehicles in one form */}
              <Route path="/admin/partners" element={<PartnersPage />} />

              {/* These show the resources created through PartnersPage */}
              <Route
                path="/admin/vehicles"
                element={<PartnerNetworkPage type="vehicles" />}
              />
              <Route
                path="/admin/drivers"
                element={<PartnerNetworkPage type="drivers" />}
              />

              <Route path="/admin/clients" element={<ClientsPage />} />

              <Route
                path="/admin/payments"
                element={
                  <AdminPlaceholderPage
                    title="Payments"
                    description="Monitor invoices, payment status and transactions."
                  />
                }
              />

              <Route
                path="/admin/reports"
                element={
                  <AdminPlaceholderPage
                    title="Reports"
                    description="Track operational performance and growth."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
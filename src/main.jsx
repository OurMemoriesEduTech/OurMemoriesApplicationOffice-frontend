import App from "./App.jsx";
import './assets/styles/color-schema-variables.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Dashboard from "./components/pages/Dashboard.jsx";
import Home from "./components/pages/Home.jsx";
import About from "./components/pages/About.jsx";
import ContactUs from "./components/pages/ContactUs.jsx";
import Announcements from "./components/pages/Announcements.jsx";

// Features
import ApplicationPortal from "./components/features/applicationPortal/ApplicationPortal.jsx";
import UniversityApplication from "./components/features/applicationPortal/applicationForms/UniversityApplication.jsx";
import TvetApplication from "./components/features/applicationPortal/applicationForms/TvetApplication.jsx";
import BursaryApplication from "./components/features/applicationPortal/applicationForms/BursaryApplication.jsx";
import CoursesYouQualify from "./components/features/coursesYouQualify/CoursesYouQualify.jsx";
import DigitalProspectuses from "./components/features/digitalProspectuses/Digital-Prospectuses.jsx";

// Admin Features
import AdminDashboard from "./components/features/admin/AdminDashboard.jsx";
import AdminManageApplications from "./components/features/admin/AdminManageApplications.jsx";
import ApplicationProcessingGuide from "./components/features/admin/ApplicationProcessingGuide.jsx";
import UserManagement from "./components/features/admin/UserManagement.jsx";
import AdminAnnouncementsPage from "./components/features/admin/AdminAnnouncementsPage.jsx";
import ViewApplication from "./components/features/admin/ViewApplication.jsx";

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import EligibilityChecker from "./components/features/coursesYouQualify/EligibilityChecker.jsx";
import UserProfile from "./components/common/UserProfile.jsx";
import AdminReports from "./components/features/admin/AdminReports.jsx";
import AdminPaymentManagement from "./components/features/admin/AdminPaymentManagement.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />, // ← This renders Header + <Outlet /> + Footer
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'about', element: <About /> },
            { path: 'contact-us', element: <ContactUs /> },
            { path: 'announcement', element: <Announcements /> },
            { path: 'courses-you-qualify', element: <EligibilityChecker /> },
            { path: 'digital-prospectuses', element: <DigitalProspectuses /> },
            { path: 'applynow', element: <ApplicationPortal /> },
            { path: 'applynow/university', element: <UniversityApplication /> },
            { path: 'applynow/tvet-college', element: <TvetApplication /> },
            { path: 'applynow/bursary', element: <BursaryApplication /> },
            { path: 'application-portal', element: <ApplicationPortal /> },
            { path: 'university-application', element: <UniversityApplication /> },
            { path: 'profile', element: <UserProfile /> },

            // Admin routes
            { path: 'admin/dashboard', element: <AdminDashboard /> },
            { path: 'admin/manage-applications', element: <AdminManageApplications /> },
            { path: 'admin/application-processing-guide', element: <ApplicationProcessingGuide /> },
            { path: 'admin/users', element: <UserManagement /> },
            { path: 'admin/announcements', element: <AdminAnnouncementsPage /> },
            { path: 'admin/applications', element: <AdminManageApplications /> },
            { path: 'admin/applications/:id', element: <ViewApplication /> },
            { path: 'admin/reports', element: <AdminReports /> },
            { path: '/admin/payments', element: <AdminPaymentManagement />},
        ],
    },
    // Optional: Separate login page if not inside layout
    // { path: '/login', element: <LoginPage /> },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
)
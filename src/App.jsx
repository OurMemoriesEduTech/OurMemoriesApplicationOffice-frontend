// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import Header from './components/Header';
// import Dashboard from './components/Dashboard';
// import About from './components/About';
// import ContactUs from './components/ContactUs';
// import ApplicationPortal from './components/applicationPortal/ApplicationPortal.jsx';
// import UniversityApplication from './components/applicationPortal/applicationForms/UniversityApplication.jsx';
// import TvetApplication from './components/applicationPortal/applicationForms/TvetApplication.jsx';
// import BursaryApplication from './components/applicationPortal/applicationForms/BursaryApplication.jsx';
// import Footer from './components/Footer';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import CoursesYouQualify from "./components/coursesYouQualify/CoursesYouQualify.jsx";
// import Digitalprospectuses from "./components/digitalProspectuses/Digital-Prospectuses.jsx";
// import Service from "./components/Service.jsx";
// import AdminDashboard from "./components/admin/AdminDashboard.jsx";
// import AdminManageApplications from "./components/admin/AdminManageApplications.jsx";
// import Testing from "./components/coursesYouQualify/Testing.jsx";
// import ApplicationProcessingGuide from "./components/admin/ApplicationProcessingGuide.jsx";
// import UserManagement from "./components/admin/UserManagement.jsx";
// import ManageApplications from "./components/admin/AdminManageApplications.jsx";
// import ViewApplication from "./components/admin/ViewApplication.jsx";
// import Announcements from "./components/Announcements.jsx";
// import AdminAnnouncementsPage from "./components/admin/AdminAnnouncementsPage.jsx";
//
// function App() {
//     return (
//         <AuthProvider>
//             <Router>
//                 <div className="App d-flex flex-column min-vh-100">
//                     <Header />
//                     <main className="flex-grow-1">
//                         <Routes>
//                             <Route path="/" element={<Dashboard />} />
//                             <Route path="/admin/dashboard" element={<AdminDashboard />} />
//                             <Route path="/applynow" element={<ApplicationPortal />} />
//                             <Route path="/applynow/university" element={<UniversityApplication />} />
//                             <Route path="/applynow/tvet-college" element={<TvetApplication />} />
//                             <Route path="/applynow/bursary" element={<BursaryApplication />} />
//                             <Route path="/profile" element={<Dashboard />} />
//                             <Route path="/about" element={<About />} />
//                             <Route path="/contact-us" element={<ContactUs />} />
//                             <Route path="/announcement" element={<Announcements />} />
//
//                             <Route path="/application-portal" element={<ApplicationPortal />} />
//                             <Route path="/courses-you-qualify" element={<CoursesYouQualify />} />
//                             <Route path="/digital-prospectuses" element={<Digitalprospectuses />} />
//                             <Route path="/apply" element={<ApplicationPortal />} />
//                             <Route path="/applynow/university" element={<UniversityApplication />} />
//
//                             <Route path="/admin/manage-applications" element={<AdminManageApplications />} />
//                             <Route path="/admin/application-processing-guide" element={<ApplicationProcessingGuide />} />
//                             <Route path="/admin/users" element={<UserManagement />} />
//                             <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
//
//
//                             <Route path="/admin/applications" element={<ManageApplications />} />
//                             <Route path="/admin/applications/:id" element={<ViewApplication />} />
//
//
//                             <Route path="/university-application" element={<UniversityApplication />} />
//
//                         </Routes>
//                     </main>
//                     <Footer />
//                 </div>
//             </Router>
//         </AuthProvider>
//     );
// }
//
// export default App;

// src/App.jsx
import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
    return (
        <div className="App d-flex flex-column min-vh-100">
            <ScrollToTop />
            <Header />
            <main className="flex-grow-1">
                <Outlet /> {/* ← All child routes render here */}
            </main>
            <Footer />
        </div>
    );
}

export default App;
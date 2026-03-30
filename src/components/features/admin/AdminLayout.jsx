import React, { useState, useEffect } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import { FiMenu } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="admin-layout">
            {/* Mobile header with hamburger */}
            <div className="admin-mobile-header d-md-none">
                <Button variant="link" onClick={() => setSidebarOpen(true)} className="admin-menu-btn">
                    <FiMenu size={24} />
                </Button>
                <span className="admin-mobile-title">Admin Dashboard</span>
            </div>

            {/* Desktop sidebar */}
            <aside className="admin-sidebar-desktop d-none d-md-block">
                <AdminSidebar />
            </aside>

            {/* Mobile offcanvas sidebar */}
            <Offcanvas
                show={sidebarOpen}
                onHide={() => setSidebarOpen(false)}
                placement="start"
                className="admin-sidebar-offcanvas"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Admin Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <AdminSidebar onNavClick={() => setSidebarOpen(false)} />
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main content */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
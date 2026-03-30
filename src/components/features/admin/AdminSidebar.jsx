// src/components/admin/AdminSidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    FiLogOut, FiHome, FiUsers, FiBook, FiFileText,
    FiBarChart2, FiBell, FiDollarSign
} from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar = ({ onNavClick }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { to: '/admin/applications', label: 'Applications', icon: <FiFileText /> },
        { to: '/admin/payments', label: 'Payments', icon: <FiDollarSign /> },
        { to: '/admin/users', label: 'Users', icon: <FiUsers /> },
        { to: '/admin/application-processing-guide', label: 'Application Process Guide', icon: <FiBook /> },
        { to: '/admin/announcements', label: 'Announcements', icon: <FiBell /> },
        { to: '/admin/reports', label: 'Reports', icon: <FiBarChart2 /> },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            if (onNavClick) onNavClick();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="admin-sidebar-inner">
            <div className="sidebar-header">
                <span className="sidebar-logo">Admin Panel</span>
            </div>
            <Nav className="flex-column">
                {navItems.map(item => (
                    <Nav.Link
                        key={item.to}
                        as={NavLink}
                        to={item.to}
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                        onClick={onNavClick}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Nav.Link>
                ))}
                <div className="sidebar-divider" />
                <Nav.Link onClick={handleLogout} className="admin-nav-link text-danger">
                    <span className="nav-icon"><FiLogOut /></span>
                    <span className="nav-label">Logout</span>
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default AdminSidebar;
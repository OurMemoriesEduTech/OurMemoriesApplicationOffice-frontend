import React, { useState, useCallback } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../common/auth/LoginModal';
import SignUpModal from '../common/auth/SignUpModal';
import ForgotPasswordModal from '../common/auth/ForgotPasswordModal';
import VerifyOtpModal from '../common/auth/VerifyOtpModal';
import ResetPasswordModal from '../common/auth/ResetPasswordModal';
import LogoIcon from '../../assets/images/download.png';
import './Header.css';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    // Modal states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    // Modal handlers
    const closeAllModals = useCallback(() => {
        setShowLoginModal(false);
        setShowSignupModal(false);
        setShowForgotPasswordModal(false);
        setShowVerifyOtpModal(false);
        setShowResetPasswordModal(false);
    }, []);

    const openLoginModal = useCallback(() => {
        closeAllModals();
        setShowLoginModal(true);
    }, [closeAllModals]);

    const openSignupModal = useCallback(() => {
        closeAllModals();
        setShowSignupModal(true);
    }, [closeAllModals]);

    const openForgotPasswordModal = useCallback(() => {
        closeAllModals();
        setShowForgotPasswordModal(true);
    }, [closeAllModals]);

    const openVerifyOtpModal = useCallback((email) => {
        setResetEmail(email);
        closeAllModals();
        setShowVerifyOtpModal(true);
    }, [closeAllModals]);

    const openResetPasswordModal = useCallback((email) => {
        setResetEmail(email);
        closeAllModals();
        setShowResetPasswordModal(true);
    }, [closeAllModals]);

    const handleLogout = useCallback(async () => {
        await logout();
        setExpanded(false);
        navigate('/');
    }, [logout, navigate]);

    const handleNavClick = useCallback(() => {
        setExpanded(false);
    }, []);

    // Get user initials for avatar
    const getUserInitials = useCallback(() => {
        if (!user?.firstName || !user?.lastName) return 'U';
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }, [user]);

    // Render navigation links based on user role
    const renderNavLinks = () => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            return (
                <Nav className="nav-links-container">
                    {/* Admin navigation links can be added here */}
                </Nav>
            );
        }

        return (
            <Nav className="nav-links-container">
                <Nav.Link as={Link} to="/" className="nav-link-custom" onClick={handleNavClick}>
                    Home
                </Nav.Link>
                <Nav.Link as={Link} to="/announcement" className="nav-link-custom" onClick={handleNavClick}>
                    Announcements
                </Nav.Link>
                <Nav.Link as={Link} to="/applynow" className="nav-link-custom" onClick={handleNavClick}>
                    {isAuthenticated ? 'My Applications' : 'Apply Now'}
                </Nav.Link>
                <Nav.Link as={Link} to="/about" className="nav-link-custom" onClick={handleNavClick}>
                    About
                </Nav.Link>
                <Nav.Link as={Link} to="/contact-us" className="nav-link-custom" onClick={handleNavClick}>
                    Contact Us
                </Nav.Link>
            </Nav>
        );
    };

    // Render user dropdown with avatar
    const renderUserDropdown = () => (
        <NavDropdown
            title={
                <div className="user-dropdown-title">
                    <div className="user-avatar">{getUserInitials()}</div>
                    <span className="user-name">
                        {user?.firstName} {user?.lastName}
                    </span>
                </div>
            }
            id="user-dropdown"
            className="nav-dropdown-custom"
            align="end"
        >
            <NavDropdown.Item as={Link} to="/profile" onClick={handleNavClick}>
                Profile
            </NavDropdown.Item>
            {user?.role === 'ADMIN' && (
                <NavDropdown.Item as={Link} to="/admin/settings" onClick={handleNavClick}>
                    Admin Settings
                </NavDropdown.Item>
            )}
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout}>
                Logout
            </NavDropdown.Item>
        </NavDropdown>
    );

    // Render authentication buttons
    const renderAuthButtons = () => (
        <>
            <Button
                variant="outline-primary"
                className="login-btn"
                onClick={openLoginModal}
                aria-label="Login"
            >
                Login
            </Button>
            <Button
                variant="primary"
                className="signup-btn"
                onClick={openSignupModal}
                aria-label="Sign Up"
            >
                Sign Up
            </Button>
        </>
    );

    return (
        <>
            <Navbar bg="light" variant="light" expand="lg" sticky="top" className="shadow-sm" expanded={expanded} onToggle={setExpanded}>
                <Container className="navbar-container">
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                        <img
                            src={LogoIcon}
                            alt="Our Memories EduSmart Logo"
                            className="logo-img me-2"
                            width="40"
                            height="40"
                        />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbar-nav" aria-label="Toggle navigation" />
                    <Navbar.Collapse id="navbar-nav">
                        {renderNavLinks()}
                        <Nav className="auth-nav ms-auto">
                            {isAuthenticated ? renderUserDropdown() : renderAuthButtons()}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Authentication Modals */}
            <LoginModal
                show={showLoginModal}
                onHide={closeAllModals}
                openSignupModal={openSignupModal}
                openForgotPasswordModal={openForgotPasswordModal}
            />
            <SignUpModal
                show={showSignupModal}
                onHide={closeAllModals}
                openLoginModal={openLoginModal}
            />
            <ForgotPasswordModal
                show={showForgotPasswordModal}
                onHide={closeAllModals}
                openLoginModal={openLoginModal}
                openVerifyOtpModal={openVerifyOtpModal}
            />
            <VerifyOtpModal
                show={showVerifyOtpModal}
                onHide={closeAllModals}
                email={resetEmail}
                openResetPasswordModal={openResetPasswordModal}
            />
            <ResetPasswordModal
                show={showResetPasswordModal}
                onHide={closeAllModals}
                email={resetEmail}
                openLoginModal={openLoginModal}
            />
        </>
    );
};

export default Header;

import React, {useEffect, useState} from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext.jsx';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import './AuthModals.css';

const LoginModal = ({ show, onHide, openSignupModal ,openForgotPasswordModal}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginTriggered, setLoginTriggered] = useState(false);
    const { login, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError('Please enter a valid email');
            setLoading(false);
            return;
        }
        if (!password || password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await login(email, password);
            setLoginTriggered(true); // Signal that login was attempted
        } catch (err) {
            setError(err.message || 'Login failed');
            setLoading(false);
            setLoginTriggered(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user && loginTriggered) {
            setLoginTriggered(false); // Reset trigger
            setLoading(false); // Stop loading
            onHide();
            if (user.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate(location.state?.from || '/application-portal');
            }
        }
    }, [isAuthenticated, user, loginTriggered, navigate, location.state, onHide]);

    const handleGoogleLogin = () => {
        window.location.href = '/oauth2/authorization/google';
    };

    const handleFacebookLogin = () => {
        window.location.href = '/oauth2/authorization/facebook';
    };

    return (
        <Modal show={show} onHide={onHide} centered scrollable backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>
                    Login to Your Account
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">
                            Email Address <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                            className="auth-input"
                        />
                    </Form.Group>

                    <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">
                            Password <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                            className="auth-input"
                        />
                    </Form.Group>

                    <Form.Group className="auth-form-group d-flex justify-content-between align-items-center">
                        <Form.Check
                            type="checkbox"
                            label="Remember Me"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                        />
                        <a href="#" onClick={openForgotPasswordModal} className="auth-link">
                            Forgot Password?
                        </a>
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </Form>

                <div className="social-divider">
                    <span className="social-divider-text">Or login with</span>
                </div>
                <Row className="g-2 mb-3">
                    <Col xs={6}>
                        <Button className="social-btn w-100" onClick={handleGoogleLogin} disabled={loading}>
                            <FcGoogle size={20} className="me-2" /> Google
                        </Button>
                    </Col>
                    <Col xs={6}>
                        <Button className="social-btn w-100" onClick={handleFacebookLogin} disabled={loading}>
                            <FaFacebook size={20} className="me-2" style={{color: '#1877f2'}} /> Facebook
                        </Button>
                    </Col>
                </Row>

                <p className="auth-footer-text">
                    Don't have an account?{' '}
                    <a href="#" onClick={openSignupModal} className="auth-link">Sign Up</a>
                </p>
            </Modal.Body>
        </Modal>
    );
};

export default LoginModal;
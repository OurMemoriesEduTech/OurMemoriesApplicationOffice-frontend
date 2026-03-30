import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../../context/AuthContext.jsx';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import './AuthModals.css';

const SignUpModal = ({ show, onHide, openLoginModal }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!firstName) {
            setError('Please enter your first name');
            setLoading(false);
            return;
        }
        if (!lastName) {
            setError('Please enter your last name');
            setLoading(false);
            return;
        }
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Phone number must be 10 digits');
            setLoading(false);
            return;
        }
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
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await signup(firstName, lastName, phoneNumber, email, password);
            // Show success modal
            setSuccessMessage('Your account has been created successfully!');
            setShowSuccessModal(true);
            onHide(); // close signup modal
        } catch (err) {
            setError(err.message || 'Sign up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setError('Google login not implemented yet');
    };

    const handleFacebookLogin = () => {
        setError('Facebook login not implemented yet');
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
        openLoginModal(); // open login modal for the user
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered scrollable backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Create Your Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="auth-form-group">
                            <Form.Label className="auth-label">
                                First Name <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                required
                                disabled={loading}
                                className="auth-input"
                            />
                        </Form.Group>
                        <Form.Group className="auth-form-group">
                            <Form.Label className="auth-label">
                                Last Name <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                required
                                disabled={loading}
                                className="auth-input"
                            />
                        </Form.Group>
                        <Form.Group className="auth-form-group">
                            <Form.Label className="auth-label">
                                Phone Number <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                required
                                disabled={loading}
                                className="auth-input"
                            />
                        </Form.Group>
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
                                minLength={6}
                                disabled={loading}
                                className="auth-input"
                            />
                        </Form.Group>
                        <Form.Group className="auth-form-group">
                            <Form.Label className="auth-label">
                                Confirm Password <span className="required">*</span>
                            </Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                                className="auth-input"
                            />
                        </Form.Group>
                        <Button type="submit" disabled={loading} className="auth-btn">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </Form>
                    <div className="social-divider">
                        <span className="social-divider-text">Or sign up with</span>
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
                        Already have an account?{' '}
                        <a href="#" onClick={openLoginModal} className="auth-link">Login</a>
                    </p>
                </Modal.Body>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Success</Modal.Title>
                </Modal.Header>
                <Modal.Body>{successMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleSuccessClose}>
                        Go to Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SignUpModal;
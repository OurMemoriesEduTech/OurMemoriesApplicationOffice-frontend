import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import './AuthModals.css';

const ForgotPasswordModal = ({ show, onHide, openVerifyOtpModal, openLoginModal }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/auth/forgot-password/request-otp`,
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setSuccess('OTP sent to your email!');
                setTimeout(() => {
                    onHide();
                    openVerifyOtpModal(email);
                }, 1500);
                setError("")
                setSuccess("")
                setEmail("")
            }
        } catch (err) {
            setError(
                err.response?.data?.fail || 'Failed to send OTP. Try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Forgot Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="auth-subtitle">
                    Enter your email and we'll send you a 6-digit code.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

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

                    <Button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </Form>

                <div className="text-center mt-3">
                    <a href="#" onClick={openLoginModal} className="auth-link">
                        Back to Login
                    </a>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ForgotPasswordModal;
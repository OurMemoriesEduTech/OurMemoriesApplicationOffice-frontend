// src/components/auth/VerifyOtpModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import './AuthModals.css';
import { API_BASE_URL } from '../../../lib/apiBase.js';

const VerifyOtpModal = ({ show, onHide, email, openResetPasswordModal }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/forgot-password/verify-otp`,
                { email, otp },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.message || response.status === 200) {
                setSuccess('OTP verified!');
                setTimeout(() => {
                    onHide();
                    openResetPasswordModal(email);
                }, 1000);
                setError("")
                setSuccess("")
                setOtp("")
            }
        } catch (err) {
            setError(err.response?.data?.fail || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Verify OTP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="auth-subtitle">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">
                            OTP Code <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="auth-input otp-input"
                            required
                            disabled={loading}
                        />
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default VerifyOtpModal;

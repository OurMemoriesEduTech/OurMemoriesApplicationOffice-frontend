import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import './AuthModals.css';
import { API_BASE_URL } from '../../../lib/apiBase.js';

const ResetPasswordModal = ({ show, onHide, email , openLoginModal }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (password.length < 6) {
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
            const response = await axios.put(
                `${API_BASE_URL}/auth/forgot-password/reset-password`,
                { email, newPassword: password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.message || response.status === 200) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    onHide();
                    openLoginModal();
                }, 1000);
                setError("")
                setSuccess("")
                setPassword("")
                setConfirmPassword("")
            }
        } catch (err) {
            setError(err.response?.data?.fail || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Create New Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="auth-subtitle">
                    Your new password must be different from previous ones.
                </p>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">
                            New Password <span className="required">*</span>
                        </Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            required
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
                            placeholder="Confirm password"
                            required
                            disabled={loading}
                            className="auth-input"
                        />
                    </Form.Group>

                    <Button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Saving...' : 'Reset Password'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ResetPasswordModal;
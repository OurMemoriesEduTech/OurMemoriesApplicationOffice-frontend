import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Modal, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiUser, FiLock, FiTrash2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
    const [editMode, setEditMode] = useState(false);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Password change
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Account deletion
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/user/profile`, { withCredentials: true });
            setProfile(response.data);
            setEditFirstName(response.data.firstName);
            setEditLastName(response.data.lastName);
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await axios.put(`${API_BASE_URL}/user/profile`, { firstName: editFirstName, lastName: editLastName }, { withCredentials: true });
            setProfile(prev => ({ ...prev, firstName: editFirstName, lastName: editLastName }));
            setEditMode(false);
            setSuccess('Profile updated successfully');
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }
        setPasswordError('');
        setChangingPassword(true);
        try {
            await axios.put(`${API_BASE_URL}/user/change-password`,
                { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
                { withCredentials: true }
            );
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess('Password changed successfully');
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/user/account`, { withCredentials: true });
            logout();
            navigate('/');
        } catch (err) {
            setError('Failed to delete account');
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4 p-md-5">
                    <h2 className="mb-4 fw-bold">My Profile</h2>
                    {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                    {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

                    {loading ? (
                        <div className="text-center py-5">Loading...</div>
                    ) : (
                        <>
                            {/* Email - always read-only */}
                            <Row className="mb-4 align-items-center">
                                <Col xs={12} md={3} className="fw-bold mb-2 mb-md-0">
                                    <FiMail className="me-2" /> Email:
                                </Col>
                                <Col xs={12} md={9}>
                                    {profile.email}
                                </Col>
                            </Row>

                            {/* First Name */}
                            <Row className="mb-4 align-items-center">
                                <Col xs={12} md={3} className="fw-bold mb-2 mb-md-0">
                                    <FiUser className="me-2" /> First Name:
                                </Col>
                                <Col xs={12} md={9}>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            value={editFirstName}
                                            onChange={(e) => setEditFirstName(e.target.value)}
                                            placeholder="First name"
                                        />
                                    ) : (
                                        <span>{profile.firstName}</span>
                                    )}
                                </Col>
                            </Row>

                            {/* Last Name */}
                            <Row className="mb-4 align-items-center">
                                <Col xs={12} md={3} className="fw-bold mb-2 mb-md-0">
                                    <FiUser className="me-2" /> Last Name:
                                </Col>
                                <Col xs={12} md={9}>
                                    {editMode ? (
                                        <Form.Control
                                            type="text"
                                            value={editLastName}
                                            onChange={(e) => setEditLastName(e.target.value)}
                                            placeholder="Last name"
                                        />
                                    ) : (
                                        <span>{profile.lastName}</span>
                                    )}
                                </Col>
                            </Row>

                            {/* Edit / Save buttons */}
                            <Row className="mb-4">
                                <Col xs={12} className="text-md-end">
                                    {editMode ? (
                                        <>
                                            <Button variant="success" size="sm" onClick={handleUpdateProfile} disabled={loading} className="me-2">
                                                Save
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => setEditMode(false)}>
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button variant="primary" size="sm" onClick={() => setEditMode(true)}>
                                            Edit Name
                                        </Button>
                                    )}
                                </Col>
                            </Row>

                            <hr className="my-4" />

                            <h5 className="mb-3 fw-bold">
                                <FiLock className="me-2" /> Security
                            </h5>
                            <Row>
                                <Col xs={12} md="auto" className="mb-2 mb-md-0">
                                    <Button variant="outline-secondary" onClick={() => setShowPasswordModal(true)} className="w-100 w-md-auto">
                                        Change Password
                                    </Button>
                                </Col>
                                <Col xs={12} md="auto">
                                    <Button variant="outline-danger" onClick={() => setShowDeleteModal(true)} className="w-100 w-md-auto">
                                        <FiTrash2 className="me-2" /> Delete Account
                                    </Button>
                                </Col>
                            </Row>
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Change Password Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handlePasswordChange} disabled={changingPassword}>
                        {changingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Account Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteAccount} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UserProfile;
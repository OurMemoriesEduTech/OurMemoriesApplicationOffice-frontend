import React, { useEffect, useState } from 'react';
import {
    Card, Row, Col, Badge, Table, Button, Alert, Spinner, Form,
    InputGroup, Pagination, Modal
} from 'react-bootstrap';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import './AdminDashboard.css';
import { FiCheck, FiX, FiRefreshCw, FiSearch, FiEye, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}`;

const AdminDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [stats, setStats] = useState({
        applications: { total: 0, pending: 0, approved: 0, rejected: 0 },
        users: { total: 0, admins: 0, applicants: 0 },
        courses: { total: 0, university: 0, tvet: 0 },
        reports: { total: 0, thisMonth: 0 },
    });
    const [announcements, setAnnouncements] = useState([]);
    const [loadingApps, setLoadingApps] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const itemsPerPage = 10;

    // New announcement modal state
    const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
    const [newAnnouncementForm, setNewAnnouncementForm] = useState({
        title: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
        type: 'info',
        priority: 'normal',
    });
    const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

    const axiosConfig = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
    };

    // Fetch functions
    const fetchApplications = async () => {
        setLoadingApps(true);
        try {
            const response = await axios.get(
                `${API_BASE}/admin/getAllApplications`,
                axiosConfig
            );
            if (response.data.success) {
                setApplications(response.data.applications || []);
                setFilteredApps(response.data.applications || []);
            }
        } catch (err) {
            console.error('Failed to load applications:', err);
            setError('Failed to load applications');
        } finally {
            setLoadingApps(false);
        }
    };

        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                console.log('Fetching stats from:', `${API_BASE}/admin/stats`);

                const response = await axios.get(`${API_BASE}/admin/stats`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Stats response:', response.data);

                if (response.data) {
                    setStats({
                        applications: {
                            total: response.data.totalApplications || 0,
                            pending: response.data.pending || 0,
                            approved: response.data.approved || 0,
                            rejected: response.data.rejected || 0,
                        },
                        users: {
                            total: response.data.totalUsers || 0,
                            admins: response.data.admins || 0,
                            applicants: response.data.applicants || 0,
                        },
                        courses: {
                            total: response.data.totalCourses || 0,
                            university: response.data.universityCourses || 0,
                            tvet: response.data.tvetCourses || 0,
                        },
                        reports: {
                            total: response.data.totalReports || 0,
                            thisMonth: response.data.reportsThisMonth || 0,
                        },
                    });
                }
                setError('');
            } catch (err) {
                console.error('Failed to load stats:', err);
                console.error('Error response:', err.response);
                console.error('Error status:', err.response?.status);
                console.error('Error data:', err.response?.data);

                // Set a more specific error message
                let errorMessage = 'Failed to load stats';
                if (err.response?.status === 401) {
                    errorMessage = 'Please log in again to view stats';
                } else if (err.response?.status === 403) {
                    errorMessage = 'You do not have permission to view stats';
                } else if (err.response?.data?.fail) {
                    errorMessage = err.response.data.fail;
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                setError(errorMessage);
            } finally {
                setLoadingStats(false);
            }
        };

    const fetchAnnouncements = async () => {
        setLoadingAnnouncements(true);
        try {
            const response = await axios.get(`${API_BASE}/admin/announcements`, axiosConfig);
            if (response.data.success) {
                setAnnouncements(response.data.announcements || []);
            }
        } catch (err) {
            console.error('Failed to load announcements:', err);
        } finally {
            setLoadingAnnouncements(false);
        }
    };

    useEffect(() => {
        fetchApplications();
        fetchStats();
        fetchAnnouncements();
    }, []);

    // Search filter
    useEffect(() => {
        const filtered = applications.filter(app =>
            (app.learner || app.applicant?.fullNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.type || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredApps(filtered);
        setCurrentPage(1);
    }, [searchTerm, applications]);

    // Pagination
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const currentApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Application actions
    const handleStatusChange = async (appId, newStatus) => {
        setUpdatingStatus(true);
        try {
            await axios.put(
                `${API_BASE}/admin/application/${appId}/status`,
                { status: newStatus },
                axiosConfig
            );
            fetchApplications();  // refresh applications list
            fetchStats();         // refresh stats to update charts
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Failed to update application status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleViewDetails = (app) => {
        setSelectedApp(app);
        setShowDetailsModal(true);
    };

    // Announcement actions
    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Delete this announcement permanently?')) {
            try {
                await axios.delete(`${API_BASE}/admin/announcements/${id}`, axiosConfig);
                fetchAnnouncements();
            } catch (err) {
                setError('Failed to delete announcement');
            }
        }
    };

    // New announcement handlers
    const openNewAnnouncementModal = () => {
        setNewAnnouncementForm({
            title: '',
            message: '',
            date: new Date().toISOString().split('T')[0],
            type: 'info',
            priority: 'normal',
        });
        setShowNewAnnouncementModal(true);
    };

    const handleNewAnnouncementChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAnnouncementForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const submitNewAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnnouncementForm.title.trim() || !newAnnouncementForm.message.trim()) {
            setError('Title and message are required');
            return;
        }
        setSubmittingAnnouncement(true);
        try {
            await axios.post(`${API_BASE}/admin/announcements`, newAnnouncementForm, axiosConfig);
            setShowNewAnnouncementModal(false);
            fetchAnnouncements(); // refresh the list
        } catch (err) {
            console.error('Failed to create announcement:', err);
            setError('Failed to create announcement');
        } finally {
            setSubmittingAnnouncement(false);
        }
    };

    const calculateHours = (dateString) => {
        const subDate = new Date(dateString);
        const now = new Date();
        const diffInMs = now - subDate;

        const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h ago`;
        if (hours > 0) return `${hours}h ${minutes}m ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    // Chart data
    const appStatusData = [
        { name: 'Approved', value: stats.applications.approved, color: '#28a745' },
        { name: 'Pending', value: stats.applications.pending, color: '#ffc107' },
        { name: 'Rejected', value: stats.applications.rejected, color: '#dc3545' },
    ];

    const userTypeData = [
        { name: 'Admins', value: stats.users.admins, color: '#17a2b8' },
        { name: 'Applicants', value: stats.users.applicants, color: '#007bff' },
    ];

    return (
        <AdminLayout>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Admin Dashboard</h1>
                    <p className="text-muted mb-0">Overview of applications, users, courses and reports.</p>
                </div>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => { fetchApplications(); fetchStats(); fetchAnnouncements(); }}
                    disabled={loadingApps || loadingStats || loadingAnnouncements}
                >
                    <FiRefreshCw className="me-1" /> Refresh
                </Button>
            </div>

            {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                {[
                    {
                        title: 'Total Applications',
                        emoji: '📄',
                        value: stats.applications.total,
                        detail: `${stats.applications.approved} approved, ${stats.applications.pending} pending, ${stats.applications.rejected} rejected`,
                        color: 'primary',
                    },
                    {
                        title: 'Active Users',
                        emoji: '👥',
                        value: stats.users.total,
                        detail: `${stats.users.admins} admins, ${stats.users.applicants} students`,
                        color: 'success',
                    },
                    {
                        title: 'Available Courses',
                        emoji: '📚',
                        value: stats.courses.total,
                        detail: `${stats.courses.university} university, ${stats.courses.tvet} TVET`,
                        color: 'info',
                    },
                    {
                        title: 'Reports Generated',
                        emoji: '📊',
                        value: stats.reports.total,
                        detail: `${stats.reports.thisMonth} this month`,
                        color: 'warning',
                    },
                ].map((s, i) => (
                    <Col key={i} xs={12} sm={6} lg={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="fs-2">{s.emoji}</span>
                                    <Badge bg={s.color} className="px-3 py-2">{s.title}</Badge>
                                </div>
                                {loadingStats ? (
                                    <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
                                ) : (
                                    <>
                                        <div className={`display-6 fw-bold text-${s.color}`}>{s.value}</div>
                                        <small className="text-muted">{s.detail}</small>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts Row */}
            <Row className="g-4 mb-4">
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header>Application Status</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={appStatusData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8">
                                        {appStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="h-100">
                        <Card.Header>User Distribution</Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={userTypeData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label
                                    >
                                        {userTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Announcements Card */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0">Recent Announcements</h5>
                    <div>
                        <Button
                            as={Link}
                            to="/admin/announcements"
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                        >
                            <FiEye className="me-1" /> Manage All
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={openNewAnnouncementModal}
                        >
                            <FiPlus className="me-1" /> New Announcement
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body>
                    {loadingAnnouncements ? (
                        <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
                    ) : announcements.length === 0 ? (
                        <Alert variant="info">No announcements yet. Click "New Announcement" to create one.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>Priority</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {announcements.slice(0, 5).map(ann => (
                                    <tr key={ann.id}>
                                        <td className="fw-semibold">{ann.title}</td>
                                        <td style={{ maxWidth: '300px' }} className="text-truncate">{ann.message}</td>
                                        <td>
                                            <Badge bg={ann.priority === 'high' ? 'danger' : ann.priority === 'medium' ? 'warning' : 'secondary'}>
                                                {ann.priority || 'normal'}
                                            </Badge>
                                        </td>
                                        <td>{new Date(ann.date).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                as={Link}
                                                to={`/admin/announcements/edit/${ann.id}`}
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                            >
                                                <FiEdit2 /> Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                            >
                                                <FiTrash2 /> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            {announcements.length > 5 && (
                                <div className="text-center mt-3">
                                    <Button as={Link} to="/admin/announcements" variant="link">
                                        View all {announcements.length} announcements →
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Applications Section */}
            <Card className="shadow-sm">
                <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
                    <h5 className="mb-0">All Applications</h5>
                    <InputGroup className="w-auto" style={{ maxWidth: '300px' }}>
                        <InputGroup.Text><FiSearch /></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by name or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Card.Header>
                <Card.Body>
                    {loadingApps ? (
                        <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
                    ) : filteredApps.length === 0 ? (
                        <Alert variant="info">No applications found.</Alert>
                    ) : (
                        <>
                            <Table hover responsive className="mb-0">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Applicant</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentApps.map((app, idx) => (
                                    <tr key={app.id}>
                                        <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td>{app.learner || app.applicant?.fullNames || 'N/A'}</td>
                                        <td>{app.type || 'N/A'}</td>
                                        <td>
                                            <Badge
                                                bg={
                                                    app.status === 'Approved' ? 'success' :
                                                        app.status === 'Rejected' ? 'danger' : 'warning'
                                                }
                                                className="px-3 py-2"
                                            >
                                                {app.status === 'Approved' && <FiCheck className="me-1" />}
                                                {app.status === 'Rejected' && <FiX className="me-1" />}
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td>{calculateHours(app.dateSubmitted)}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleViewDetails(app)}
                                            >
                                                <FiEye /> View
                                            </Button>
                                            {app.status === 'Pending' && (
                                                <>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-2"
                                                        onClick={() => handleStatusChange(app.id, 'Approved')}
                                                        disabled={updatingStatus}
                                                    >
                                                        <FiCheck /> Approve
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(app.id, 'Rejected')}
                                                        disabled={updatingStatus}
                                                    >
                                                        <FiX /> Reject
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) pageNum = i + 1;
                                            else if (currentPage <= 3) pageNum = i + 1;
                                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                            else pageNum = currentPage - 2 + i;
                                            return (
                                                <Pagination.Item
                                                    key={pageNum}
                                                    active={pageNum === currentPage}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </Pagination.Item>
                                            );
                                        })}
                                        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
                                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Application Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Application Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedApp && (
                        <>
                            <p><strong>Applicant:</strong> {selectedApp.learner || selectedApp.applicant?.fullNames}</p>
                            <p><strong>Type:</strong> {selectedApp.type}</p>
                            <p><strong>Status:</strong> <Badge bg={selectedApp.status === 'Approved' ? 'success' : selectedApp.status === 'Rejected' ? 'danger' : 'warning'}>{selectedApp.status}</Badge></p>
                            <p><strong>Submitted:</strong> {new Date(selectedApp.dateSubmitted).toLocaleString()}</p>
                            <hr />
                            <h6>Institution Preferences</h6>
                            {selectedApp.institutions && selectedApp.institutions.map((inst, idx) => (
                                <div key={idx} className="mb-3 p-2 border rounded">
                                    <p><strong>Institution:</strong> {inst.institutionName}</p>
                                    <p><strong>First Choice:</strong> {inst.firstCourse || '—'}</p>
                                    <p><strong>Second Choice:</strong> {inst.secondCourse || '—'}</p>
                                    <p><strong>Third Choice:</strong> {inst.thirdCourse || '—'}</p>
                                </div>
                            ))}
                            <hr />
                            <h6>Supporting Documents</h6>
                            {selectedApp.documents && selectedApp.documents.length > 0 ? (
                                <ul>
                                    {selectedApp.documents.map(doc => (
                                        <li key={doc.id}>
                                            <a href={`/api/user/document/${doc.id}/view`} target="_blank" rel="noopener noreferrer">
                                                {doc.fileName || doc.documentType}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No documents uploaded.</p>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* New Announcement Modal */}
            <Modal show={showNewAnnouncementModal} onHide={() => setShowNewAnnouncementModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>Create New Announcement</Modal.Title>
                </Modal.Header>
                <Form onSubmit={submitNewAnnouncement}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Title *</Form.Label>
                            <Form.Control
                                name="title"
                                type="text"
                                required
                                value={newAnnouncementForm.title}
                                onChange={handleNewAnnouncementChange}
                                placeholder="e.g. NSFAS 2026 Applications Now Open!"
                            />
                            <Form.Text className="text-muted">Clear, attention-grabbing headline</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Message *</Form.Label>
                            <Form.Control
                                name="message"
                                as="textarea"
                                rows={6}
                                required
                                value={newAnnouncementForm.message}
                                onChange={handleNewAnnouncementChange}
                                placeholder="Full announcement message..."
                            />
                            <Form.Text className="text-muted">Keep messages concise and actionable.</Form.Text>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Date</Form.Label>
                                    <Form.Control
                                        name="date"
                                        type="date"
                                        value={newAnnouncementForm.date}
                                        onChange={handleNewAnnouncementChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Priority</Form.Label>
                                    <Form.Select
                                        name="priority"
                                        value={newAnnouncementForm.priority}
                                        onChange={handleNewAnnouncementChange}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Alert Type</Form.Label>
                            <Form.Select
                                name="type"
                                value={newAnnouncementForm.type}
                                onChange={handleNewAnnouncementChange}
                            >
                                <option value="success">Success (Green)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="danger">Danger (Red)</option>
                                <option value="info">Info (Cyan)</option>
                                <option value="primary">Primary (Blue)</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={() => setShowNewAnnouncementModal(false)} disabled={submittingAnnouncement}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={submittingAnnouncement}>
                            {submittingAnnouncement ? <><Spinner animation="border" size="sm" /> Creating...</> : 'Create Announcement'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminDashboard;
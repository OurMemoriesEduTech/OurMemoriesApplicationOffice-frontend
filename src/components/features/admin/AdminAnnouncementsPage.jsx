// src/pages/admin/AdminAnnouncementsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Container, Card, Button, Form, Modal, Alert, Badge, Row, Col, Spinner, InputGroup, FormControl
} from 'react-bootstrap';
import { FiSearch, FiInfo, FiStar, FiAlertTriangle, FiCheckCircle, FiXCircle, FiDownload } from 'react-icons/fi';
import AdminLayout from '../admin/AdminLayout.jsx';
import './AdminAnnouncementsPage.css';
import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/announcements`;

const axiosConfig = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
};

const AdminAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        message: '',
        date: new Date().toISOString().split('T')[0],
        type: 'info',
        important: false
    });

    // Fetch all announcements
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_BASE, axiosConfig);
            if (res.data.success) {
                setAnnouncements(res.data.announcements || []);
            } else {
                setError('Failed to load announcements');
            }
        } catch (err) {
            setError('Network error. Please check if backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(a => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || (a.title && a.title.toLowerCase().includes(q)) || (a.message && a.message.toLowerCase().includes(q));
        const matchesType = filterType === 'all' || a.type === filterType;
        return matchesSearch && matchesType;
    });

    const totalCount = announcements.length;
    const importantCount = announcements.filter(a => a.important).length;

    const typeIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle />;
            case 'warning': return <FiAlertTriangle />;
            case 'danger': return <FiXCircle />;
            case 'info': return <FiInfo />;
            case 'primary': return <FiStar />;
            default: return <FiInfo />;
        }
    };

    const typeColor = (type) => {
        switch (type) {
            case 'success': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'danger': return '#ef4444';
            case 'info': return '#06b6d4';
            case 'primary': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    const exportAnnouncements = () => {
        if (!announcements.length) return;
        const headers = ['id','title','message','date','type','important'];
        const rows = announcements.map(a => [a.id, `"${(a.title||'').replace(/"/g,'""')}"`, `"${(a.message||'').replace(/"/g,'""') }"`, a.date, a.type, a.important]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `announcements_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingId(null);
        setForm({
            title: '',
            message: '',
            date: new Date().toISOString().split('T')[0],
            type: 'info',
            important: false
        });
        setAlert(null);
    };

    const handleEdit = (ann) => {
        setEditingId(ann.id);
        setForm({
            title: ann.title || '',
            message: ann.message || '',
            date: ann.date || new Date().toISOString().split('T')[0],
            type: ann.type || 'info',
            important: ann.important || false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let res;
            if (editingId) {
                res = await axios.put(`${API_BASE}/${editingId}`, form, axiosConfig);
            } else {
                res = await axios.post(API_BASE, form, axiosConfig);
            }

            if (res.data.success) {
                setAlert({ type: 'success', msg: editingId ? 'Announcement updated!' : 'Announcement created!' });
                fetchAnnouncements();
                setTimeout(handleClose, 1200);
            }
        } catch (err) {
            setAlert({
                type: 'danger',
                msg: err.response?.data?.message || 'Failed to save announcement'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement permanently?')) return;

        try {
            const res = await axios.delete(`${API_BASE}/${id}`, axiosConfig);
            if (res.data.success) {
                setAlert({ type: 'success', msg: 'Announcement deleted!' });
                fetchAnnouncements();
            }
        } catch (err) {
            setAlert({ type: 'danger', msg: 'Failed to delete' });
        }
    };

    if (loading) {
        return (
            <AdminLayout>
            <div className="d-flex flex-row min-vh-100 bg-light">
                <Container className="d-flex justify-content-center align-items-center flex-grow-1">
                    <Spinner animation="border" variant="primary" />
                    <span className="ms-3 fs-4">Loading announcements...</span>
                </Container>
            </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
                <Container fluid className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-4 admin-announcements-header">
                        
                                <div>
                                    <h1 className="h3 fw-bold text-dark mb-1">Manage Announcements</h1>
                                    <p className="text-muted mb-0">Create and manage system-wide announcements</p>
                                </div>

                                <div className="d-flex align-items-center gap-3">
                                    <InputGroup className="announcement-search">
                                        <InputGroup.Text style={{ backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }}>
                                            <FiSearch />
                                        </InputGroup.Text>
                                        <FormControl
                                            placeholder="Search announcements..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            aria-label="Search announcements"
                                        />
                                    </InputGroup>

                                    <Form.Select value={filterType} onChange={e => setFilterType(e.target.value)} className="announcement-filter">
                                <option value="all">All types</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="danger">Danger</option>
                                <option value="info">Info</option>
                                <option value="primary">Primary</option>
                            </Form.Select>
                                    <Button variant="outline-secondary" onClick={exportAnnouncements} title="Export announcements">
                                        <FiDownload className="me-1" /> Export
                                    </Button>

                                    <Button size="lg" variant="primary" onClick={() => { setEditingId(null); setShowModal(true); }}>
                                        New Announcement
                                    </Button>
                                </div>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {alert && <Alert variant={alert.type} dismissible onClose={() => setAlert(null)}>{alert.msg}</Alert>}

                    {filteredAnnouncements.length === 0 ? (
                        <Alert variant="info" className="text-center py-5">
                            <h4>No announcements yet</h4>
                            <p>Click "New Announcement" to create your first one.</p>
                        </Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {filteredAnnouncements.map((ann) => (
                                <Col key={ann.id}>
                                    <Card className={`h-100 shadow-sm announcement-card`} style={{ borderLeft: `6px solid ${typeColor(ann.type)}`, position: 'relative' }}>
                                        {ann.important && (
                                            <Badge bg="danger" className="position-absolute top-0 end-0 m-3 z-3">Important</Badge>
                                        )}

                                        <Card.Body className="d-flex flex-column">
                                            <div className="d-flex align-items-start gap-3 mb-2">
                                                <div className="type-icon" style={{ color: typeColor(ann.type), fontSize: '20px' }}>{typeIcon(ann.type)}</div>
                                                <Card.Title className="fw-bold mb-0" style={{ fontSize: '1.05rem' }}>{ann.title}</Card.Title>
                                            </div>

                                            <Card.Text className="text-muted flex-grow-1" style={{ minHeight: '72px' }}>{ann.message}</Card.Text>

                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <small className="text-muted">
                                                    {new Date(ann.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </small>

                                                <div className="d-flex gap-2">
                                                    <Button size="sm" variant="outline-primary" onClick={() => handleEdit(ann)}>Edit</Button>
                                                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(ann.id)}>Delete</Button>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </Container>

            {/* Create / Edit Modal */}
            <Modal show={showModal} onHide={handleClose} size="lg" centered>
                    <Modal.Header closeButton className="bg-primary text-white">
                        <Modal.Title>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</Modal.Title>
                    </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {alert && <Alert variant={alert.type}>{alert.msg}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Title *</Form.Label>
                            <Form.Control
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. NSFAS 2026 Applications Now Open!"
                                className="form-control-pro"
                            />
                            <Form.Text className="text-muted">Clear, attention-grabbing headline (max 100 chars)</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Message *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                required
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="Full announcement message..."
                                className="form-control-pro"
                            />
                            <Form.Text className="text-muted">Keep messages concise and actionable. Use links if needed.</Form.Text>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={form.date}
                                                onChange={e => setForm({ ...form, date: e.target.value })}
                                                className="form-control-pro"
                                            />
                                        </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Alert Type</Form.Label>
                                    <Form.Select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                        className="form-select-pro"
                                    >
                                        <option value="success">Success (Green)</option>
                                        <option value="warning">Warning (Yellow)</option>
                                        <option value="danger">Danger (Red)</option>
                                        <option value="info">Info (Cyan)</option>
                                        <option value="primary">Primary (Blue)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Check
                            type="switch"
                            id="important"
                            label="Mark as Important (shows red badge)"
                            checked={form.important}
                            onChange={e => setForm({ ...form, important: e.target.checked })}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={saving} className="btn-primary-pro">
                            {saving ? (<><Spinner animation="border" size="sm" /> Saving...</>) : (editingId ? 'Update Announcement' : 'Create Announcement')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminAnnouncementsPage;
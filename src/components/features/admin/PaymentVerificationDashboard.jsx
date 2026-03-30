// src/pages/admin/PaymentVerificationDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FaCheck, FaTimes, FaDownload, FaEye, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import paymentService from '../../services/paymentService';
import { formatCurrency, formatDate, getStatusDisplay } from '../../utils/paymentUtils';
import './PaymentVerificationDashboard.css';

const PaymentVerificationDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [stats, setStats] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [paymentsData, statsData] = await Promise.all([
                paymentService.getPendingVerifications(),
                paymentService.getEFTStatistics()
            ]);
            setPayments(paymentsData);
            setStats(statsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (paymentId, status) => {
        setActionLoading(true);
        try {
            await paymentService.verifyPayment(paymentId, status, verificationNotes);
            setShowModal(false);
            setVerificationNotes('');
            loadData();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadProof = async (paymentId) => {
        try {
            const blob = await paymentService.downloadProof(paymentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payment_proof_${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert('Failed to download proof: ' + err.message);
        }
    };

    const openVerificationModal = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const variants = {
            'PENDING': 'warning',
            'AWAITING_VERIFICATION': 'info',
            'VERIFIED': 'success',
            'REJECTED': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'}>{getStatusDisplay(status)}</Badge>;
    };

    if (loading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading payment verifications...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4">💰 Payment Verification Dashboard</h2>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            {/* Statistics Cards */}
            {stats && (
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Pending</h6>
                                        <h3 className="mb-0">{stats.pending}</h3>
                                    </div>
                                    <FaClock className="text-warning" size={32} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Awaiting Verification</h6>
                                        <h3 className="mb-0">{stats.awaitingVerification}</h3>
                                    </div>
                                    <FaEye className="text-info" size={32} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Verified (30 days)</h6>
                                        <h3 className="mb-0">{formatCurrency(stats.totalVerifiedAmount30Days)}</h3>
                                    </div>
                                    <FaMoneyBillWave className="text-success" size={32} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-muted mb-1">Avg Verification</h6>
                                        <h3 className="mb-0">{Math.round(stats.averageVerificationHours)} hrs</h3>
                                    </div>
                                    <FaClock className="text-primary" size={32} />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Payments Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">Pending Verifications</h5>
                    {payments.length === 0 ? (
                        <Alert variant="info">No pending verifications at this time.</Alert>
                    ) : (
                        <Table responsive hover>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Reference</th>
                                <th>Status</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td>#{payment.id}</td>
                                    <td>{payment.user?.email}</td>
                                    <td className="fw-bold">{formatCurrency(payment.amount)}</td>
                                    <td>{payment.paymentReference || '—'}</td>
                                    <td>{getStatusBadge(payment.status)}</td>
                                    <td>{formatDate(payment.proofUploadedAt)}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleDownloadProof(payment.id)}
                                            title="Download Proof"
                                        >
                                            <FaDownload />
                                        </Button>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => openVerificationModal(payment)}
                                            title="Verify"
                                        >
                                            <FaCheck />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Verification Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Verify Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <>
                            <h6>Payment Details</h6>
                            <div className="payment-details mb-3">
                                <p><strong>Payment ID:</strong> #{selectedPayment.id}</p>
                                <p><strong>User:</strong> {selectedPayment.user?.email}</p>
                                <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                <p><strong>Reference:</strong> {selectedPayment.paymentReference || '—'}</p>
                                <p><strong>Uploaded:</strong> {formatDate(selectedPayment.proofUploadedAt)}</p>
                            </div>

                            <h6>Proof of Payment</h6>
                            <div className="mb-3">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleDownloadProof(selectedPayment.id)}
                                >
                                    <FaDownload className="me-2" />
                                    View Proof of Payment
                                </Button>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Verification Notes</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder="Enter any notes about this verification (required for rejection)"
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        onClick={() => handleVerify(selectedPayment?.id, 'REJECTED')}
                        disabled={actionLoading || !verificationNotes}
                    >
                        {actionLoading ? <Spinner animation="border" size="sm" /> : <><FaTimes className="me-2" />Reject Payment</>}
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => handleVerify(selectedPayment?.id, 'VERIFIED')}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <Spinner animation="border" size="sm" /> : <><FaCheck className="me-2" />Verify Payment</>}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PaymentVerificationDashboard;
// src/components/features/payment/PaymentHistoryList.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaEye, FaDownload } from 'react-icons/fa';
import { usePayment } from '../../../hooks/usePayment.jsx';
import { formatCurrency, formatDate, getStatusBadgeVariant, getStatusDisplay } from '../../../utils/paymentUtils';
import paymentService from './paymentService';

const PaymentHistoryList = ({ onClose }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        loadPaymentHistory();
    }, []);

    const loadPaymentHistory = async () => {
        try {
            const data = await paymentService.getUserEFTPayments();
            setPayments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetails(true);
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

    const getStatusBadge = (status) => {
        return (
            <Badge bg={getStatusBadgeVariant(status)}>
                {getStatusDisplay(status)}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Modal show={true} onHide={onClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Payment History</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading payment history...</p>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <>
            <Modal show={true} onHide={onClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Payment History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {payments.length === 0 ? (
                        <Alert variant="info">
                            No payment history found. Your first payment will appear here.
                        </Alert>
                    ) : (
                        <Table responsive hover>
                            <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>#{payment.id}</td>
                                    <td>{formatCurrency(payment.amount)}</td>
                                    <td>{payment.paymentMethod}</td>
                                    <td>{getStatusBadge(payment.status)}</td>
                                    <td>{formatDate(payment.createdAt)}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleViewDetails(payment)}
                                            className="me-2"
                                        >
                                            <FaEye />
                                        </Button>
                                        {payment.proofOfPaymentPath && (
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => handleDownloadProof(payment.id)}
                                            >
                                                <FaDownload />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Details Modal */}
            <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Payment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <p><strong>Payment ID:</strong> #{selectedPayment.id}</p>
                            <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                            <p><strong>Method:</strong> {selectedPayment.paymentMethod}</p>
                            <p><strong>Status:</strong> {getStatusDisplay(selectedPayment.status)}</p>
                            <p><strong>Reference:</strong> {selectedPayment.paymentReference || '—'}</p>
                            <p><strong>Created:</strong> {formatDate(selectedPayment.createdAt)}</p>
                            {selectedPayment.paymentDate && (
                                <p><strong>Payment Date:</strong> {formatDate(selectedPayment.paymentDate)}</p>
                            )}
                            {selectedPayment.verificationDate && (
                                <p><strong>Verified:</strong> {formatDate(selectedPayment.verificationDate)}</p>
                            )}
                            {selectedPayment.verificationNotes && (
                                <p><strong>Notes:</strong> {selectedPayment.verificationNotes}</p>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PaymentHistoryList;
// src/components/features/payment/EFTPaymentComponent.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Form, Spinner, Row, Col, Table } from 'react-bootstrap';
import { FaDownload, FaUpload, FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from 'react-icons/fa';
import { usePayment } from '../../../hooks/usePayment';
import { formatCurrency, formatDate, getStatusBadgeVariant, getStatusDisplay } from '../../../utils/paymentUtils';
import ProofUploadComponent from './ProofUploadComponent';
import PaymentHistoryList from './PaymentHistoryList';
import './EFTPaymentComponent.css';

const EFTPaymentComponent = ({ applicationId, amount, numberOfApplications, onPaymentComplete }) => {
    const [step, setStep] = useState(1); // 1: Instructions, 2: Reference, 3: Upload
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentId, setPaymentId] = useState(null);
    const [instructions, setInstructions] = useState(null);
    const [feeStructure, setFeeStructure] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    const { loading, error, success, clearMessages, initiateEFTPayment } = usePayment();

    useEffect(() => {
        loadInstructions();
        loadFeeStructure();
    }, []);

    const loadInstructions = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/eft-instructions`);
            const data = await response.json();
            setInstructions(data);
        } catch (err) {
            console.error('Failed to load instructions:', err);
        }
    };

    const loadFeeStructure = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/fee-structure`);
            const data = await response.json();
            setFeeStructure(data);
        } catch (err) {
            console.error('Failed to load fee structure:', err);
        }
    };

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        if (!paymentReference.trim()) {
            alert('Please enter a payment reference');
            return;
        }

        try {
            const result = await initiateEFTPayment(applicationId, paymentReference);
            setPaymentId(result.paymentId);
            setStep(3);
        } catch (err) {
            console.error('Failed to initiate payment:', err);
        }
    };

    const handleUploadComplete = (result) => {
        onPaymentComplete(true, result);
    };

    const handleUploadError = (error) => {
        console.error('Upload error:', error);
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
    };

    return (
        <div className="eft-payment-container">
            <Row>
                <Col lg={8}>
                    {/* Fee Summary Card */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <h5 className="mb-3">💰 Fee Summary</h5>
                            <Table borderless size="sm">
                                <tbody>
                                <tr>
                                    <td>Number of Applications:</td>
                                    <td className="text-end fw-bold">{numberOfApplications}</td>
                                </tr>
                                <tr>
                                    <td>Application Fee:</td>
                                    <td className="text-end fw-bold text-primary">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                                {numberOfApplications >= 5 && (
                                    <tr className="text-success">
                                        <td>Free NSFAS Application:</td>
                                        <td className="text-end">✓ Included</td>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Payment Instructions Card */}
                    {step === 1 && instructions && (
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <h5 className="mb-3">🏦 EFT Payment Instructions</h5>

                                <div className="bank-details mb-4">
                                    <h6>Bank Details</h6>
                                    <Table borderless size="sm">
                                        <tbody>
                                        <tr><td>Bank:</td><td className="fw-bold">{instructions.bankName}</td></tr>
                                        <tr><td>Account Name:</td><td className="fw-bold">{instructions.accountName}</td></tr>
                                        <tr><td>Account Number:</td><td className="fw-bold">{instructions.accountNumber}</td></tr>
                                        <tr><td>Branch Code:</td><td>{instructions.branchCode}</td></tr>
                                        <tr><td>Reference:</td><td className="text-primary fw-bold">{instructions.reference}</td></tr>
                                        </tbody>
                                    </Table>
                                </div>

                                <div className="steps mb-4">
                                    <h6>How to Complete Your Payment</h6>
                                    {instructions.steps?.map((step, idx) => (
                                        <div key={idx} className="step-item">
                                            <span className="step-number">{step.step}</span>
                                            {step.instruction}
                                        </div>
                                    ))}
                                </div>

                                <Alert variant="warning" className="mb-0">
                                    <FaInfoCircle className="me-2" />
                                    <strong>Important Notes:</strong>
                                    <ul className="mb-0 mt-2">
                                        {instructions.importantNotes?.map((note, idx) => (
                                            <li key={idx}>{note}</li>
                                        ))}
                                    </ul>
                                </Alert>

                                <div className="text-center mt-4">
                                    <Button
                                        variant="primary"
                                        onClick={() => setStep(2)}
                                        className="px-5"
                                    >
                                        I Have Read Instructions
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Reference Entry Card */}
                    {step === 2 && (
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <h5 className="mb-3">📝 Enter Payment Reference</h5>

                                <Form onSubmit={handleInitiatePayment}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Payment Reference *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter the reference you will use for the EFT"
                                            value={paymentReference}
                                            onChange={(e) => setPaymentReference(e.target.value)}
                                            disabled={loading}
                                            autoFocus
                                        />
                                        <Form.Text className="text-muted">
                                            Please use your registered email address as reference
                                        </Form.Text>
                                    </Form.Group>

                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setStep(1)}
                                            disabled={loading}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={loading || !paymentReference.trim()}
                                            className="flex-grow-1"
                                        >
                                            {loading ? <Spinner animation="border" size="sm" /> : 'Proceed to Upload'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Upload Proof Card */}
                    {step === 3 && paymentId && (
                        <ProofUploadComponent
                            paymentId={paymentId}
                            applicationId={applicationId}
                            onUploadComplete={handleUploadComplete}
                            onUploadError={handleUploadError}
                        />
                    )}
                </Col>

                <Col lg={4}>
                    {/* Quick Actions Card */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <h6 className="mb-3">Quick Actions</h6>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="w-100 mb-2"
                                onClick={toggleHistory}
                            >
                                <FaClock className="me-2" />
                                View Payment History
                            </Button>
                            <Button
                                variant="outline-info"
                                size="sm"
                                className="w-100"
                                onClick={() => window.open('https://www.standardbank.co.za', '_blank')}
                            >
                                <FaDownload className="me-2" />
                                Download Banking App
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Support Card */}
                    <Card className="shadow-sm bg-light">
                        <Card.Body>
                            <h6 className="mb-3">Need Help?</h6>
                            <p className="small text-muted mb-2">
                                Having trouble with your payment? Contact our support team.
                            </p>
                            <Button
                                variant="link"
                                href="mailto:support@ourmemories.co.za"
                                className="p-0 text-decoration-none"
                            >
                                support@ourmemories.co.za
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Payment History Modal */}
            {showHistory && (
                <PaymentHistoryList onClose={toggleHistory} />
            )}
        </div>
    );
};

export default EFTPaymentComponent;
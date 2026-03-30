// src/components/features/payment/ProofUploadComponent.jsx
import React, { useState } from 'react';
import { Card, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { FaUpload, FaCheckCircle, FaFilePdf, FaImage } from 'react-icons/fa';
import { usePayment } from '../../../hooks/usePayment';
import { validateProofFile } from '../../../utils/paymentUtils';

const ProofUploadComponent = ({ paymentId, applicationId, onUploadComplete, onUploadError }) => {
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const [uploaded, setUploaded] = useState(false);
    const { loading, error, success, clearMessages, uploadProof } = usePayment();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const validation = validateProofFile(selectedFile);

        if (validation.valid) {
            setFile(selectedFile);
            setFileError('');
        } else {
            setFile(null);
            setFileError(validation.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setFileError('Please select a file to upload');
            return;
        }

        clearMessages();

        try {
            const result = await uploadProof(paymentId, file);
            setUploaded(true);
            onUploadComplete(result);
        } catch (err) {
            onUploadError(err);
        }
    };

    if (uploaded) {
        return (
            <Card className="mb-4 shadow-sm border-success">
                <Card.Body className="text-center">
                    <FaCheckCircle className="text-success mb-3" size={48} />
                    <h5 className="text-success">Upload Successful!</h5>
                    <p className="mb-0">
                        Your proof of payment has been uploaded successfully.<br />
                        Our team will verify your payment within 24-48 hours.
                    </p>
                    <Button
                        variant="outline-primary"
                        className="mt-3"
                        onClick={() => window.location.reload()}
                    >
                        Continue
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <h5 className="mb-3">📎 Upload Proof of Payment</h5>

                <Alert variant="info">
                    <strong>Payment ID:</strong> {paymentId}<br />
                    <strong>Application ID:</strong> {applicationId}<br />
                    Please upload your proof of payment for verification.
                </Alert>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Proof of Payment File *</Form.Label>
                        <div className="file-upload-wrapper">
                            <Form.Control
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={loading}
                                className="file-input"
                            />
                            <div className="file-upload-icon">
                                {file ? (
                                    file.type === 'application/pdf' ?
                                        <FaFilePdf size={24} className="text-danger" /> :
                                        <FaImage size={24} className="text-primary" />
                                ) : (
                                    <FaUpload size={24} className="text-muted" />
                                )}
                            </div>
                        </div>
                        <Form.Text className="text-muted">
                            Accepted formats: PDF, JPG, PNG (Max 5MB)
                        </Form.Text>
                        {fileError && <Form.Text className="text-danger d-block">{fileError}</Form.Text>}
                    </Form.Group>

                    {file && (
                        <Alert variant="secondary" className="py-2">
                            <strong>Selected file:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Alert>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <div className="d-flex gap-2">
                        <Button
                            type="submit"
                            variant="success"
                            disabled={loading || !file}
                            className="flex-grow-1"
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Upload Proof of Payment'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default ProofUploadComponent;
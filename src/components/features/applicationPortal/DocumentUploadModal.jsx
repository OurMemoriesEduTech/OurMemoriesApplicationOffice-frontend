// DocumentUploadModal.jsx - Complete fixed version
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { getDocumentConfig } from '../../../constants/documentType';
import './ApplicationForms.css';

const DocumentUploadModal = ({
                                 show,
                                 onHide,
                                 application,
                                 documentUploads,
                                 setDocumentUploads,
                                 onDocumentUpload,
                                 onUploadComplete,
                                 onSessionExpired  // Add this prop
                             }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(null);

    // DocumentUploadModal.jsx - The handleDocumentUpload function
    const handleDocumentUpload = async (docName) => {
        const file = documentUploads[docName];
        if (!file) return;

        setUploading(true);
        setUploadingDoc(docName);
        setUploadError(null);

        try {
            // ✅ Call parent with docName (parent now uses query param)
            await onDocumentUpload(docName);
            setDocumentUploads(prev => ({ ...prev, [docName]: null }));
            if (onUploadComplete) {
                onUploadComplete(docName);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                setUploadError('Your session has expired. Please log in again.');
                if (onSessionExpired) onSessionExpired();
            } else if (error.response?.status === 400) {
                setUploadError('Invalid document name. Please try again.');
            } else {
                setUploadError(error.message || `Failed to upload ${docName}`);
            }
        } finally {
            setUploading(false);
            setUploadingDoc(null);
        }
    };
    const needsProofOfPayment = application?.paymentStatus === 'PENDING' &&
        application?.paymentMethod === 'EFT' &&
        application?.status === 'PENDING_PAYMENT';

    const canUploadProof = application?.paymentStatus === 'PENDING' ||
        application?.paymentStatus === 'REJECTED';

    return (
        <Modal show={show} onHide={onHide} scrollable centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Upload Required Documents</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {uploadError && (
                    <Alert variant="danger" className="mb-3" dismissible onClose={() => setUploadError(null)}>
                        {uploadError}
                    </Alert>
                )}

                {application?.paymentStatus === 'REJECTED' && (
                    <Alert variant="danger" className="mb-3">
                        <strong>⚠️ Payment Rejected!</strong><br />
                        Your previous proof of payment was rejected. Please upload a correct proof of payment.
                    </Alert>
                )}

                {needsProofOfPayment && !canUploadProof && (
                    <Alert variant="warning" className="mb-3">
                        <strong>⏳ Payment Under Verification</strong><br />
                        Your proof of payment is being verified. Please wait.
                    </Alert>
                )}

                {/* Render all needed documents dynamically */}
                {application?.documentsNeeded?.map((docName) => {
                    const docConfig = getDocumentConfig(docName);
                    const isProofOfPayment = docName === 'Proof of Payment';

                    if (isProofOfPayment && !needsProofOfPayment) return null;
                    if (isProofOfPayment && !canUploadProof) return null;

                    const isUploading = uploading && uploadingDoc === docName;
                    const hasFileSelected = documentUploads[docName];

                    return (
                        <Form.Group key={docName} className="mb-4">
                            <Form.Label className={`fw-bold ${isProofOfPayment ? 'text-danger' : ''}`}>
                                {docConfig.icon} {docConfig.displayName || docName}
                                <span className="text-danger">*</span>
                            </Form.Label>

                            <div className="d-flex flex-column gap-2">
                                <Form.Control
                                    type="file"
                                    onChange={(e) => handleDocumentChange(e, docName)}
                                    accept={docConfig.allowedTypes?.join(',') || '.pdf,.jpg,.png'}
                                    className="mb-2"
                                    disabled={isUploading}
                                />

                                {isProofOfPayment && (
                                    <Alert variant="info" className="mt-2 mb-0 py-2">
                                        <small>
                                            <strong>🏦 Bank Details:</strong> Standard Bank<br />
                                            <strong>Account:</strong> OurMemories ApplicationOffice<br />
                                            <strong>Account No:</strong> 123456789<br />
                                            <strong>Reference:</strong> {application?.userEmail || 'Your Email'}
                                        </small>
                                    </Alert>
                                )}

                                {hasFileSelected && (
                                    <Button
                                        variant={isProofOfPayment ? "success" : "primary"}
                                        className="mt-2"
                                        onClick={() => handleDocumentUpload(docName)}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" />
                                                Uploading...
                                            </>
                                        ) : (
                                            `Upload ${docConfig.displayName || docName}`
                                        )}
                                    </Button>
                                )}
                            </div>
                        </Form.Group>
                    );
                })}

                {(!application?.documentsNeeded || application.documentsNeeded.length === 0) && !needsProofOfPayment && (
                    <p className="text-muted text-center">No additional documents are required.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={uploading}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );

    function handleDocumentChange(e, docName) {
        setDocumentUploads(prev => ({ ...prev, [docName]: e.target.files[0] }));
        setUploadError(null);
    }
};

export default DocumentUploadModal;
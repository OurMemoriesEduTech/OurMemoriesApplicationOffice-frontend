import React, { useState, useEffect } from 'react';
import {
    Container, Table, Button, Form, Row, Col, Alert, Spinner,
    Modal, Badge, Tabs, Tab, InputGroup, Pagination, Toast, ToastContainer, ProgressBar
} from 'react-bootstrap';
import AdminLayout from './AdminLayout';
import './AdminManageApplications.css';
import axios from 'axios';
import {
    FiSearch, FiDownload, FiCheck, FiX, FiFileText, FiUser,
    FiMapPin, FiEye, FiClock, FiDollarSign, FiRefreshCw,
    FiFilter, FiMail, FiBook, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { APPLICATION_STATUS, PAYMENT_STATUS } from '../../../constants/applicationStatus';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}`;

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [filterDocumentStatus, setFilterDocumentStatus] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Payment verification modal
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
    const [verifying, setVerifying] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofLoading, setProofLoading] = useState(false);
    const [proofImageUrl, setProofImageUrl] = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Toast notifications
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Reminder modal
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderApplication, setReminderApplication] = useState(null);
    const [reminderMessage, setReminderMessage] = useState('');
    const [sendingReminder, setSendingReminder] = useState(false);

    // ==================== HELPER FUNCTIONS ====================

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Normalize document type for consistent comparison
    const normalizeDocType = (docType) => {
        if (!docType) return '';
        return docType.trim().toLowerCase().replace(/\s+/g, ' ');
    };

    // ==================== DOCUMENT STATUS FUNCTIONS ====================

    const getRequiredDocumentsForType = (type) => {
        if (!type) return ['Applicant ID Copy'];

        const normalizedType = type.toLowerCase().trim();

        const documentMap = {
            'university': ['Applicant ID Copy', 'Grade 11/12 Results'],
            'tvet college': ['Applicant ID Copy', 'Grade 9/10/11/12 Results', 'Proof of Residence', 'Parent ID Copy'],
            'nsfas/bursary': ['Applicant ID Copy', 'Proof of Income'],
            'nsfas': ['Applicant ID Copy', 'Proof of Income'],
            'bursary': ['Applicant ID Copy', 'Proof of Income']
        };

        return documentMap[normalizedType] || ['Applicant ID Copy'];
    };

    const getDocumentStatus = (application) => {
        const requiredDocs = [];
        requiredDocs.push('Applicant ID Copy');
        if (application.type.toLowerCase() === 'university') {
            requiredDocs.push('Grade 11/12 Results');
        } else if (application.type.toLowerCase() === 'tvet college') {
            requiredDocs.push('Grade 9/10/11/12 Results');
            requiredDocs.push('Proof of Residence');
            requiredDocs.push('Parent ID Copy');
        } else if (application.type === 'NSFAS/Bursary' || application.type === 'NSFAS') {
            requiredDocs.push('Proof of Income');
        }
        if (application.payment?.paymentMethod === 'EFT') {
            requiredDocs.push('Proof of Payment');
        }

        const uploadedDocs = (application.documents || []).map(doc => doc.documentType?.toLowerCase().trim() || '');

        let missingDocs = [];
        for (const doc of requiredDocs) {
            if (doc === 'Grade 11/12 Results' || doc === 'Grade 9/10/11/12 Results') {
                const hasGrade = uploadedDocs.some(u => u.includes('grade'));
                if (!hasGrade) missingDocs.push(doc);
            } else {
                const normalizedDoc = doc.toLowerCase().trim();
                if (!uploadedDocs.includes(normalizedDoc)) missingDocs.push(doc);
            }
        }

        let uploadedCount = 0;
        for (const doc of requiredDocs) {
            if (doc === 'Grade 11/12 Results' || doc === 'Grade 9/10/11/12 Results') {
                if (uploadedDocs.some(u => u.includes('grade'))) uploadedCount++;
            } else {
                const normalizedDoc = doc.toLowerCase().trim();
                if (uploadedDocs.includes(normalizedDoc)) uploadedCount++;
            }
        }

        return {
            total: requiredDocs.length,
            uploaded: uploadedCount,
            missing: missingDocs,
            isComplete: missingDocs.length === 0
        };
    };

    const getDocumentStatusBadge = (application) => {
        const docStatus = getDocumentStatus(application);
        if (docStatus.isComplete) {
            return <Badge bg="success" className="px-2 py-1">✓ All Documents Uploaded</Badge>;
        } else if (docStatus.uploaded === 0) {
            return <Badge bg="danger" className="px-2 py-1">⚠️ No Documents Uploaded</Badge>;
        } else {
            return (
                <Badge bg="warning" className="px-2 py-1">
                    📄 {docStatus.uploaded}/{docStatus.total} Uploaded
                </Badge>
            );
        }
    };

    // ==================== DOCUMENT VIEW / DOWNLOAD ====================

    const handleViewDocument = async (docId, fileName, documentType) => {
        setProofLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE}/admin/document/${docId}/view`,
                { responseType: "blob", withCredentials: true }
            );
            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = URL.createObjectURL(blob);
            const isPdf = contentType === 'application/pdf';
            const isImage = contentType === 'image/jpeg' || contentType === 'image/jpg' || contentType === 'image/png';
            let displayFileName = fileName;
            if (!displayFileName) {
                const extension = isPdf ? '.pdf' : isImage ? '.jpg' : '.pdf';
                displayFileName = `${documentType?.replace(/\s+/g, '_') || 'document'}${extension}`;
            }
            setProofImageUrl({ url, fileName: displayFileName, contentType, isPdf, isImage });
            setShowProofModal(true);
        } catch (err) {
            setToast({ show: true, message: "Failed to open document", type: 'danger' });
        } finally {
            setProofLoading(false);
        }
    };

    const handleDownloadDocument = async (docId, fileName) => {
        setDownloading(true);
        try {
            const response = await axios.get(
                `${API_BASE}/admin/document/${docId}/download`,
                { responseType: "blob", withCredentials: true, timeout: 30000 }
            );
            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            let downloadFileName = fileName;
            if (!downloadFileName) {
                const ext = contentType === 'application/pdf' ? '.pdf' :
                    contentType === 'image/jpeg' ? '.jpg' :
                        contentType === 'image/png' ? '.png' : '.pdf';
                downloadFileName = `document_${docId}${ext}`;
            }
            link.setAttribute('download', downloadFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setToast({ show: true, message: `Downloaded: ${downloadFileName}`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: "Failed to download document", type: 'danger' });
        } finally {
            setDownloading(false);
        }
    };

    // ==================== REMINDER FUNCTIONS ====================

    const openReminderModal = (application) => {
        setReminderApplication(application);
        const docStatus = getDocumentStatus(application);
        const missingDocsList = docStatus.missing.join(', ');
        setReminderMessage(`Dear ${application.applicant || 'Applicant'},

This is a reminder that your application (#${application.id}) is missing the following required documents:
${missingDocsList}

Please upload these documents as soon as possible to avoid delays in processing your application.

If you have already uploaded these documents, please disregard this message.

Thank you,
OurMemories Application Office`);
        setShowReminderModal(true);
    };

    const sendDocumentReminder = async () => {
        if (!reminderApplication) return;
        setSendingReminder(true);
        try {
            await axios.post(
                `${API_BASE}/admin/applications/${reminderApplication.id}/send-reminder`,
                { message: reminderMessage, type: 'DOCUMENT_REMINDER' },
                axiosConfig
            );
            setToast({ show: true, message: `Reminder sent to ${reminderApplication.email}`, type: 'success' });
            setShowReminderModal(false);
        } catch (err) {
            setToast({ show: true, message: err.response?.data?.message || 'Failed to send reminder', type: 'danger' });
        } finally {
            setSendingReminder(false);
        }
    };

    const sendBulkReminders = async () => {
        const incompleteApplications = applications.filter(app => {
            const docStatus = getDocumentStatus(app);
            return !docStatus.isComplete && app.status === 'PENDING_PAYMENT';
        });
        if (incompleteApplications.length === 0) {
            setToast({ show: true, message: 'No applications with missing documents found.', type: 'info' });
            return;
        }
        if (!window.confirm(`Send reminders to ${incompleteApplications.length} applicants?`)) return;
        setLoading(true);
        let successCount = 0, failCount = 0;
        for (const app of incompleteApplications) {
            const docStatus = getDocumentStatus(app);
            const missingDocsList = docStatus.missing.join(', ');
            const message = `Dear ${app.applicant || 'Applicant'},

This is a reminder that your application (#${app.id}) is missing the following required documents:
${missingDocsList}

Please upload these documents as soon as possible.

Thank you,
OurMemories Application Office`;
            try {
                await axios.post(`${API_BASE}/admin/applications/${app.id}/send-reminder`, { message, type: 'DOCUMENT_REMINDER' }, axiosConfig);
                successCount++;
            } catch {
                failCount++;
            }
        }
        setToast({ show: true, message: `Reminders sent: ${successCount} successful, ${failCount} failed.`, type: successCount > 0 ? 'success' : 'danger' });
        setLoading(false);
    };

    // ==================== STATUS BADGE FUNCTIONS ====================

    const getApplicationStatusBadge = (status) => {
        const statusInfo = APPLICATION_STATUS[status];
        if (!statusInfo) return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
        return (
            <Badge bg={statusInfo.color} className="px-3 py-2 d-inline-flex align-items-center gap-1">
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
            </Badge>
        );
    };

    const getPaymentStatusBadge = (payment) => {
        if (!payment) return <Badge bg="secondary">No Payment</Badge>;
        const statusInfo = PAYMENT_STATUS[payment.status];
        if (!statusInfo) return <Badge bg="secondary">{payment.status || 'Unknown'}</Badge>;
        return (
            <Badge bg={statusInfo.color} className="px-2 py-1 d-inline-flex align-items-center gap-1">
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
            </Badge>
        );
    };

    // ==================== API CALLS ====================

    const axiosConfig = { headers: { 'Content-Type': 'application/json' }, withCredentials: true };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/admin/getAllApplications`, axiosConfig);
            if (response.data.success) {
                const apps = response.data.applications || [];
                const appsWithDetails = await Promise.all(
                    apps.map(async (app) => {
                        try {
                            const [paymentRes, documentsRes] = await Promise.all([
                                axios.get(`${API_BASE}/payments/admin/payment/${app.id}`, axiosConfig).catch(() => ({ data: null })),
                                axios.get(`${API_BASE}/admin/application/${app.id}/documents`, axiosConfig).catch(() => ({ data: { success: false } }))
                            ]);
                            return {
                                ...app,
                                payment: paymentRes.data,
                                documents: documentsRes.data?.success ? documentsRes.data.documents : []
                            };
                        } catch {
                            return { ...app, payment: null, documents: [] };
                        }
                    })
                );
                setApplications(appsWithDetails);
                setFilteredApplications(appsWithDetails);
            }
        } catch (err) {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    // Apply filters
    useEffect(() => {
        let filtered = [...applications];
        // Tab filter
        if (activeTab === 'pending') filtered = filtered.filter(a => a.status === 'Pending' || a.status === 'PENDING_PAYMENT');
        else if (activeTab === 'approved') filtered = filtered.filter(a => a.status === 'Approved');
        else if (activeTab === 'rejected') filtered = filtered.filter(a => a.status === 'Rejected');
        else if (activeTab === 'payment_verified') filtered = filtered.filter(a => a.status === 'PAYMENT_VERIFIED');
        else if (activeTab === 'under_review') filtered = filtered.filter(a => a.status === 'UNDER_REVIEW');
        else if (activeTab === 'awaiting_verification') filtered = filtered.filter(a => a.payment?.status === 'AWAITING_VERIFICATION');
        else if (activeTab === 'payment_pending') filtered = filtered.filter(a => a.payment?.status === 'PENDING' || a.status === 'PENDING_PAYMENT');
        else if (activeTab === 'documents_missing') filtered = filtered.filter(a => !getDocumentStatus(a).isComplete);

        // Search
        if (searchTerm) {
            filtered = filtered.filter(a =>
                (a.applicant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.id?.toString() || '').includes(searchTerm)
            );
        }
        if (filterStatus) filtered = filtered.filter(a => a.status === filterStatus);
        if (filterType) filtered = filtered.filter(a => a.type === filterType);
        if (filterPaymentStatus) filtered = filtered.filter(a => a.payment?.status === filterPaymentStatus);
        if (filterDocumentStatus === 'complete') filtered = filtered.filter(a => getDocumentStatus(a).isComplete);
        else if (filterDocumentStatus === 'incomplete') filtered = filtered.filter(a => !getDocumentStatus(a).isComplete);
        if (filterDate) filtered = filtered.filter(a => a.dateSubmitted?.split('T')[0] === filterDate);

        setFilteredApplications(filtered);
        setCurrentPage(1);
    }, [activeTab, searchTerm, filterStatus, filterType, filterDate, filterPaymentStatus, filterDocumentStatus, applications]);

    const handleReset = () => {
        setFilterStatus('');
        setFilterType('');
        setFilterDate('');
        setFilterPaymentStatus('');
        setFilterDocumentStatus('');
        setSearchTerm('');
        setActiveTab('all');
    };

    // View application details (with full data)
    const handleView = async (appId) => {
        setModalLoading(true);
        setShowModal(true);
        setModalData(null);
        try {
            const [applicantRes, guardianRes, institutionsRes, documentsRes] = await Promise.all([
                axios.get(`${API_BASE}/admin/application/${appId}/applicant`, axiosConfig),
                axios.get(`${API_BASE}/admin/application/${appId}/guardian`, axiosConfig).catch(() => ({ data: { success: false } })),
                axios.get(`${API_BASE}/admin/application/${appId}/institutions`, axiosConfig).catch(() => ({ data: { success: false } })),
                axios.get(`${API_BASE}/admin/application/${appId}/documents`, axiosConfig).catch(() => ({ data: { success: false } }))
            ]);
            let paymentInfo = null;
            try {
                const paymentRes = await axios.get(`${API_BASE}/payments/admin/payment/${appId}`, axiosConfig);
                paymentInfo = paymentRes.data;
            } catch {}
            const documents = documentsRes.data.success ? documentsRes.data.documents || [] : [];
            const applicant = applicantRes.data.success ? applicantRes.data.applicant : null;
            const guardian = guardianRes.data.success && guardianRes.data.guardian ? guardianRes.data.guardian : null;
            const institutions = institutionsRes.data.success ? institutionsRes.data.institutions || [] : [];
            const appSummary = applications.find(a => a.id === appId);
            setModalData({
                id: appId,
                status: appSummary?.status || 'Pending',
                type: appSummary?.type || 'Unknown',
                dateSubmitted: appSummary?.dateSubmitted || 'N/A',
                applicant, guardian, institutions, documents, payment: paymentInfo
            });
        } catch (err) {
            alert('Failed to load application details');
            setShowModal(false);
        } finally {
            setModalLoading(false);
        }
    };

    const isReadyForReview = (application) => {
        const paymentVerified = application.payment?.status === 'VERIFIED';
        const documentsComplete = getDocumentStatus(application).isComplete;
        return paymentVerified && documentsComplete && application.status === 'PAYMENT_VERIFIED';
    };

    const handleStatusChange = async (newStatus) => {
        if (!modalData || modalData.status === newStatus) return;
        let confirmMessage = '';
        if (newStatus === 'UNDER_REVIEW') {
            const docStatus = getDocumentStatus(modalData);
            if (!docStatus.isComplete) {
                setToast({ show: true, message: `Missing documents: ${docStatus.missing.join(', ')}`, type: 'danger' });
                return;
            }
            if (modalData.payment?.status !== 'VERIFIED') {
                setToast({ show: true, message: 'Payment not verified', type: 'danger' });
                return;
            }
            confirmMessage = 'Start review? Applicant will be notified.';
        } else if (newStatus === 'APPROVED') confirmMessage = 'Approve this application?';
        else if (newStatus === 'REJECTED') confirmMessage = 'Reject this application?';
        else confirmMessage = `Change status to ${newStatus}?`;
        if (!window.confirm(confirmMessage)) return;
        setUpdatingStatus(true);
        try {
            const response = await axios.put(`${API_BASE}/admin/application/${modalData.id}/status`, { status: newStatus }, axiosConfig);
            if (response.data.success) {
                setModalData(prev => ({ ...prev, status: newStatus }));
                setApplications(prevApps => prevApps.map(app => app.id === modalData.id ? { ...app, status: newStatus } : app));
                setToast({ show: true, message: `Status updated to ${APPLICATION_STATUS[newStatus]?.label || newStatus}`, type: 'success' });
            }
        } catch (err) {
            setToast({ show: true, message: "Failed to update status", type: 'danger' });
        } finally {
            setUpdatingStatus(false);
        }
    };

    // ==================== PAYMENT VERIFICATION ====================

    const openVerifyModal = (payment) => {
        setSelectedPayment(payment);
        setVerificationNotes('');
        setVerificationStatus('VERIFIED');
        setShowVerifyModal(true);
    };

    const handleVerifyPayment = async () => {
        if (!selectedPayment) return;
        setVerifying(true);
        try {
            await axios.post(`${API_BASE}/payments/admin/verify-eft/${selectedPayment.id}`, {
                paymentId: selectedPayment.id,
                status: verificationStatus,
                notes: verificationNotes
            }, axiosConfig);
            await fetchApplications();
            setShowVerifyModal(false);
            setSelectedPayment(null);
            setToast({ show: true, message: `Payment ${verificationStatus === 'VERIFIED' ? 'verified' : 'rejected'}`, type: 'success' });
        } catch (err) {
            setToast({ show: true, message: err.response?.data?.error || 'Verification failed', type: 'danger' });
        } finally {
            setVerifying(false);
        }
    };

    const handleViewProof = async (paymentId) => {
        setProofLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/payments/admin/view-proof/${paymentId}`, { responseType: "blob", withCredentials: true });
            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = URL.createObjectURL(blob);
            const isPdf = contentType === 'application/pdf';
            const isImage = contentType === 'image/jpeg' || contentType === 'image/jpg' || contentType === 'image/png';
            setProofImageUrl({ url, fileName: `proof_${paymentId}.pdf`, contentType, isPdf, isImage });
            setShowProofModal(true);
        } catch (err) {
            setToast({ show: true, message: "Failed to open proof", type: 'danger' });
        } finally {
            setProofLoading(false);
        }
    };

    const handleDownloadProof = async (paymentId) => {
        try {
            const response = await axios.get(`${API_BASE}/payments/admin/download-proof/${paymentId}`, { responseType: "blob", withCredentials: true });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payment_proof_${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setToast({ show: true, message: "Failed to download proof", type: 'danger' });
        }
    };

    // Export CSV
    const exportApplications = () => {
        const headers = ['ID', 'Applicant', 'Email', 'Type', 'Status', 'Payment Status', 'Documents Status', 'Submitted Date'];
        const rows = filteredApplications.map(app => {
            const docStatus = getDocumentStatus(app);
            return [
                app.id, app.applicant || 'N/A', app.email || 'N/A', app.type || 'N/A',
                app.status || 'N/A', app.payment?.status || 'N/A',
                docStatus.isComplete ? 'Complete' : `${docStatus.uploaded}/${docStatus.total}`,
                app.dateSubmitted ? formatDateTime(app.dateSubmitted) : 'N/A'
            ];
        });
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStats = () => {
        const total = applications.length;
        const pending = applications.filter(a => a.status === 'Pending' || a.status === 'PENDING_PAYMENT').length;
        const approved = applications.filter(a => a.status === 'Approved' || a.status === 'APPROVED').length;
        const rejected = applications.filter(a => a.status === 'Rejected' || a.status === 'REJECTED').length;
        const paymentVerified = applications.filter(a => a.status === 'PAYMENT_VERIFIED').length;
        const underReview = applications.filter(a => a.status === 'UNDER_REVIEW').length;
        const awaitingVerification = applications.filter(a => a.payment?.status === 'AWAITING_VERIFICATION').length;
        const paymentPending = applications.filter(a => a.payment?.status === 'PENDING' || a.status === 'PENDING_PAYMENT').length;
        const documentsMissing = applications.filter(a => !getDocumentStatus(a).isComplete).length;
        const readyForReview = applications.filter(a => isReadyForReview(a)).length;
        return { total, pending, approved, rejected, paymentVerified, underReview, awaitingVerification, paymentPending, documentsMissing, readyForReview };
    };

    const stats = getStats();
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const currentApps = filteredApplications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) {
        return (
            <AdminLayout>
                <div className="d-flex flex-row min-vh-100 bg-light">
                    <Container className="d-flex justify-content-center align-items-center flex-grow-1">
                        <Spinner animation="border" variant="primary" />
                        <span className="ms-3">Loading applications...</span>
                    </Container>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Container fluid className="mt-4">
                <ToastContainer position="top-end" className="p-3">
                    <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={5000} autohide bg={toast.type}>
                        <Toast.Header><strong className="me-auto">{toast.type === 'success' ? 'Success' : 'Error'}</strong></Toast.Header>
                        <Toast.Body>{toast.message}</Toast.Body>
                    </Toast>
                </ToastContainer>

                {/* Header & Stats */}
                <div className="professional-header mb-5 pb-4" style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <h1 className="display-5 fw-bold mb-2" style={{ color: '#1e3a8a' }}>Application Management</h1>
                            <p className="text-muted mb-0">Review, verify, and process applicant applications efficiently</p>
                        </Col>
                        <Col md={4} className="text-end">
                            <div className="d-flex gap-2 justify-content-end">
                                <Button variant="outline-warning" onClick={sendBulkReminders}><FiMail className="me-1" /> Bulk Reminders</Button>
                                <Button variant="outline-secondary" onClick={exportApplications}><FiDownload className="me-1" /> Export CSV</Button>
                                <Button variant="outline-primary" onClick={fetchApplications}><FiRefreshCw className="me-1" /> Refresh</Button>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-4 g-3">
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Total</h6><h3 className="fw-bold text-primary">{stats.total}</h3></div></Col>
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Pending</h6><h3 className="fw-bold text-warning">{stats.pending}</h3></div></Col>
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Ready for Review</h6><h3 className="fw-bold text-info">{stats.readyForReview}</h3></div></Col>
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Under Review</h6><h3 className="fw-bold text-primary">{stats.underReview}</h3></div></Col>
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Documents Missing</h6><h3 className="fw-bold text-warning">{stats.documentsMissing}</h3></div></Col>
                        <Col xs={6} md={2}><div className="stats-card p-3 rounded bg-white shadow-sm text-center"><h6 className="text-muted">Awaiting Verification</h6><h3 className="fw-bold text-warning">{stats.awaitingVerification}</h3></div></Col>
                    </Row>
                </div>

                {error && <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>{error}</Alert>}

                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                    <Tab eventKey="all" title={`All (${stats.total})`} />
                    <Tab eventKey="payment_verified" title={`Ready for Review (${stats.paymentVerified})`} />
                    <Tab eventKey="under_review" title={`Under Review (${stats.underReview})`} />
                    <Tab eventKey="documents_missing" title={`Documents Missing (${stats.documentsMissing})`} />
                    <Tab eventKey="awaiting_verification" title={`Awaiting Verification (${stats.awaitingVerification})`} />
                    <Tab eventKey="pending" title={`Pending Payment (${stats.pending})`} />
                    <Tab eventKey="approved" title={`Approved (${stats.approved})`} />
                </Tabs>

                {/* Filters */}
                <Form className="filter-form mb-5 bg-white p-4 rounded-lg shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-center mb-3"><FiFilter className="me-2" style={{ color: '#1e3a8a' }} size={20} /><h6 className="mb-0 fw-bold">Filter Applications</h6></div>
                    <Row className="g-3">
                        <Col md={3}><Form.Group><Form.Label className="small fw-bold mb-2">Search</Form.Label><InputGroup><InputGroup.Text><FiSearch /></InputGroup.Text><Form.Control type="text" placeholder="Name, email, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></InputGroup></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label className="small fw-bold mb-2">Status</Form.Label><Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="">All Status</option><option value="PENDING_PAYMENT">Pending Payment</option><option value="PAYMENT_VERIFIED">Payment Verified</option><option value="UNDER_REVIEW">Under Review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></Form.Select></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label className="small fw-bold mb-2">Application Type</Form.Label><Form.Select value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Types</option><option value="University">🎓 University</option><option value="TVET College">⚙️ TVET College</option><option value="NSFAS/Bursary">💰 NSFAS/Bursary</option></Form.Select></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label className="small fw-bold mb-2">Document Status</Form.Label><Form.Select value={filterDocumentStatus} onChange={e => setFilterDocumentStatus(e.target.value)}><option value="">All</option><option value="complete">✓ Documents Complete</option><option value="incomplete">⚠️ Documents Missing</option></Form.Select></Form.Group></Col>
                        <Col md={2}><Form.Group><Form.Label className="small fw-bold mb-2">Submission Date</Form.Label><Form.Control type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} /></Form.Group></Col>
                        <Col md={1} className="d-flex align-items-end"><Button variant="outline-secondary" className="w-100" onClick={handleReset}>Reset</Button></Col>
                    </Row>
                </Form>

                {/* Applications Table */}
                {filteredApplications.length === 0 ? (
                    <Alert variant="info" className="text-center py-5"><FiFileText size={48} className="mb-3 text-muted" /><h5>No applications found</h5></Alert>
                ) : (
                    <>
                        <div className="table-responsive-pro bg-white rounded-lg shadow-sm" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Table striped hover responsive className="mb-0 table-professional">
                                <thead className="table-header-pro" style={{ backgroundColor: '#1e3a8a' }}>
                                <tr><th style={{ padding: '15px' }}>#</th><th style={{ padding: '15px' }}>Applicant Name</th><th style={{ padding: '15px' }}>Email</th><th style={{ padding: '15px' }}>Application Type</th><th style={{ padding: '15px' }}>Status</th><th style={{ padding: '15px' }}>Payment</th><th style={{ padding: '15px' }}>Documents</th><th style={{ padding: '15px' }}>Submitted</th><th style={{ padding: '15px', textAlign: 'center' }}>Actions</th></tr>
                                </thead>
                                <tbody>
                                {currentApps.map((app, i) => {
                                    const docStatus = getDocumentStatus(app);
                                    const isReady = isReadyForReview(app);
                                    return (
                                        <tr key={app.id} className="table-row-pro" style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '12px 15px', color: '#64748b' }}>{(currentPage-1)*itemsPerPage + i + 1}</td>
                                            <td style={{ padding: '12px 15px' }}><FiUser className="me-2" size={16} style={{ color: '#3b82f6' }} /> {app.applicant || 'N/A'}</td>
                                            <td style={{ padding: '12px 15px', color: '#64748b' }}>{app.email || 'N/A'}</td>
                                            <td><Badge bg={app.type === 'University' ? 'primary' : app.type === 'TVET College' ? 'info' : 'secondary'}>{app.type}</Badge></td>
                                            <td>{getApplicationStatusBadge(app.status)}</td>
                                            <td>{getPaymentStatusBadge(app.payment)}</td>
                                            <td>
                                                {getDocumentStatusBadge(app)}
                                                {!docStatus.isComplete && docStatus.missing.length > 0 && (
                                                    <Button variant="link" size="sm" className="p-0 ms-2" onClick={() => openReminderModal(app)} title={`Missing: ${docStatus.missing.join(', ')}`}>
                                                        <FiMail size={12} />
                                                    </Button>
                                                )}
                                            </td>
                                            <td><FiClock className="me-1" size={12} /> {formatDate(app.dateSubmitted) || 'N/A'}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button size="sm" variant="outline-primary" onClick={() => handleView(app.id)}><FiEye className="me-1" /> View</Button>
                                                    {!docStatus.isComplete && <Button size="sm" variant="warning" onClick={() => openReminderModal(app)}><FiMail className="me-1" /> Remind</Button>}
                                                    {app.payment?.status === 'AWAITING_VERIFICATION' && <Button size="sm" variant="success" onClick={() => openVerifyModal(app.payment)}><FiCheck className="me-1" /> Verify</Button>}
                                                    {isReady && app.status === 'PAYMENT_VERIFIED' && <Button size="sm" variant="primary" onClick={() => handleStatusChange('UNDER_REVIEW')}><FiBook className="me-1" /> Review</Button>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </div>
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <Pagination>
                                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage===1} />
                                    <Pagination.Prev onClick={() => setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} />
                                    {[...Array(Math.min(5,totalPages))].map((_,i) => {
                                        let pageNum = totalPages<=5 ? i+1 : (currentPage<=3 ? i+1 : (currentPage>=totalPages-2 ? totalPages-4+i : currentPage-2+i));
                                        return <Pagination.Item key={pageNum} active={pageNum===currentPage} onClick={()=>setCurrentPage(pageNum)}>{pageNum}</Pagination.Item>;
                                    })}
                                    <Pagination.Next onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} />
                                    <Pagination.Last onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} />
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* ==================== APPLICATION DETAILS MODAL ==================== */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable centered className="modal-professional">
                <Modal.Header closeButton className="modal-header-pro" style={{ backgroundColor: '#1e3a8a', color: 'white', borderRadius: '12px 12px 0 0' }}>
                    <div><Modal.Title className="fw-bold">Application Details</Modal.Title><small style={{ opacity: 0.8 }}>ID: {modalData?.id}</small></div>
                </Modal.Header>
                <Modal.Body className="modal-body-pro" style={{ backgroundColor: '#f8fafc' }}>
                    {modalLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : modalData ? (
                        <>
                            {/* Status Banner */}
                            <div className="text-center mb-4 p-4 rounded-lg bg-white" style={{ borderLeft: '4px solid #3b82f6' }}>
                                <div className="d-flex justify-content-center gap-3 mb-3">
                                    {getApplicationStatusBadge(modalData.status)}
                                    {getPaymentStatusBadge(modalData.payment)}
                                </div>
                                <p><strong>Type:</strong> {modalData.type} | <strong>Submitted:</strong> {formatDateTime(modalData.dateSubmitted)}</p>
                                {modalData.payment?.status === 'AWAITING_VERIFICATION' && (
                                    <div className="mt-3">
                                        <Button size="sm" variant="success" onClick={() => openVerifyModal(modalData.payment)} className="me-2"><FiCheck /> Verify Payment</Button>
                                        <Button size="sm" variant="outline-primary" onClick={() => handleViewProof(modalData.payment.id)}><FiEye /> View Proof</Button>
                                    </div>
                                )}
                            </div>

                            {/* Applicant Info */}
                            {modalData.applicant && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                                    <h5 className="mb-3 fw-bold"><FiUser className="me-2" /> Applicant Information</h5>
                                    <Row>
                                        <Col md={6}><strong>Title:</strong> {modalData.applicant.title || '—'}</Col>
                                        <Col md={6}><strong>Initials:</strong> {modalData.applicant.initials || '—'}</Col>
                                        <Col md={6}><strong>Full Names:</strong> {modalData.applicant.fullNames}</Col>
                                        <Col md={6}><strong>Surname:</strong> {modalData.applicant.lastName}</Col>
                                        <Col md={6}><strong>Gender:</strong> {modalData.applicant.gender}</Col>
                                        <Col md={6}><strong>Date of Birth:</strong> {modalData.applicant.dateOfBirth || '—'}</Col>
                                        <Col md={6}><strong>South African:</strong> {modalData.applicant.isSouthAfrican ? 'Yes' : 'No'}</Col>
                                        <Col md={6}><strong>ID Number:</strong> {modalData.applicant.idNumber || '—'}</Col>
                                        <Col md={12}><strong>Email:</strong> {modalData.applicant.email}</Col>
                                        <Col md={12}><strong>Cell:</strong> {modalData.applicant.cellNumber}</Col>
                                    </Row>
                                </div>
                            )}

                            {/* Guardian Info */}
                            {modalData.guardian && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                                    <h5 className="mb-3 fw-bold"><FiUser className="me-2" /> Guardian / Parent Information</h5>
                                    <Row>
                                        <Col md={6}><strong>Relationship:</strong> {modalData.guardian.relationship}</Col>
                                        <Col md={6}><strong>Full Names:</strong> {modalData.guardian.fullNames || '—'}</Col>
                                        <Col md={6}><strong>Cell Number:</strong> {modalData.guardian.cellNumber || '—'}</Col>
                                        <Col md={12}><strong>Email:</strong> {modalData.guardian.email || '—'}</Col>
                                    </Row>
                                </div>
                            )}

                            {/* Institutions */}
                            {modalData.institutions?.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                                    <h5 className="mb-3 fw-bold"><FiMapPin className="me-2" /> Institutions & Course Preferences</h5>
                                    {modalData.institutions.map((inst, idx) => (
                                        <div key={idx} className="p-3 mb-3 border rounded bg-light">
                                            <h6><Badge bg={idx===0 ? "primary" : "secondary"} className="me-2">Choice {idx+1}</Badge> {inst.institutionName}</h6>
                                            <Row><Col md={4}><strong>First Choice:</strong> {inst.firstCourse || '—'}</Col><Col md={4}><strong>Second Choice:</strong> {inst.secondCourse || '—'}</Col><Col md={4}><strong>Third Choice:</strong> {inst.thirdCourse || '—'}</Col></Row>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Payment Info */}
                            {modalData.payment && (
                                <div className="bg-white p-4 rounded-lg shadow-sm mb-4" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                                    <h5 className="mb-3 fw-bold"><FiDollarSign className="me-2" /> Payment Information</h5>
                                    <Row>
                                        <Col md={3}><strong>Amount:</strong> R {modalData.payment.amount || 0}</Col>
                                        <Col md={3}><strong>Method:</strong> {modalData.payment.paymentMethod || 'EFT'}</Col>
                                        <Col md={3}><strong>Status:</strong> {getPaymentStatusBadge(modalData.payment)}</Col>
                                        <Col md={3}><strong>Reference:</strong> <code>{modalData.payment.paymentReference || '—'}</code></Col>
                                        {modalData.payment.proofUploadedAt && (
                                            <Col md={12} className="mt-2"><strong>Proof Uploaded:</strong> {formatDateTime(modalData.payment.proofUploadedAt)} <Button variant="link" size="sm" onClick={() => handleViewProof(modalData.payment.id)}>View Proof</Button></Col>
                                        )}
                                    </Row>
                                </div>
                            )}

                            {/* ========== SUPPORTING DOCUMENTS SECTION ========== */}
                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                                <h5 className="mb-3 fw-bold"><FiFileText className="me-2" /> Uploaded Documents ({modalData.documents?.length || 0})</h5>
                                {!modalData.documents?.length ? (
                                    <Alert variant="info">No documents uploaded.</Alert>
                                ) : (
                                    <div className="row g-3">
                                        {modalData.documents.map(doc => {
                                            const docType = doc.documentType || '';
                                            let icon = <FiFileText size={18} />, color = '#6c757d', badge = null;
                                            if (docType.toLowerCase().includes('grade')) { icon = <FiBook size={18} />; color = '#8b5cf6'; badge = <Badge bg="info" className="mt-1">Academic Results</Badge>; }
                                            else if (docType.toLowerCase().includes('proof of payment')) { icon = <FiDollarSign size={18} />; color = '#10b981'; badge = <Badge bg="success" className="mt-1">Payment Proof</Badge>; }
                                            else if (docType.toLowerCase().includes('id') || docType.toLowerCase().includes('passport')) { icon = <FiUser size={18} />; color = '#3b82f6'; badge = <Badge bg="primary" className="mt-1">Identification</Badge>; }
                                            else if (docType.toLowerCase().includes('residence')) { icon = <FiMapPin size={18} />; color = '#f59e0b'; badge = <Badge bg="warning" className="mt-1">Residence Proof</Badge>; }
                                            return (
                                                <div key={doc.id} className="col-md-6 col-lg-4">
                                                    <div className="border rounded p-3 bg-light h-100 d-flex flex-column">
                                                        <div className="mb-2"><span style={{ color }}>{icon}</span> <strong className="ms-2">{doc.documentType}</strong></div>
                                                        {doc.fileName && <small className="text-muted">📄 {doc.fileName}</small>}
                                                        {badge}
                                                        <div className="mt-auto d-flex gap-2 mt-3">
                                                            <Button size="sm" variant="outline-primary" className="flex-grow-1" onClick={() => handleViewDocument(doc.id, doc.fileName, doc.documentType)}><FiEye className="me-1" /> View</Button>
                                                            <Button size="sm" variant="outline-secondary" className="flex-grow-1" onClick={() => handleDownloadDocument(doc.id, doc.fileName)}><FiDownload className="me-1" /> Download</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Document Status Summary */}
                            <div className="bg-white p-4 rounded-lg shadow-sm" style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #6c757d' }}>
                                <h5 className="mb-3 fw-bold">
                                    <FiCheckCircle className="me-2" /> Document Submission Status
                                </h5>

                                <Row>
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded">
                                            <strong>Required Documents:</strong>
                                            <ul className="mt-2 list-unstyled">
                                                {(() => {
                                                    const requiredDocs = getRequiredDocumentsForType(modalData.type);  // ← Use the helper!

                                                    // Add Proof of Payment if EFT
                                                    if (modalData.payment?.paymentMethod === 'EFT') {
                                                        if (!requiredDocs.includes('Proof of Payment')) {
                                                            requiredDocs.push('Proof of Payment');
                                                        }
                                                    }

                                                    const isUploaded = (reqDoc) => {
                                                        if (!modalData.documents || modalData.documents.length === 0) return false;

                                                        const normalizedReq = reqDoc.toLowerCase().trim();

                                                        return modalData.documents.some(doc => {
                                                            if (!doc.documentType) return false;
                                                            const docType = doc.documentType.toLowerCase().trim();

                                                            // Special handling for Grade Results (very important!)
                                                            if (normalizedReq.includes('grade')) {
                                                                return docType.includes('grade');
                                                            }

                                                            // Exact match for others
                                                            return docType === normalizedReq;
                                                        });
                                                    };

                                                    return requiredDocs.map((doc, idx) => {
                                                        const uploaded = isUploaded(doc);
                                                        let displayName = doc;

                                                        if (doc.includes('Grade 11/12')) displayName = '📊 Grade 11/12 Results';
                                                        else if (doc.includes('Grade 9/10')) displayName = '📚 Grade 9/10/11/12 Results';
                                                        else if (doc === 'Proof of Payment') displayName = '💰 Proof of Payment';
                                                        else if (doc === 'Applicant ID Copy') displayName = '🪪 Applicant ID Copy';
                                                        else if (doc === 'Proof of Income') displayName = '💵 Proof of Income';
                                                        else if (doc === 'Proof of Residence') displayName = '🏠 Proof of Residence';
                                                        else if (doc === 'Parent ID Copy') displayName = '👨‍👩‍👧 Parent ID Copy';

                                                        return (
                                                            <li key={idx} className={`mb-1 ${uploaded ? 'text-success' : 'text-danger'}`}>
                                                                {uploaded ? '✅' : '❌'} {displayName}
                                                            </li>
                                                        );
                                                    });
                                                })()}
                                            </ul>
                                        </div>
                                    </Col>

                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded">
                                            <strong>Upload Summary:</strong>
                                            {(() => {
                                                const requiredDocs = getRequiredDocumentsForType(modalData.type);

                                                if (modalData.payment?.paymentMethod === 'EFT') {
                                                    if (!requiredDocs.includes('Proof of Payment')) {
                                                        requiredDocs.push('Proof of Payment');
                                                    }
                                                }

                                                const isUploaded = (reqDoc) => {
                                                    if (!modalData.documents) return false;
                                                    const normalizedReq = reqDoc.toLowerCase().trim();

                                                    return modalData.documents.some(doc => {
                                                        if (!doc.documentType) return false;
                                                        const docType = doc.documentType.toLowerCase().trim();
                                                        if (normalizedReq.includes('grade')) {
                                                            return docType.includes('grade');
                                                        }
                                                        return docType === normalizedReq;
                                                    });
                                                };

                                                const uploadedCount = requiredDocs.filter(doc => isUploaded(doc)).length;
                                                const totalRequired = requiredDocs.length;
                                                const percentage = totalRequired > 0 ? Math.round((uploadedCount / totalRequired) * 100) : 0;
                                                const missingDocs = requiredDocs.filter(doc => !isUploaded(doc));

                                                return (
                                                    <>
                                                        <div className="d-flex justify-content-between mb-2">
                                                            <span>Progress:</span>
                                                            <strong className={percentage === 100 ? "text-success" : "text-warning"}>
                                                                {uploadedCount} / {totalRequired}
                                                            </strong>
                                                        </div>
                                                        <ProgressBar
                                                            now={percentage}
                                                            variant={percentage === 100 ? "success" : "warning"}
                                                            className="mb-2"
                                                            style={{ height: '10px' }}
                                                        />
                                                        <small className="text-muted">
                                                            {percentage}% Complete
                                                        </small>

                                                        {missingDocs.length > 0 && (
                                                            <div className="mt-3">
                                                                <small className="text-danger fw-bold">
                                                                    <FiAlertCircle className="me-1" />
                                                                    Missing: {missingDocs.join(', ')}
                                                                </small>
                                                            </div>
                                                        )}

                                                        {percentage === 100 && (
                                                            <div className="mt-3 text-success">
                                                                <FiCheckCircle className="me-1" />
                                                                All required documents uploaded successfully!
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ) : (
                        <Alert variant="danger">Failed to load details</Alert>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-pro">
                    <div className="d-flex gap-2 flex-wrap">
                        {modalData?.status === 'PAYMENT_VERIFIED' && <Button variant="primary" onClick={() => handleStatusChange('UNDER_REVIEW')} disabled={updatingStatus}><FiBook className="me-2" /> Start Review</Button>}
                        {modalData?.status === 'UNDER_REVIEW' && <><Button variant="success" onClick={() => handleStatusChange('APPROVED')}><FiCheckCircle className="me-2" /> Approve</Button><Button variant="danger" onClick={() => handleStatusChange('REJECTED')}><FiX className="me-2" /> Reject</Button></>}
                        <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Payment Verification Modal */}
            <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
                <Modal.Header closeButton className={verificationStatus === 'VERIFIED' ? 'bg-success text-white' : 'bg-danger text-white'}>
                    <Modal.Title>{verificationStatus === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <>
                            <div className="payment-summary mb-4 p-3 bg-light rounded">
                                <h6>Payment Details</h6>
                                <p><strong>Payment ID:</strong> #{selectedPayment.id}</p>
                                <p><strong>User:</strong> {selectedPayment.user?.email}</p>
                                <p><strong>Amount:</strong> R {selectedPayment.amount}</p>
                                <p><strong>Reference:</strong> {selectedPayment.paymentReference || '—'}</p>
                                <p><strong>Uploaded:</strong> {formatDateTime(selectedPayment.proofUploadedAt)}</p>
                            </div>
                            <h6>Proof of Payment</h6>
                            <div className="mb-3">
                                <Button variant="outline-primary" size="sm" onClick={() => handleViewProof(selectedPayment.id)} disabled={proofLoading}><FiEye className="me-2" /> View Proof</Button>
                                <Button variant="outline-secondary" size="sm" onClick={() => handleDownloadProof(selectedPayment.id)} className="ms-2"><FiDownload className="me-2" /> Download</Button>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Notes {verificationStatus === 'REJECTED' && '(Required)'}</Form.Label>
                                <Form.Control as="textarea" rows={3} value={verificationNotes} onChange={e => setVerificationNotes(e.target.value)} placeholder={verificationStatus === 'VERIFIED' ? "Add notes..." : "Reason for rejection"} />
                                {verificationStatus === 'REJECTED' && !verificationNotes && <Form.Text className="text-danger">Rejection reason required</Form.Text>}
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVerifyModal(false)} disabled={verifying}>Cancel</Button>
                    <Button variant={verificationStatus === 'VERIFIED' ? 'success' : 'danger'} onClick={handleVerifyPayment} disabled={verifying || (verificationStatus === 'REJECTED' && !verificationNotes)}>
                        {verifying ? <Spinner animation="border" size="sm" /> : (verificationStatus === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Proof of Payment Preview Modal */}
            <Modal show={showProofModal} onHide={() => { if (proofImageUrl?.url) URL.revokeObjectURL(proofImageUrl.url); setShowProofModal(false); setProofImageUrl(null); }} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Document Preview</Modal.Title></Modal.Header>
                <Modal.Body style={{ padding: 0, minHeight: '400px', backgroundColor: '#f5f5f5' }}>
                    {proofLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}><Spinner animation="border" variant="primary" /><span className="ms-3">Loading...</span></div>
                    ) : proofImageUrl ? (
                        proofImageUrl.isPdf ? <iframe src={proofImageUrl.url} title={proofImageUrl.fileName} style={{ width: '100%', height: '70vh', border: 'none' }} />
                            : proofImageUrl.isImage ? <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}><img src={proofImageUrl.url} alt="proof" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>
                                : <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '400px' }}><FiFileText size={64} className="text-muted mb-3" /><p>Preview not available</p><Button variant="primary" onClick={() => handleDownloadProof(selectedPayment?.id)}><FiDownload className="me-2" /> Download</Button></div>
                    ) : <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}><p>No document</p></div>}
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" onClick={() => { if (proofImageUrl?.url) URL.revokeObjectURL(proofImageUrl.url); setShowProofModal(false); setProofImageUrl(null); }}>Close</Button></Modal.Footer>
            </Modal>

            {/* Document Reminder Modal */}
            <Modal show={showReminderModal} onHide={() => setShowReminderModal(false)} size="lg">
                <Modal.Header closeButton className="bg-warning text-dark"><Modal.Title><FiMail className="me-2" /> Send Document Reminder</Modal.Title></Modal.Header>
                <Modal.Body>
                    {reminderApplication && (
                        <>
                            <Alert variant="info"><strong>Application #{reminderApplication.id}</strong><br />Applicant: {reminderApplication.applicant} ({reminderApplication.email})</Alert>
                            <div className="mb-3"><strong>Missing Documents:</strong><ul>{getDocumentStatus(reminderApplication).missing.map((doc, idx) => <li key={idx} className="text-danger"><FiAlertCircle className="me-2" /> {doc}</li>)}</ul></div>
                            <Form.Group className="mb-3"><Form.Label>Reminder Message</Form.Label><Form.Control as="textarea" rows={8} value={reminderMessage} onChange={e => setReminderMessage(e.target.value)} /></Form.Group>
                            <Alert variant="warning"><FiAlertCircle className="me-2" /> This will be sent to the applicant's email.</Alert>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReminderModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={sendDocumentReminder} disabled={sendingReminder}>{sendingReminder ? <><Spinner animation="border" size="sm" className="me-2" /> Sending...</> : <><FiMail className="me-2" /> Send Reminder</>}</Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default ManageApplications;
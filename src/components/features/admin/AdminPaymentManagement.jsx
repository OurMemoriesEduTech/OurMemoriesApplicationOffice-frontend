import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Table, Badge, Modal, Form,
    Alert, Spinner, InputGroup, Pagination, Tab, Tabs
} from 'react-bootstrap';
import {
    FiCheck, FiX, FiDownload, FiEye, FiClock, FiRefreshCw,
    FiSearch, FiDollarSign, FiFileText, FiAlertCircle, FiCheckCircle, FiXCircle, FiPrinter
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { formatCurrency, getStatusDisplay } from '../../../utils/paymentUtils';
import { PAYMENT_STATUS } from '../../../constants/applicationStatus';
import './AdminPaymentManagement.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}`;

const AdminPaymentManagement = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
    const [verifying, setVerifying] = useState(false);
    const [stats, setStats] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const itemsPerPage = 10;

    // ==================== HELPER FUNCTIONS ====================

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

    const getPaymentStatusBadge = (status) => {
        const statusInfo = PAYMENT_STATUS[status];
        if (!statusInfo) {
            return <Badge bg="secondary">{status || 'Unknown'}</Badge>;
        }
        return (
            <Badge bg={statusInfo.color} className="px-3 py-2 d-inline-flex align-items-center gap-1">
                <span>{statusInfo.icon}</span>
                <span>{statusInfo.label}</span>
            </Badge>
        );
    };

    // ==================== CSV EXPORT ====================

    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const exportCSV = () => {
        const headers = [
            'Payment ID',
            'User Email',
            'User Name',
            'Amount',
            'Payment Method',
            'Reference',
            'Status',
            'Uploaded Date',
            'Verification Date',
            'Verified By',
            'Rejection Reason'
        ];

        const rows = filteredPayments.map(payment => {
            return [
                payment.id,
                payment.user?.email || '',
                `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim(),
                payment.amount,
                payment.paymentMethod,
                payment.paymentReference || '',
                getPaymentStatusBadge(payment.status).props.children[1],
                formatDateTime(payment.proofUploadedAt),
                formatDateTime(payment.verificationDate),
                payment.verifiedBy || '',
                payment.rejectionReason || ''
            ].map(escapeCSV);
        });

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;

        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        link.setAttribute('download', `payments_report_${timestamp}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // ==================== PRINT REPORT ====================

    const handlePrintReport = () => {
        setIsPrinting(true);

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Please allow pop-ups to print the report');
            setIsPrinting(false);
            return;
        }

        const reportDate = new Date().toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payments Report - ${reportDate}</title>
                <meta charset="UTF-8">
                <style>
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                        font-size: 12px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #1e3a8a;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1e3a8a;
                    }
                    .logo span { color: #ffd700; }
                    .report-title { font-size: 20px; font-weight: bold; margin: 10px 0; }
                    .report-date { color: #666; font-size: 11px; }
                    .summary-cards {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        margin: 20px 0;
                    }
                    .summary-card {
                        flex: 1;
                        min-width: 120px;
                        background: #f8f9fa;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 12px;
                        text-align: center;
                    }
                    .summary-card .value { font-size: 24px; font-weight: bold; }
                    .summary-card .label { color: #666; font-size: 11px; margin-top: 5px; }
                    .summary-card.primary .value { color: #1e3a8a; }
                    .summary-card.success .value { color: #10b981; }
                    .summary-card.warning .value { color: #f59e0b; }
                    .summary-card.danger .value { color: #ef4444; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                        font-size: 10px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px 6px;
                        text-align: left;
                        vertical-align: top;
                    }
                    th {
                        background: #1e3a8a;
                        color: white;
                        font-weight: 600;
                    }
                    tr:nth-child(even) { background: #f9fafb; }
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-size: 9px;
                        font-weight: 600;
                    }
                    .badge-success { background: #d1fae5; color: #065f46; }
                    .badge-warning { background: #fed7aa; color: #9b2c1d; }
                    .badge-danger { background: #fee2e2; color: #991b1b; }
                    .badge-info { background: #dbeafe; color: #1e40af; }
                    .badge-primary { background: #dbeafe; color: #1e40af; }
                    .badge-secondary { background: #e2e8f0; color: #475569; }
                    .footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 9px;
                        color: #666;
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                        .summary-card { break-inside: avoid; }
                        table { break-inside: auto; }
                        tr { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">OurMemories<br><span>ApplicationOffice</span></div>
                    <div class="report-title">Payments Report</div>
                    <div class="report-date">Generated on: ${reportDate}</div>
                </div>
                
                <div class="summary-cards">
                    <div class="summary-card primary">
                        <div class="value">${filteredPayments.length}</div>
                        <div class="label">Total Payments</div>
                    </div>
                    <div class="summary-card warning">
                        <div class="value">${filteredPayments.filter(p => p.status === 'AWAITING_VERIFICATION').length}</div>
                        <div class="label">Awaiting Verification</div>
                    </div>
                    <div class="summary-card success">
                        <div class="value">${filteredPayments.filter(p => p.status === 'VERIFIED').length}</div>
                        <div class="label">Verified</div>
                    </div>
                    <div class="summary-card danger">
                        <div class="value">${filteredPayments.filter(p => p.status === 'REJECTED').length}</div>
                        <div class="label">Rejected</div>
                    </div>
                </div>
                
                <h3 style="margin: 20px 0 10px; font-size: 14px;">Payments List (${filteredPayments.length} payments)</h3>
                 <table>
                    <thead>
                         <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference</th>
                            <th>Status</th>
                            <th>Uploaded</th>
                            <th>Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredPayments.slice(0, 100).map(payment => {
            const statusInfo = PAYMENT_STATUS[payment.status];
            return `
                                <tr>
                                    <td>#${payment.id}</td>
                                    <td>${payment.user?.email || 'N/A'}<br><small>${payment.user?.firstName || ''} ${payment.user?.lastName || ''}</small></td>
                                    <td>R ${payment.amount}</td>
                                    <td>${payment.paymentMethod}</td>
                                    <td><code>${payment.paymentReference || '—'}</code></td>
                                    <td><span class="badge badge-${statusInfo?.color || 'secondary'}">${statusInfo?.label || payment.status}</span></td>
                                    <td>${formatDateTime(payment.proofUploadedAt)}</td>
                                    <td>${formatDateTime(payment.verificationDate)}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                 </table>
                ${filteredPayments.length > 100 ? `<p style="margin-top: 10px;">Showing first 100 of ${filteredPayments.length} payments. For full list, use CSV export.</p>` : ''}
                
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} OurMemories ApplicationOffice. All rights reserved.</p>
                    <p>This report includes payment records up to ${reportDate}.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.print();
            setIsPrinting(false);
        };

        printWindow.onafterprint = () => {
            printWindow.close();
        };
    };

    // ==================== DOCUMENT HANDLERS ====================

    const handleViewProof = async (paymentId, fileName) => {
        setPreviewLoading(true);
        try {
            const response = await axios.get(
                `${API_BASE}/payments/admin/view-proof/${paymentId}`,
                {
                    responseType: "blob",
                    withCredentials: true
                }
            );

            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = URL.createObjectURL(blob);

            const isPdf = contentType === 'application/pdf';
            const isImage = contentType === 'image/jpeg' || contentType === 'image/jpg' || contentType === 'image/png';

            setPreviewDocument({
                url,
                fileName: fileName || `proof_of_payment_${paymentId}.pdf`,
                contentType,
                isPdf,
                isImage
            });
            setShowProofModal(true);
        } catch (err) {
            console.error("View failed:", err);
            setError("Failed to open document");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDownloadProof = async (paymentId, fileName) => {
        setDownloading(true);
        try {
            const response = await axios.get(
                `${API_BASE}/payments/admin/download-proof/${paymentId}`,
                {
                    responseType: "blob",
                    withCredentials: true,
                    timeout: 30000,
                    validateStatus: (status) => status === 200
                }
            );

            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            let downloadFileName = fileName;
            if (!downloadFileName) {
                const extension = contentType === 'application/pdf' ? '.pdf' :
                    contentType === 'image/jpeg' ? '.jpg' :
                        contentType === 'image/png' ? '.png' : '.pdf';
                downloadFileName = `payment_proof_${paymentId}${extension}`;
            }

            link.setAttribute('download', downloadFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            setError("Failed to download document");
        } finally {
            setDownloading(false);
        }
    };

    const handlePreviewClose = () => {
        if (previewDocument?.url) {
            URL.revokeObjectURL(previewDocument.url);
        }
        setShowProofModal(false);
        setPreviewDocument(null);
    };

    // ==================== API CALLS ====================

    const fetchAllPayments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/payments/admin/all-payments`, { withCredentials: true });
            setPayments(response.data || []);
            setFilteredPayments(response.data || []);
        } catch (err) {
            console.error('Failed to fetch payments:', err);
            setError('Failed to fetch payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get(`${API_BASE}/payments/admin/eft-stats`, { withCredentials: true });
            setStats(response.data);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    useEffect(() => {
        fetchAllPayments();
        fetchStatistics();
    }, []);

    // Filter payments
    useEffect(() => {
        let filtered = [...payments];

        if (activeTab === 'pending') {
            filtered = filtered.filter(p => p.status === 'AWAITING_VERIFICATION');
        } else if (activeTab === 'verified') {
            filtered = filtered.filter(p => p.status === 'VERIFIED');
        } else if (activeTab === 'rejected') {
            filtered = filtered.filter(p => p.status === 'REJECTED');
        } else if (activeTab === 'expired') {
            filtered = filtered.filter(p => p.status === 'EXPIRED');
        } else if (activeTab === 'all') {
            // Show all
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id?.toString().includes(searchTerm)
            );
        }

        setFilteredPayments(filtered);
        setCurrentPage(1);
    }, [searchTerm, activeTab, payments]);

    // ==================== PAYMENT VERIFICATION HANDLERS ====================

    const handleVerifyPayment = async () => {
        if (!selectedPayment) return;

        setVerifying(true);
        try {
            await axios.post(
                `${API_BASE}/payments/admin/verify-eft/${selectedPayment.id}`,
                {
                    paymentId: selectedPayment.id,
                    status: verificationStatus,
                    notes: verificationNotes
                },
                { withCredentials: true }
            );

            await fetchAllPayments();
            await fetchStatistics();

            setShowVerifyModal(false);
            setSelectedPayment(null);
            setVerificationNotes('');
            setVerificationStatus('VERIFIED');

            alert(`Payment ${verificationStatus === 'VERIFIED' ? 'verified' : 'rejected'} successfully!`);
        } catch (err) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.error || 'Failed to verify payment');
        } finally {
            setVerifying(false);
        }
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const openVerifyModal = (payment) => {
        setSelectedPayment(payment);
        setVerificationNotes('');
        setVerificationStatus('VERIFIED');
        setShowVerifyModal(true);
    };

    const handleRefresh = () => {
        fetchAllPayments();
        fetchStatistics();
    };

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const currentPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status) => {
        return getPaymentStatusBadge(status);
    };

    const getMethodBadge = (method) => {
        return method === 'EFT' ?
            <Badge bg="info" className="px-3 py-2">🏦 EFT</Badge> :
            <Badge bg="success" className="px-3 py-2">💳 Online</Badge>;
    };

    const countByStatus = (status) => {
        return payments.filter(p => p.status === status).length;
    };

    const getStatusCounts = () => {
        return {
            pending: countByStatus('AWAITING_VERIFICATION'),
            verified: countByStatus('VERIFIED'),
            rejected: countByStatus('REJECTED'),
            expired: countByStatus('EXPIRED'),
            all: payments.length
        };
    };

    const counts = getStatusCounts();

    if (loading && payments.length === 0) {
        return (
            <AdminLayout>
                <Container className="my-5 text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading payment verifications...</p>
                </Container>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Container fluid className="py-4">
                <div className="payment-management-header mb-4">
                    <Row className="align-items-center">
                        <Col>
                            <h1 className="h3 mb-1">💰 Payment Management</h1>
                            <p className="text-muted mb-0">Verify and manage EFT payments, track payment history</p>
                        </Col>
                        <Col xs="auto" className="d-flex gap-2">
                            <Button variant="outline-primary" onClick={handlePrintReport} disabled={loading || isPrinting}>
                                <FiPrinter className="me-1" /> Print Report
                            </Button>
                            <Button variant="outline-success" size="sm" onClick={exportCSV} disabled={loading}>
                                <FiDownload className="me-1" /> Export CSV
                            </Button>
                            <Button variant="outline-secondary" onClick={handleRefresh} disabled={loading}>
                                <FiRefreshCw className={`me-1 ${loading ? 'spin' : ''}`} />
                                Refresh
                            </Button>
                        </Col>
                    </Row>
                </div>

                {error && (
                    <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {/* Statistics Cards */}
                {stats && (
                    <Row className="g-4 mb-4">
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="shadow-sm stat-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-1">Awaiting Verification</h6>
                                            <h2 className="mb-0 text-warning">{stats.awaitingVerification || 0}</h2>
                                        </div>
                                        <div className="stat-icon bg-warning bg-opacity-10">
                                            <FiClock size={32} className="text-warning" />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="shadow-sm stat-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-1">Verified / Paid</h6>
                                            <h2 className="mb-0 text-success">{stats.paid || 0}</h2>
                                        </div>
                                        <div className="stat-icon bg-success bg-opacity-10">
                                            <FiCheckCircle size={32} className="text-success" />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="shadow-sm stat-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-1">Rejected</h6>
                                            <h2 className="mb-0 text-danger">{stats.rejected || 0}</h2>
                                        </div>
                                        <div className="stat-icon bg-danger bg-opacity-10">
                                            <FiXCircle size={32} className="text-danger" />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} lg={3}>
                            <Card className="shadow-sm stat-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-muted mb-1">Total Revenue</h6>
                                            <h2 className="mb-0 text-primary">{formatCurrency(stats.totalPaidAmount || 0)}</h2>
                                        </div>
                                        <div className="stat-icon bg-primary bg-opacity-10">
                                            <FiDollarSign size={32} className="text-primary" />
                                        </div>
                                    </div>
                                    <small className="text-muted">Avg verification: {Math.round(stats.averageVerificationHours || 0)} hrs</small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* Main Card */}
                <Card className="shadow-sm">
                    <Card.Header className="bg-white py-3">
                        <div className="d-flex flex-wrap justify-content-between align-items-center">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="mb-2 mb-md-0"
                            >
                                <Tab eventKey="pending" title={`Awaiting Verification (${counts.pending})`} />
                                <Tab eventKey="verified" title={`Verified / Paid (${counts.verified})`} />
                                <Tab eventKey="rejected" title={`Rejected (${counts.rejected})`} />
                                <Tab eventKey="expired" title={`Expired (${counts.expired})`} />
                                <Tab eventKey="all" title={`All (${counts.all})`} />
                            </Tabs>
                            <InputGroup style={{ width: '300px' }}>
                                <InputGroup.Text><FiSearch /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by email, reference, ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {filteredPayments.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                <FiAlertCircle size={24} className="mb-2" />
                                <p className="mb-0">No payments found for this category.</p>
                            </Alert>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <Table hover className="mb-0">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Reference</th>
                                            <th>Status</th>
                                            <th>Uploaded</th>
                                            <th>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentPayments.map(payment => (
                                            <tr key={payment.id}>
                                                <td className="fw-bold">#{payment.id} </td>
                                                <td>
                                                    <div className="user-info">
                                                        <strong>{payment.user?.email || 'N/A'}</strong>
                                                        <br />
                                                        <small className="text-muted">{payment.user?.firstName} {payment.user?.lastName}</small>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-primary">{formatCurrency(payment.amount)}</td>
                                                <td>{getMethodBadge(payment.paymentMethod)}</td>
                                                <td>
                                                    <code>{payment.paymentReference || '—'}</code>
                                                </td>
                                                <td>{getStatusBadge(payment.status)}</td>
                                                <td>{formatDateTime(payment.proofUploadedAt)}</td>
                                                <td>
                                                    <div className="d-flex gap-2 flex-wrap">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(payment)}
                                                            title="View Details"
                                                        >
                                                            <FiEye />
                                                        </Button>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleViewProof(payment.id, `proof_${payment.id}.pdf`)}
                                                            title="View Proof"
                                                            disabled={previewLoading}
                                                        >
                                                            {previewLoading ? <Spinner animation="border" size="sm" /> : <FiFileText />}
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => handleDownloadProof(payment.id, `payment_proof_${payment.id}.pdf`)}
                                                            title="Download Proof"
                                                            disabled={downloading}
                                                        >
                                                            {downloading ? <Spinner animation="border" size="sm" /> : <FiDownload />}
                                                        </Button>
                                                        {payment.status === 'AWAITING_VERIFICATION' && (
                                                            <>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => openVerifyModal(payment)}
                                                                    title="Verify"
                                                                >
                                                                    <FiCheck />
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedPayment(payment);
                                                                        setVerificationStatus('REJECTED');
                                                                        setShowVerifyModal(true);
                                                                    }}
                                                                    title="Reject"
                                                                >
                                                                    <FiX />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>

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
            </Container>

            {/* Verification Modal */}
            <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} centered>
                <Modal.Header closeButton className={verificationStatus === 'VERIFIED' ? 'bg-success text-white' : 'bg-danger text-white'}>
                    <Modal.Title>
                        {verificationStatus === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <>
                            <div className="payment-summary mb-4">
                                <h6>Payment Details</h6>
                                <p><strong>Payment ID:</strong> #{selectedPayment.id}</p>
                                <p><strong>User:</strong> {selectedPayment.user?.email}</p>
                                <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                <p><strong>Reference:</strong> {selectedPayment.paymentReference || '—'}</p>
                                <p><strong>Uploaded:</strong> {formatDateTime(selectedPayment.proofUploadedAt)}</p>
                            </div>

                            <h6>Proof of Payment</h6>
                            <div className="mb-3">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleViewProof(selectedPayment.id, `proof_${selectedPayment.id}.pdf`)}
                                    disabled={previewLoading}
                                >
                                    <FiEye className="me-2" />
                                    View Proof of Payment
                                </Button>
                                {' '}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handleDownloadProof(selectedPayment.id, `payment_proof_${selectedPayment.id}.pdf`)}
                                    disabled={downloading}
                                >
                                    <FiDownload className="me-2" />
                                    Download Proof
                                </Button>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Notes {verificationStatus === 'REJECTED' && '(Required)'}</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder={verificationStatus === 'VERIFIED' ?
                                        "Add any notes about this verification..." :
                                        "Please provide reason for rejection"}
                                />
                                {verificationStatus === 'REJECTED' && !verificationNotes && (
                                    <Form.Text className="text-danger">
                                        Rejection reason is required
                                    </Form.Text>
                                )}
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowVerifyModal(false)} disabled={verifying}>
                        Cancel
                    </Button>
                    <Button
                        variant={verificationStatus === 'VERIFIED' ? 'success' : 'danger'}
                        onClick={handleVerifyPayment}
                        disabled={verifying || (verificationStatus === 'REJECTED' && !verificationNotes)}
                    >
                        {verifying ? <Spinner animation="border" size="sm" /> : (verificationStatus === 'VERIFIED' ? 'Verify Payment' : 'Reject Payment')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Payment Details #{selectedPayment?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div className="payment-details">
                            <Row>
                                <Col md={6}>
                                    <h6>Payment Information</h6>
                                    <p><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</p>
                                    <p><strong>Method:</strong> {selectedPayment.paymentMethod}</p>
                                    <p><strong>Reference:</strong> {selectedPayment.paymentReference || '—'}</p>
                                    <p><strong>Status:</strong> {getStatusDisplay(selectedPayment.status)}</p>
                                    <p><strong>Created:</strong> {formatDateTime(selectedPayment.createdAt)}</p>
                                    {selectedPayment.paymentDate && (
                                        <p><strong>Payment Date:</strong> {formatDateTime(selectedPayment.paymentDate)}</p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6>User Information</h6>
                                    <p><strong>Email:</strong> {selectedPayment.user?.email}</p>
                                    <p><strong>Name:</strong> {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}</p>
                                    <p><strong>Phone:</strong> {selectedPayment.user?.phoneNumber || '—'}</p>
                                </Col>
                            </Row>
                            {selectedPayment.verificationDate && (
                                <>
                                    <hr />
                                    <Row>
                                        <Col md={12}>
                                            <h6>Verification Information</h6>
                                            <p><strong>Verified By:</strong> {selectedPayment.verifiedBy || '—'}</p>
                                            <p><strong>Verification Date:</strong> {formatDateTime(selectedPayment.verificationDate)}</p>
                                            {selectedPayment.verificationNotes && (
                                                <p><strong>Notes:</strong> {selectedPayment.verificationNotes}</p>
                                            )}
                                            {selectedPayment.rejectionReason && (
                                                <p><strong>Rejection Reason:</strong> {selectedPayment.rejectionReason}</p>
                                            )}
                                        </Col>
                                    </Row>
                                </>
                            )}
                            {selectedPayment.application && (
                                <>
                                    <hr />
                                    <h6>Application Information</h6>
                                    <p><strong>Application ID:</strong> #{selectedPayment.application.id}</p>
                                    <p><strong>Type:</strong> {selectedPayment.application.applicationType}</p>
                                    <p><strong>Status:</strong> {selectedPayment.application.status}</p>
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Proof of Payment Preview Modal */}
            <Modal show={showProofModal} onHide={handlePreviewClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex flex-column">
                        <span>Proof of Payment</span>
                        <small
                            className="text-muted fw-normal mt-1"
                            style={{
                                fontSize: '0.8rem',
                                wordBreak: 'break-all',
                                maxWidth: '100%'
                            }}
                        >
                            📄 {previewDocument?.fileName || 'Document'}
                        </small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: 0, minHeight: '400px', backgroundColor: '#f5f5f5' }}>
                    {previewLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <Spinner animation="border" variant="primary" />
                            <span className="ms-3">Loading document...</span>
                        </div>
                    ) : previewDocument ? (
                        previewDocument.isPdf ? (
                            <iframe
                                src={previewDocument.url}
                                title={previewDocument.fileName}
                                style={{
                                    width: '100%',
                                    height: '70vh',
                                    border: 'none',
                                    backgroundColor: '#fff'
                                }}
                            />
                        ) : previewDocument.isImage ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh', overflow: 'auto' }}>
                                <img
                                    src={previewDocument.url}
                                    alt={previewDocument.fileName}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '400px' }}>
                                <FiFileText size={64} className="text-muted mb-3" />
                                <p className="text-muted">Preview not available for this file type</p>
                                <Button
                                    variant="primary"
                                    onClick={() => handleDownloadProof(selectedPayment?.id, previewDocument.fileName)}
                                    className="mt-3"
                                >
                                    <FiDownload className="me-2" /> Download to View
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <p className="text-muted">No document to display</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handlePreviewClose}>
                        Close
                    </Button>
                    {previewDocument && selectedPayment && (
                        <Button
                            variant="primary"
                            onClick={() => handleDownloadProof(selectedPayment.id, previewDocument.fileName)}
                            disabled={downloading}
                        >
                            {downloading ? <Spinner animation="border" size="sm" className="me-2" /> : <FiDownload className="me-2" />}
                            Download
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </AdminLayout>
);
};

export default AdminPaymentManagement;
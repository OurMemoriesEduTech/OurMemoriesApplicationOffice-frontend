import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Card, Button, Form, Spinner, Alert,
    Table, Badge, InputGroup, Pagination
} from 'react-bootstrap';
import { FiDownload, FiFileText, FiCalendar, FiFilter, FiRefreshCw, FiSearch, FiPrinter } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar
} from 'recharts';
import './AdminReports.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}`;

const AdminReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState({
        applications: [],
        summary: { total: 0, approved: 0, pending: 0, rejected: 0, byType: {} },
        timeline: []
    });
    const [isPrinting, setIsPrinting] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        applicationType: '',
        status: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    // ==================== HELPER FUNCTIONS ====================

    const getStatusDisplay = (status) => {
        const statusMap = {
            'APPROVED': { text: 'Approved', color: 'success', icon: '✓' },
            'REJECTED': { text: 'Rejected', color: 'danger', icon: '✗' },
            'PENDING_PAYMENT': { text: 'Pending Payment', color: 'warning', icon: '⏳' },
            'PAYMENT_VERIFIED': { text: 'Payment Verified', color: 'info', icon: '✓' },
            'UNDER_REVIEW': { text: 'Under Review', color: 'primary', icon: '📋' },
            'CANCELLED': { text: 'Cancelled', color: 'secondary', icon: '✗' }
        };
        return statusMap[status] || { text: status || 'Pending', color: 'secondary', icon: '📋' };
    };

    const getStats = () => {
        const applications = reportData.applications;
        const total = applications.length;
        const approved = applications.filter(app => app.status === 'APPROVED').length;
        const rejected = applications.filter(app => app.status === 'REJECTED').length;
        const pending = applications.filter(app =>
            app.status === 'PENDING_PAYMENT' ||
            app.status === 'PAYMENT_VERIFIED' ||
            app.status === 'UNDER_REVIEW'
        ).length;

        const byType = applications.reduce((acc, app) => {
            const type = app.type || app.applicationType || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        return { total, approved, rejected, pending, byType };
    };

    const stats = getStats();

    // Format courses for display
    const formatCourses = (inst) => {
        const courses = [];
        if (inst.firstCourse) courses.push({ preference: '1st Choice', name: inst.firstCourse });
        if (inst.secondCourse) courses.push({ preference: '2nd Choice', name: inst.secondCourse });
        if (inst.thirdCourse) courses.push({ preference: '3rd Choice', name: inst.thirdCourse });
        return courses;
    };

    // ==================== API CALLS ====================

    const fetchReport = async () => {
        setLoading(true);
        setError('');

        try {
            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate,
                type: filters.applicationType || undefined,
                status: filters.status || undefined,
            };

            const response = await axios.get(`${API_BASE}/admin/reports`, {
                params,
                withCredentials: true,
            });

            console.log('API Response:', response.data); // Debug log

            let data;
            if (response.data.applications !== undefined) {
                data = response.data;
            } else if (response.data.data && response.data.data.applications !== undefined) {
                data = response.data.data;
            } else if (response.data.result && response.data.result.applications !== undefined) {
                data = response.data.result;
            } else {
                setError('Unexpected data format from server');
                setLoading(false);
                return;
            }

            // Map the data to ensure consistent field names
            const mappedApplications = (data.applications || []).map(app => ({
                id: app.id,
                applicant: app.applicant || app.applicant?.fullNames || 'N/A',
                email: app.email || app.applicant?.email || 'N/A',
                type: app.type || app.applicationType || 'Unknown',
                status: app.status,
                dateSubmitted: app.dateSubmitted || app.submittedDate,
                institutions: app.institutions || []
            }));

            setReportData({
                applications: mappedApplications,
                summary: data.summary || { total: 0, approved: 0, pending: 0, rejected: 0, byType: {} },
                timeline: data.timeline || []
            });
        } catch (err) {
            console.error('Error fetching report:', err);
            let errorMsg = 'Failed to fetch report data. Please try again.';
            if (err.response?.data?.message) errorMsg = err.response.data.message;
            else if (err.message) errorMsg = err.message;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
            applicationType: '',
            status: ''
        });
        setCurrentPage(1);
        setSearchTerm('');
    };

    const filteredApps = reportData.applications.filter(app => {
        const matchesSearch = (app.applicant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.institutions?.some(inst => inst.institutionName?.toLowerCase().includes(searchTerm.toLowerCase())) || false);
        const matchesType = !filters.applicationType || app.type === filters.applicationType;
        const matchesStatus = !filters.status || app.status === filters.status;

        let matchesDate = true;
        if (app.dateSubmitted && filters.startDate && filters.endDate) {
            const appDate = new Date(app.dateSubmitted);
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59);
            matchesDate = appDate >= startDate && appDate <= endDate;
        }

        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    const currentApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ==================== CSV EXPORT ====================

    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const formatDateTimeForCSV = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleString('en-ZA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch {
            return '';
        }
    };

    const formatInstitutionsForCSV = (app) => {
        if (!app.institutions || app.institutions.length === 0) return 'No institutions selected';

        if (app.type === 'NSFAS') {
            return 'NSFAS Bursary Application';
        }

        return app.institutions.map(inst => {
            const courses = [];
            if (inst.firstCourse) courses.push(`1st: ${inst.firstCourse}`);
            if (inst.secondCourse) courses.push(`2nd: ${inst.secondCourse}`);
            if (inst.thirdCourse) courses.push(`3rd: ${inst.thirdCourse}`);
            return `${inst.institutionName}${courses.length ? ` (${courses.join(', ')})` : ''}`;
        }).join('; ');
    };

    const exportCSV = () => {
        const headers = [
            'Application ID',
            'Applicant Full Name',
            'Email',
            'Application Type',
            'Status',
            'Submitted Date & Time',
            'Institutions & Course Preferences'
        ];

        const rows = filteredApps.map(app => {
            return [
                app.id,
                app.applicant || '',
                app.email || '',
                app.type || '',
                getStatusDisplay(app.status).text,
                formatDateTimeForCSV(app.dateSubmitted),
                formatInstitutionsForCSV(app)
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
        link.setAttribute('download', `applications_report_${timestamp}.csv`);

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

        const startDateFormatted = filters.startDate ? new Date(filters.startDate).toLocaleDateString('en-ZA') : 'N/A';
        const endDateFormatted = filters.endDate ? new Date(filters.endDate).toLocaleDateString('en-ZA') : 'N/A';

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Applications Report - ${reportDate}</title>
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
                    .filters-section {
                        background: #f8f9fa;
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        border: 1px solid #e2e8f0;
                        font-size: 11px;
                    }
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
                    .institution-list {
                        margin: 0;
                        padding-left: 0;
                        list-style: none;
                    }
                    .institution-item {
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .institution-item:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    .institution-name {
                        font-weight: 700;
                        color: #1e3a8a;
                        font-size: 11px;
                    }
                    .course-list {
                        margin: 4px 0 0 16px;
                        font-size: 9px;
                        color: #555;
                    }
                    .course-item {
                        margin: 2px 0;
                    }
                    .course-preference {
                        font-weight: 500;
                        color: #2563eb;
                    }
                    .chart-container {
                        margin: 20px 0;
                        padding: 15px;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .chart-title {
                        font-weight: bold;
                        margin-bottom: 15px;
                        color: #1e3a8a;
                        font-size: 14px;
                    }
                    .timeline-chart {
                        display: flex;
                        align-items: flex-end;
                        gap: 4px;
                        min-height: 180px;
                    }
                    .timeline-bar {
                        flex: 1;
                        text-align: center;
                    }
                    .timeline-bar-fill {
                        background: #3b82f6;
                        width: 100%;
                        border-radius: 4px 4px 0 0;
                    }
                    .timeline-label {
                        font-size: 8px;
                        margin-top: 5px;
                    }
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
                        .chart-container { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">OurMemories<br><span>ApplicationOffice</span></div>
                    <div class="report-title">Applications Report</div>
                    <div class="report-date">Generated on: ${reportDate}</div>
                </div>
                
                <div class="filters-section">
                    <strong>Report Filters:</strong><br>
                    Date Range: ${startDateFormatted} to ${endDateFormatted}<br>
                    Application Type: ${filters.applicationType || 'All'}<br>
                    Status: ${filters.status || 'All'}
                </div>
                
                <div class="summary-cards">
                    <div class="summary-card primary">
                        <div class="value">${stats.total}</div>
                        <div class="label">Total Applications</div>
                    </div>
                    <div class="summary-card success">
                        <div class="value">${stats.approved}</div>
                        <div class="label">Approved</div>
                    </div>
                    <div class="summary-card warning">
                        <div class="value">${stats.pending}</div>
                        <div class="label">Pending</div>
                    </div>
                    <div class="summary-card danger">
                        <div class="value">${stats.rejected}</div>
                        <div class="label">Rejected</div>
                    </div>
                </div>
                
                ${reportData.timeline && reportData.timeline.length > 0 ? `
                <div class="chart-container">
                    <div class="chart-title">Applications Trend</div>
                    <div class="timeline-chart">
                        ${reportData.timeline.map(item => {
            const maxCount = Math.max(...reportData.timeline.map(t => t.count), 1);
            const height = (item.count / maxCount) * 140;
            return `
                                <div class="timeline-bar">
                                    <div class="timeline-bar-fill" style="height: ${height}px;"></div>
                                    <div class="timeline-label">${item.date}<br>${item.count}</div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${Object.keys(stats.byType).length > 0 ? `
                <div class="chart-container">
                    <div class="chart-title">Applications by Type</div>
                    <table style="width: auto; margin: 0 auto;">
                        <thead>   </thead>
                        <tbody>
                            ${Object.entries(stats.byType).map(([type, count]) => `
                                  <tr><td>${type}</td><td>${count}</td><td>${((count / stats.total) * 100).toFixed(1)}%</td></tr>
                            `).join('')}
                        </tbody>
                     </table>
                </div>
                ` : ''}
                
                <h3 style="margin: 20px 0 10px; font-size: 14px;">Applications List (${filteredApps.length} applications)</h3>
                <table>
                    <thead>
                         <tr>
                            <th>#</th>
                            <th>Applicant</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Submitted Date</th>
                            <th>Institutions & Courses</th>
                         </tr>
                    </thead>
                    <tbody>
                        ${filteredApps.slice(0, 100).map((app, idx) => {
            const submittedDate = app.dateSubmitted ? new Date(app.dateSubmitted).toLocaleString('en-ZA') : 'N/A';
            const statusInfo = getStatusDisplay(app.status);

            let institutionsHtml = '';
            if (!app.institutions || app.institutions.length === 0) {
                institutionsHtml = '<div>No institutions selected</div>';
            } else if (app.type === 'NSFAS') {
                institutionsHtml = '<div>NSFAS Bursary Application</div>';
            } else {
                institutionsHtml = '<ul class="institution-list">' + app.institutions.map(inst => {
                    const courses = formatCourses(inst);
                    const coursesHtml = courses.length > 0 ?
                        `<div class="course-list">
                            ${courses.map(c => `<div class="course-item"><span class="course-preference">${c.preference}:</span> ${c.name}</div>`).join('')}
                        </div>` :
                        '<div class="course-list">No courses selected</div>';

                    return `
                        <li class="institution-item">
                            <div class="institution-name">🏛️ ${inst.institutionName}</div>
                            ${coursesHtml}
                        </li>
                    `;
                }).join('') + '</ul>';
            }

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${app.applicant || 'N/A'}</td>
                    <td>${app.email || 'N/A'}</td>
                    <td>${app.type || 'N/A'}</td>
                    <td><span class="badge badge-${statusInfo.color}">${statusInfo.text}</span></td>
                    <td>${submittedDate}</td>
                    <td>${institutionsHtml}</td>
                </tr>
            `;
        }).join('')}
                    </tbody>
                </table>
                ${filteredApps.length > 100 ? `<p style="margin-top: 10px;">Showing first 100 of ${filteredApps.length} applications. For full list, use CSV export.</p>` : ''}
                
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} OurMemories ApplicationOffice. All rights reserved.</p>
                    <p>This report includes applications submitted between ${startDateFormatted} and ${endDateFormatted}.</p>
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

    const exportPDF = () => {
        alert('For PDF export, please use the "Print Report" button and select "Save as PDF" in the print dialog.');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Container fluid className="py-4">
                <div className="report-header mb-4">
                    <Row className="align-items-center">
                        <Col>
                            <h1 className="h3 mb-1">Reports & Analytics</h1>
                            <p className="text-muted">Generate insights on applications and user activity</p>
                        </Col>
                        <Col xs="auto" className="d-flex gap-2">
                            <Button variant="outline-primary" onClick={handlePrintReport} disabled={loading || isPrinting}>
                                <FiPrinter className="me-1" /> Print Report
                            </Button>
                            <Button variant="outline-secondary" onClick={fetchReport} disabled={loading}>
                                <FiRefreshCw className="me-1" /> Refresh
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Filters */}
                <Card className="filter-card mb-4">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-3">
                            <FiFilter className="me-2" style={{ color: '#1e3a8a' }} size={20} />
                            <h6 className="mb-0 fw-bold" style={{ color: '#1e3a8a' }}>Report Filters</h6>
                        </div>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold mb-2">Start Date</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FiCalendar /></InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold mb-2">End Date</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FiCalendar /></InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold mb-2">Application Type</Form.Label>
                                    <Form.Select
                                        name="applicationType"
                                        value={filters.applicationType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Types</option>
                                        <option value="UNIVERSITY">University</option>
                                        <option value="TVET">TVET College</option>
                                        <option value="NSFAS">NSFAS/Bursary</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold mb-2">Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Status</option>
                                        <option value="APPROVED">Approved</option>
                                        <option value="PENDING_PAYMENT">Pending Payment</option>
                                        <option value="PAYMENT_VERIFIED">Payment Verified</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                                <Button variant="outline-secondary" className="w-100" onClick={resetFilters}>
                                    Reset Filters
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {error && (
                    <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Loading report data...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <Row className="g-4 mb-4">
                            <Col xs={12} sm={6} lg={3}>
                                <Card className="h-100 shadow-sm text-center stat-card">
                                    <Card.Body>
                                        <div className="stat-icon fs-1">📊</div>
                                        <div className="display-6 fw-bold text-primary">{stats.total}</div>
                                        <div className="text-muted small">Total Applications</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <Card className="h-100 shadow-sm text-center stat-card">
                                    <Card.Body>
                                        <div className="stat-icon fs-1">✓</div>
                                        <div className="display-6 fw-bold text-success">{stats.approved}</div>
                                        <div className="text-muted small">Approved</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <Card className="h-100 shadow-sm text-center stat-card">
                                    <Card.Body>
                                        <div className="stat-icon fs-1">⏳</div>
                                        <div className="display-6 fw-bold text-warning">{stats.pending}</div>
                                        <div className="text-muted small">Pending</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <Card className="h-100 shadow-sm text-center stat-card">
                                    <Card.Body>
                                        <div className="stat-icon fs-1">✗</div>
                                        <div className="display-6 fw-bold text-danger">{stats.rejected}</div>
                                        <div className="text-muted small">Rejected</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Trend Chart */}
                        {reportData.timeline && reportData.timeline.length > 0 && (
                            <Card className="mb-4 shadow-sm">
                                <Card.Header>
                                    <h5 className="mb-0">Applications Trend</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={reportData.timeline}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Breakdown by Type */}
                        {Object.keys(stats.byType).length > 0 && (
                            <Card className="mb-4 shadow-sm">
                                <Card.Header>
                                    <h5 className="mb-0">Applications by Type</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={Object.entries(stats.byType).map(([type, count]) => ({ type, count }))}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="type" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="count" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Applications Table */}
                        <Card className="shadow-sm">
                            <Card.Header className="d-flex flex-wrap justify-content-between align-items-center">
                                <h5 className="mb-0">Applications List</h5>
                                <div className="d-flex gap-2">
                                    <Button variant="outline-success" size="sm" onClick={exportCSV}>
                                        <FiDownload className="me-1" /> CSV
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={exportPDF}>
                                        <FiFileText className="me-1" /> PDF
                                    </Button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <div className="text-muted small">
                                        {filteredApps.length} applications found
                                    </div>
                                    <InputGroup style={{ width: '300px' }}>
                                        <InputGroup.Text><FiSearch /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name, type, or institution..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>

                                {filteredApps.length === 0 ? (
                                    <Alert variant="info">No applications match the current filters.</Alert>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <Table hover responsive className="mb-0">
                                                <thead>
                                                <tr>
                                                    <th style={{ width: '5%' }}>#</th>
                                                    <th style={{ width: '15%' }}>Applicant</th>
                                                    <th style={{ width: '15%' }}>Email</th>
                                                    <th style={{ width: '10%' }}>Type</th>
                                                    <th style={{ width: '10%' }}>Status</th>
                                                    <th style={{ width: '15%' }}>Submitted</th>
                                                    <th style={{ width: '30%' }}>Institutions & Courses</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {currentApps.map((app, idx) => {
                                                    const statusInfo = getStatusDisplay(app.status);

                                                    return (
                                                        <tr key={app.id}>
                                                            <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                            <td className="fw-semibold">{app.applicant || 'N/A'}</td>
                                                            <td>{app.email || 'N/A'}</td>
                                                            <td>{app.type || 'N/A'}</td>
                                                            <td>
                                                                <Badge bg={statusInfo.color} className="px-2 py-1">
                                                                    {statusInfo.text}
                                                                </Badge>
                                                            </td>
                                                            <td className="text-nowrap">{formatDate(app.dateSubmitted)}</td>
                                                            <td>
                                                                {!app.institutions || app.institutions.length === 0 ? (
                                                                    <div className="text-muted">No institutions selected</div>
                                                                ) : app.type === 'NSFAS' ? (
                                                                    <div>NSFAS Bursary Application</div>
                                                                ) : (
                                                                    <div className="institutions-container">
                                                                        {app.institutions.map((inst, instIdx) => {
                                                                            const courses = formatCourses(inst);
                                                                            return (
                                                                                <div key={inst.id || instIdx} className="mb-3 pb-2 border-bottom">
                                                                                    <div className="fw-semibold text-primary mb-1">
                                                                                        🏛️ {inst.institutionName}
                                                                                        {inst.institutionType && (
                                                                                            <Badge bg="light" className="ms-2 text-muted small">
                                                                                                {inst.institutionType}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    {courses.length > 0 ? (
                                                                                        <div className="ms-3">
                                                                                            {courses.map((course, cIdx) => (
                                                                                                <div key={cIdx} className="small text-muted mb-1">
                                                                                                    <span className="fw-medium">{course.preference}:</span> {course.name}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="small text-muted ms-3">No courses selected</div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
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
                                                    <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} />
                                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) pageNum = i + 1;
                                                        else if (currentPage <= 3) pageNum = i + 1;
                                                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                                        else pageNum = currentPage - 2 + i;
                                                        return (
                                                            <Pagination.Item key={pageNum} active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                                                                {pageNum}
                                                            </Pagination.Item>
                                                        );
                                                    })}
                                                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} />
                                                    <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                                                </Pagination>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </>
                )}
            </Container>
        </AdminLayout>
    );
};

export default AdminReports;
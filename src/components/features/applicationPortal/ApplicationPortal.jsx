// src/components/features/applicationPortal/ApplicationPortal.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./ApplicationForms.css";
import ApplicationTypeModal from "./ApplicationTypeModal.jsx";
import DocumentUploadModal from "./DocumentUploadModal.jsx";
import ApplicationDetailsModal from "./ApplicationDetailsModal.jsx";
import LoginModal from "../../common/auth/LoginModal.jsx";
import SignUpModal from "../../common/auth/SignUpModal.jsx";
import axios from "axios";
import ForgotPasswordModal from "../../common/auth/ForgotPasswordModal.jsx";
import VerifyOtpModal from "../../common/auth/VerifyOtpModal.jsx";
import ResetPasswordModal from "../../common/auth/ResetPasswordModal.jsx";
import { APPLICATION_STATUS, PAYMENT_STATUS, getStatusLabel, getStatusColor, getStatusIcon } from "../../../constants/applicationStatus";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const ApplicationPortal = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showVerifyOtpModal, setShowVerifyOtpModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [documentUploads, setDocumentUploads] = useState({});

  const formatCurrency = (amount) => {
    if (!amount) return "R 0.00";
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusInfo = PAYMENT_STATUS[paymentStatus];
    if (!statusInfo) return null;
    return (
        <Badge bg={statusInfo.color} className="ms-2">
          <span className="me-1">{statusInfo.icon}</span>
          {statusInfo.label}
        </Badge>
    );
  };

  const getStatusBadge = (status, paymentStatus) => {
    const appStatus = APPLICATION_STATUS[status];

    return (
        <div className="d-flex flex-column gap-2">
          <Badge
              bg={appStatus?.color || 'secondary'}
              className="d-flex align-items-center justify-content-center gap-1 px-3 py-2"
              style={{ fontSize: '0.85rem' }}
          >
            <span>{appStatus?.icon || '📋'}</span>
            <span>{appStatus?.label || status || 'Pending'}</span>
          </Badge>

          {paymentStatus && paymentStatus !== 'VERIFIED' && paymentStatus !== 'PAID' && (
              getPaymentStatusBadge(paymentStatus)
          )}
        </div>
    );
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
    setShowForgotPasswordModal(false);
    setShowResetPasswordModal(false);
    setShowVerifyOtpModal(false);
  };

  const openSignupModal = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowResetPasswordModal(false);
    setShowVerifyOtpModal(false);
  };

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
    setShowResetPasswordModal(false);
    setShowVerifyOtpModal(false);
    setShowSignupModal(false);
    setShowLoginModal(false);
  };

  const openResetPasswordModal = (email) => {
    setResetEmail(email);
    setShowResetPasswordModal(true);
    setShowForgotPasswordModal(false);
    setShowVerifyOtpModal(false);
    setShowSignupModal(false);
    setShowLoginModal(false);
  };

  const openVerifyOtpModal = (email) => {
    setResetEmail(email);
    setShowVerifyOtpModal(true);
    setShowResetPasswordModal(false);
    setShowForgotPasswordModal(false);
    setShowSignupModal(false);
    setShowLoginModal(false);
  };

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/applications`;
      const response = await axios.get(apiUrl, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      let applicationsData = [];
      if (Array.isArray(response.data)) {
        applicationsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.applications)) {
          applicationsData = response.data.applications;
        } else if (Array.isArray(response.data.data)) {
          applicationsData = response.data.data;
        }
      }

      const mappedApps = applicationsData.map(app => ({
        id: app.id,
        type: app.type || "Application",
        institutions: app.institutions || [],
        status: app.status || "PENDING_PAYMENT",
        date: app.date || app.submittedDate,
        documentsNeeded: app.documentsNeeded || [],
        paymentStatus: app.paymentStatus || "PENDING",
        applicationFee: app.applicationFee || 0,
        paymentMethod: app.paymentMethod,
        paymentReference: app.paymentReference
      }));

      setApplications(mappedApps);
      setError("");
    } catch (err) {
      console.error("Error fetching applications:", err);
      let errorMessage = "Failed to load applications. Please try again later.";
      if (err.response?.status === 401) {
        errorMessage = "Please log in to view your applications";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to view applications";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/application-portal");
    } else if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated, navigate, fetchApplications]);

  const handleUpdateSuccess = () => {
    fetchApplications();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-ZA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const handleStartApplication = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      setShowSignupModal(false);
    } else {
      setShowTypeModal(true);
    }
  };

  const handleTypeSelect = (type) => {
    setShowTypeModal(false);
    navigate(`/applynow/${type.toLowerCase().replace(" ", "-")}`, {
      state: { applicationType: type },
    });
  };

  const handleViewApplication = (app) => {
    console.log('Opening details for application:', app); // Debug log
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  const handleUploadNeededDocments = (app) => {
    setSelectedApplication(app);
    setDocumentUploads({});
    setShowDocumentModal(true);
  };

  // ApplicationPortal.jsx - Change the upload endpoint
  const handleDocumentUpload = async (docName) => {
    const file = documentUploads[docName];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ Send docName as query parameter instead of path variable
      const response = await axios.post(
          `${API_BASE_URL}/user/applications/${selectedApplication.id}/upload`,
          formData,
          {
            params: { docName: docName },  // ← Send as query param
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          }
      );

      if (response.data.success) {
        setDocumentUploads((prev) => ({ ...prev, [docName]: null }));
        setApplications((prev) =>
            prev.map((app) =>
                app.id === selectedApplication.id
                    ? {
                      ...app,
                      documentsNeeded: app.documentsNeeded.filter(
                          (d) => d !== docName
                      ),
                      paymentStatus: docName === 'Proof of Payment' ? 'AWAITING_VERIFICATION' : app.paymentStatus
                    }
                    : app
            )
        );
        setSelectedApplication((prev) => ({
          ...prev,
          documentsNeeded: prev.documentsNeeded.filter((d) => d !== docName),
          paymentStatus: docName === 'Proof of Payment' ? 'AWAITING_VERIFICATION' : prev.paymentStatus
        }));
        alert(`${docName} uploaded successfully!`);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.fail || err.message || `Failed to upload ${docName}`);
      throw err;
    }
  };

  const handleDocumentUploadComplete = async (docName) => {
    await fetchApplications();
    if (docName === 'Proof of Payment') {
      const updatedApp = applications.find(app => app.id === selectedApplication?.id);
      if (updatedApp) {
        setApplications(prevApps =>
            prevApps.map(app =>
                app.id === selectedApplication?.id
                    ? { ...app, paymentStatus: 'AWAITING_VERIFICATION', documentsNeeded: app.documentsNeeded.filter(d => d !== 'Proof of Payment') }
                    : app
            )
        );
      }
    }
  };

  if (loading) {
    return (
        <Container className="application-portal-container my-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-3">Loading your session...</p>
        </Container>
    );
  }

  return (
      <>
        <Container className="application-portal-container my-5">
          <header className="mb-5 text-center justify-content-center">
            <h1 className="display-4 fw-bold mb-4 animate-title">
              Application Portal
            </h1>
            <p className="hero-subtitle">
              Track, manage, and start your university, TVET college, and bursary
              applications with ease.
            </p>
          </header>

          {isAuthenticated ? (
              <main>
                <Row className="mb-4 g-4">
                  <Col lg={7}>
                    <Card className="shadow-sm border-0 application-card h-100 animate-card-2">
                      <Card.Body>
                        <Card.Title className="fw-bold mb-3">
                          Application Assistance Fee
                        </Card.Title>
                        <Card.Text className="mb-3 text-muted">
                          A small, non-refundable service fee helps us process your
                          applications quickly and securely.
                        </Card.Text>
                        <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
                          <div>
                            <div className="fw-semibold">1 Application</div>
                            <div className="text-muted">R70</div>
                          </div>
                          <div>
                            <div className="fw-semibold">2 Applications</div>
                            <div className="text-muted">R130</div>
                          </div>
                          <div>
                            <div className="fw-semibold">3 Applications</div>
                            <div className="text-muted">R190</div>
                          </div>
                          <div>
                            <div className="fw-semibold">4 Applications</div>
                            <div className="text-muted">R250</div>
                          </div>
                          <div>
                            <div className="fw-semibold">5 Applications</div>
                            <div className="text-muted">R310 + free NSFAS</div>
                          </div>
                        </div>

                        <hr />

                        <Card.Subtitle className="fw-bold mb-2">
                          Bank Transfer Details
                        </Card.Subtitle>
                        <dl className="row mb-0">
                          <dt className="col-sm-4 text-muted">Bank</dt>
                          <dd className="col-sm-8">Standard Bank</dd>
                          <dt className="col-sm-4 text-muted">Account Name</dt>
                          <dd className="col-sm-8">Application Assistance Service</dd>
                          <dt className="col-sm-4 text-muted">Account No.</dt>
                          <dd className="col-sm-8">123456789</dd>
                          <dt className="col-sm-4 text-muted">Branch Code</dt>
                          <dd className="col-sm-8">052852</dd>
                          <dt className="col-sm-4 text-muted">Reference</dt>
                          <dd className="col-sm-8">Your Email Address</dd>
                        </dl>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={5}>
                    <Card className="shadow-sm border-0 application-card text-center h-100 animate-card-2">
                      <Card.Body className="d-flex flex-column justify-content-center">
                        <Card.Title className="fw-bold mb-4">
                          Start New Application
                        </Card.Title>
                        <Card.Text className="mb-4">
                          Begin your journey by applying to a university, TVET
                          college, or bursary program.
                        </Card.Text>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleStartApplication}
                            className="action-btn w-100"
                        >
                          Start Application
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mb-5">
                  <Col>
                    <Card className="shadow-sm border-0 application-card animate-card-2">
                      <Card.Body>
                        <Card.Title className="fw-bold fs-2 mb-2">
                          Your Applications{" "}
                          <span className="text-muted fs-5">
                        ({applications.length} applications submitted)
                      </span>
                        </Card.Title>
                        <Card.Text className="mb-4">
                          Track the status of your applications, view details, and
                          upload any required documents.
                        </Card.Text>
                        {error && (
                            <Alert
                                variant="danger"
                                onClose={() => setError("")}
                                dismissible
                            >
                              {error}
                            </Alert>
                        )}

                        {applications.length > 0 ? (
                            <div className="table-responsive">
                              <Table hover className="application-table mb-0">
                                <thead className="table-light">
                                <tr>
                                  <th scope="col">Type</th>
                                  <th scope="col">Institutions</th>
                                  <th scope="col">Status</th>
                                  <th scope="col">Fee</th>
                                  <th scope="col">Submitted</th>
                                  <th scope="col">Documents Needed</th>
                                  <th scope="col">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id}>
                                      <td>{app.type}</td>
                                      <td>
                                        {app.institutions?.length > 0 ? (
                                            <ul className="list-unstyled mb-0">
                                              {app.institutions.map((inst, index) => (
                                                  <li key={index}>{inst}</li>
                                              ))}
                                            </ul>
                                        ) : (
                                            "—"
                                        )}
                                      </td>
                                      <td>
                                        {getStatusBadge(app.status, app.paymentStatus)}
                                      </td>
                                      <td className="fw-bold">
                                        {formatCurrency(app.applicationFee)}
                                      </td>
                                      <td>{formatDate(app.date)}</td>
                                      <td>
                                        {app.documentsNeeded &&
                                        app.documentsNeeded.length > 0 ? (
                                            <ul className="list-unstyled mb-0">
                                              {app.documentsNeeded.map((doc, idx) => (
                                                  <li key={idx}>{doc}</li>
                                              ))}
                                            </ul>
                                        ) : (
                                            "None"
                                        )}
                                      </td>
                                      <td>
                                        <div className="d-grid gap-2">
                                          {(app.documentsNeeded?.length > 0 ||
                                              (app.paymentStatus === 'PENDING' && app.status === 'PENDING_PAYMENT')) && (
                                              <Button
                                                  variant="outline-primary"
                                                  size="sm"
                                                  onClick={() => handleUploadNeededDocments(app)}
                                                  className="action-btn"
                                              >
                                                Upload
                                              </Button>
                                          )}
                                          <Button
                                              aria-label={`View ${app.type} application`}
                                              variant="outline-primary"
                                              size="sm"
                                              onClick={() => handleViewApplication(app)}
                                              className="action-btn"
                                          >
                                            View
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                ))}
                                </tbody>
                              </Table>
                            </div>
                        ) : (
                            <Alert variant="info">
                              No applications found. Start a new application today!
                            </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </main>
          ) : (
              <section className="d-flex justify-content-center">
                <Col md={8} className="text-center">
                  <Card className="shadow-sm border-0 application-card">
                    <Card.Body>
                      <Card.Title className="fw-bold mb-3">
                        Welcome to the Application Portal
                      </Card.Title>
                      <Card.Text className="mb-3 text-muted">
                        Sign in to track your applications, upload documents, and
                        start new applications.
                      </Card.Text>
                      <div className="d-grid">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={openLoginModal}
                            className="action-btn"
                        >
                          Sign In to Continue
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </section>
          )}
        </Container>

        <ApplicationTypeModal
            show={showTypeModal}
            onHide={() => setShowTypeModal(false)}
            onTypeSelect={handleTypeSelect}
        />

        <ApplicationDetailsModal
            show={showDetailsModal}
            onHide={() => setShowDetailsModal(false)}
            application={selectedApplication}
            onApplicationUpdated={handleUpdateSuccess}
        />
        <DocumentUploadModal
            show={showDocumentModal}
            onHide={() => setShowDocumentModal(false)}
            application={selectedApplication}
            documentUploads={documentUploads}
            setDocumentUploads={setDocumentUploads}
            onDocumentUpload={handleDocumentUpload}
            onUploadComplete={handleDocumentUploadComplete}
        />
        <LoginModal
            show={showLoginModal}
            onHide={() => setShowLoginModal(false)}
            openSignupModal={openSignupModal}
            openForgotPasswordModal={openForgotPasswordModal}
        />
        <SignUpModal
            show={showSignupModal}
            onHide={() => setShowSignupModal(false)}
            openLoginModal={openLoginModal}
        />
        <ForgotPasswordModal
            show={showForgotPasswordModal}
            onHide={() => setShowForgotPasswordModal(false)}
            openLoginModal={openLoginModal}
            openVerifyOtpModal={openVerifyOtpModal}
        />
        <VerifyOtpModal
            show={showVerifyOtpModal}
            onHide={() => setShowVerifyOtpModal(false)}
            email={resetEmail}
            openResetPasswordModal={openResetPasswordModal}
        />
        <ResetPasswordModal
            show={showResetPasswordModal}
            onHide={() => setShowResetPasswordModal(false)}
            email={resetEmail}
            openLoginModal={openLoginModal}
        />
      </>
  );
};

export default ApplicationPortal;
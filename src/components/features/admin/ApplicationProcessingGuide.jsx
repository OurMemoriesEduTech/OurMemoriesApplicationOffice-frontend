// src/pages/admin/ApplicationProcessingGuide.jsx
import React, { useState } from 'react';
import {
    Container,
    Card,
    ListGroup,
    Badge,
    Alert,
    Row,
    Col,
    Button,
    Carousel
} from 'react-bootstrap';
import { FiFileText, FiUser, FiDownload, FiMapPin, FiCheckCircle, FiClock } from 'react-icons/fi';
import './ApplicationProcessingGuide.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const ApplicationProcessingGuide = () => {
    const navigate = useNavigate();
     const [carouselIndex, setCarouselIndex] = useState(0);

    const steps = [
        {
            number: 1,
            title: "Open the Application",
            icon: FiFileText,
            color: "primary",
            content: (
                <>
                    <p className="mb-1">
                        Go to <Link to="/admin/applications" className="fw-bold text-white">Manage Applications</Link> → Click the <Badge bg="info">View</Badge> button.
                    </p>
                </>
            )
        },
        {
            number: 2,
            title: "Review Personal Details",
            icon: FiUser,
            color: "primary",
            content: (
                <>
                    <p>Check the learner's:</p>
                    <ul className="mb-0 text-start">
                        <li>Full name, ID/Passport number</li>
                        <li>Contact details (email & cell)</li>
                        <li>Physical address</li>
                    </ul>
                </>
            )
        },
        {
            number: 3,
            title: "Download & Verify Documents",
            icon: FiDownload,
            color: "primary",
            content: (
                <>
                    <p>Scroll down to the <strong>Supporting Documents</strong> section and click <Badge bg="success">Download</Badge> on each file:</p>
                    <ul className="mb-3 text-start">
                        <li>ID Copy</li>
                        <li>Matric Certificate / Transcript</li>
                        <li>CV or Motivation Letter (if uploaded)</li>
                    </ul>
                    <small>Make sure documents are clear, certified (where required), and match the learner's details.</small>
                </>
            )
        },
        {
            number: 4,
            title: "Check Institution & Course Choices",
            icon: FiMapPin,
            color: "primary",
            content: (
                <>
                    <p className="mb-0">Verify that the learner selected valid institutions and realistic course preferences.</p>
                </>
            )
        },
        {
            number: 5,
            title: "Approve or Reject",
            icon: FiCheckCircle,
            color: "success",
            content: (
                <>
                    <p>At the bottom of the modal, click:</p>
                    <div className="d-flex gap-2 flex-wrap justify-content-center my-3">
                        <Button variant="success" size="sm">Approve</Button>
                        <Button variant="danger" size="sm">Reject</Button>
                    </div>
                    <small><strong>Status updates instantly</strong> — no page refresh needed.</small>
                </>
            )
        },
        {
            number: 6,
            title: "Done! Move to Next Application",
            icon: FiClock,
            color: "primary",
            content: (
                <>
                    <p className="mb-0">Close the modal and repeat for the next learner. All approved applications will appear in your reports later.</p>
                </>
            )
        }
    ];

    const handleSelect = (selectedIndex) => {
        setCarouselIndex(selectedIndex);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <AdminLayout>
                <Container fluid className="py-4">
                    <Row className="justify-content-center">
                        <Col lg={10} xl={9}>
                            <Card className="shadow-lg border-0" style={{ borderRadius: '12px' }}>
                                <Card.Body className="p-5" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                                    <h1 className="mb-2 fw-bold display-6">
                                        Application Processing Guide
                                    </h1>
                                    <p className="text-muted small">
                                        Complete workflow for reviewing and managing learner applications
                                    </p>
                                    <Alert variant="info" className="border-0 mb-5" style={{ backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
                                        <div className="d-flex align-items-start">
                                            <FiFileText className="me-3 mt-1" size={20} style={{ color: '#1e3a8a' }} />
                                            <div>
                                                <strong style={{ color: '#1e3a8a', fontSize: '1.05rem' }}>6-Step Process</strong>
                                                <p className="mb-0 mt-1" style={{ color: '#1e3a8a', opacity: 0.8 }}>
                                                    Navigate through each step to thoroughly review and make informed decisions on applications.
                                                </p>
                                            </div>
                                        </div>
                                    </Alert>

                                    {/* Steps Carousel */}
                                    <div className="steps-carousel-container mt-4 mb-5">
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 fw-bold" style={{ color: '#1e3a8a' }}>Step {carouselIndex + 1} of {steps.length}</h5>
                                            <div className="text-muted small">Progress through the application review process</div>
                                        </div>
                                        <Carousel activeIndex={carouselIndex} onSelect={handleSelect} className="steps-carousel" controls indicators>
                                            {steps.map((step, index) => {
                                                const IconComponent = step.icon;
                                                const bgColor = step.color === 'success' ? '#16a34a' : '#1e3a8a';
                                                return (
                                                    <Carousel.Item key={index}>
                                                        <div className="carousel-step-content text-white p-5 rounded-lg" style={{ background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`, minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(30, 58, 138, 0.15)' }}>
                                                            <div>
                                                                <div className="d-flex align-items-center mb-4">
                                                                    <h4 className="mb-0" style={{ fontSize: '1.5rem', fontWeight: '600' }}><IconComponent className="me-2" size={28}/>{step.title}</h4>
                                                                </div>
                                                                <div className="carousel-step-text" style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.95 }}>
                                                                    {step.content}
                                                                </div>
                                                            </div>
                                                            <div className="mt-4 pt-3 border-top border-white" style={{ borderOpacity: '0.2' }}>
                                                                <small style={{ opacity: 0.8 }}>Press the right arrow or click navigation to proceed to the next step</small>
                                                            </div>
                                                        </div>
                                                    </Carousel.Item>
                                                );
                                            })}
                                        </Carousel>
                                    </div>

                                    <div className="d-flex justify-content-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <Link to="/admin/applications" className="btn btn-primary btn-lg px-5" style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '500' }}>
                                            <FiFileText className="me-2" size={20} /> View All Applications
                                        </Link>
                                        <button className="btn btn-outline-secondary btn-lg px-5" style={{ borderRadius: '8px', fontSize: '1.05rem', fontWeight: '500', color: '#64748b', borderColor: '#cbd5e1' }}>
                                            <FiFileText className="me-2" size={20} /> Save as PDF Guide
                                        </button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
        </AdminLayout>
    );
};

export default ApplicationProcessingGuide;             
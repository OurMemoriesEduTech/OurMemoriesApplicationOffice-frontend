// src/components/Footer.jsx
import React from 'react';
import { Container, Row, Col, Nav, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
    const { isAuthenticated, user } = useAuth();
    const currentYear = new Date().getFullYear();

    // ---------- ADMIN FOOTER (Clean & Professional) ----------
    const AdminFooter = () => (
        <footer className="footer bg-light border-top">
            <Container className="py-5">
                <Row className="g-4">
                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Admin Portal</h5>
                        <p className="text-muted">
                            Secure management of applications, users, and system settings.
                        </p>
                        <p className="text-muted small">
                            © {currentYear} Our Memories Application Office
                        </p>
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Admin Links</h5>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/admin/dashboard" className="text-muted mb-2">
                                Dashboard
                            </Nav.Link>
                            <Nav.Link as={Link} to="/admin/users" className="text-muted mb-2">
                                Manage Users
                            </Nav.Link>
                            <Nav.Link as={Link} to="/admin/applications" className="text-muted mb-2">
                                Applications
                            </Nav.Link>
                            <Nav.Link as={Link} to="/admin/settings" className="text-muted mb-2">
                                Settings
                            </Nav.Link>
                        </Nav>
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Support</h5>
                        <p className="text-muted mb-1">
                            Email: <a href="mailto:admin@ourmemories.co.za" className="text-muted">admin@ourmemories.co.za</a>
                        </p>
                        <p className="text-muted mb-1">
                            Phone: +27 12 345 6789
                        </p>
                        <p className="text-muted small">
                            Available Mon–Fri, 8:00 AM – 5:00 PM
                        </p>
                    </Col>
                </Row>

                <hr className="my-4" />

                <Row className="align-items-center">
                    <Col md={6}>
                        <p className="text-muted mb-0">
                            <small>
                                Admin access only. Unauthorized use is prohibited.
                            </small>
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <Nav>
                            <Nav.Link href="#" className="text-muted me-3">Privacy</Nav.Link>
                            <Nav.Link href="#" className="text-muted me-3">Terms</Nav.Link>
                            <Nav.Link href="#" className="text-muted">Support</Nav.Link>
                        </Nav>
                    </Col>
                </Row>
            </Container>
        </footer>
    );

    // ---------- APPLICANT FOOTER (Your Original) ----------
    const ApplicantFooter = () => (
        <footer className="footer">
            <Container className="py-5">
                <Row className="g-4">
                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Our Memories Application Office</h5>
                        <p className="text-muted">
                            Transforming your academic dreams into lasting realities, one
                            application at a time.
                        </p>
                        <p className="text-muted">
                            © {currentYear} Our Memories Application Office. All rights
                            reserved.
                        </p>
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Quick Links</h5>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/" className="text-muted mb-2">
                                Home
                            </Nav.Link>
                            <Nav.Link as={Link} to="/services" className="text-muted mb-2">
                                Services
                            </Nav.Link>
                            <Nav.Link as={Link} to="/about" className="text-muted mb-2">
                                About
                            </Nav.Link>
                            <Nav.Link as={Link} to="/contact-us" className="text-muted mb-2">
                                Contact Us
                            </Nav.Link>
                            <Nav.Link as={Link} to="/applynow" className="text-muted mb-2">
                                Apply Now
                            </Nav.Link>
                        </Nav>
                    </Col>

                    <Col md={4}>
                        <h5 className="fw-bold mb-3">Subscribe to Updates</h5>
                        <p className="text-muted mb-3">
                            Get the latest news on application deadlines and services.
                        </p>
                        <Form>
                            <Form.Group className="d-flex">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    className="me-2"
                                />
                                <Button variant="primary">Subscribe</Button>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>

                <hr className="my-4" />

                <Row className="align-items-center">
                    <Col md={6}>
                        <p className="text-muted mb-0">
                            <small>
                                Made with ❤️ for South African students applying to
                                universities, TVET colleges, and NSFAS bursaries.
                            </small>
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <Nav>
                            <Nav.Link href="#" className="text-muted me-3">
                                Privacy Policy
                            </Nav.Link>
                            <Nav.Link href="#" className="text-muted me-3">
                                Terms of Service
                            </Nav.Link>
                            <Nav.Link href="#" className="text-muted">
                                Support
                            </Nav.Link>
                        </Nav>
                    </Col>
                </Row>
            </Container>
        </footer>
    );

    // ---------- RENDER LOGIC ----------
    const isAdmin = isAuthenticated && user?.role === 'ADMIN';

    return isAdmin ? <AdminFooter /> : <ApplicantFooter />;
};

export default Footer;
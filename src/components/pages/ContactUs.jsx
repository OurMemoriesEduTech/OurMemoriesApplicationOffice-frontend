import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import './Dashboard.css';
import './Contact.css';

const ContactUs = () => {
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [contactError, setContactError] = useState('');
    const [contactSuccess, setContactSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactError('');
        setContactSuccess('');
        setIsSubmitting(true);

        // Validation
        if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
            setContactError('Please fill all required fields');
            setIsSubmitting(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactForm.email)) {
            setContactError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        // Simulate API call
        try {
            // In production: await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/contact`, contactForm)
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            setContactSuccess('Your message has been sent successfully! We\'ll get back to you within 24 hours.');
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setContactError('Failed to send message. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container className="mt-5 mb-5">
            <div className="contact-section">
                {/* Header Section */}
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold mb-4 contact-title">
                        Contact Us
                    </h1>
                    <p className="hero-subtitle">
                        Have questions or need assistance? Our team is here to help you navigate your academic journey.
                    </p>
                </div>

                <Row className="justify-content-center">
                    {/* Contact Information */}
                    <Col lg={4} className="mb-4">
                        <div className="contact-info">
                            <h3 className="contact-info-title mb-4">Get in Touch</h3>

                            <div className="contact-method mb-4">
                                <div className="contact-icon">📧</div>
                                <div>
                                    <h5>Email Us</h5>
                                    <p className="contact-detail">ourmemoriesapplicationoffice@gmail.com</p>
                                </div>
                            </div>

                            <div className="contact-method mb-4">
                                <div className="contact-icon">📞</div>
                                <div>
                                    <h5>Whatsapp Us</h5>
                                    <p className="contact-detail">+27 68 051 3619</p>
                                </div>
                            </div>

                            <div className="contact-method mb-4">
                                <div className="contact-icon">🕒</div>
                                <div>
                                    <h5>Business Hours</h5>
                                    <p className="contact-detail">Mon - Fri: 8:00 - 17:00<br/>Sat: 9:00 - 13:00</p>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="contact-icon">💬</div>
                                <div>
                                    <h5>Response Time</h5>
                                    <p className="contact-detail">Typically within 24 hours</p>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Contact Form */}
                    <Col lg={8}>
                        <Card className="contact-form-card">
                            <Card.Body className="p-4">
                                <Card.Title className="contact-form-title mb-4">
                                    Send us a Message
                                </Card.Title>

                                {contactError && (
                                    <Alert variant="danger" className="contact-alert">
                                        {contactError}
                                    </Alert>
                                )}
                                {contactSuccess && (
                                    <Alert variant="success" className="contact-alert">
                                        {contactSuccess}
                                    </Alert>
                                )}

                                <Form onSubmit={handleContactSubmit}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="contact-label">
                                                    Full Name <span className="required">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={contactForm.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your full name"
                                                    required
                                                    disabled={isSubmitting}
                                                    className="contact-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="contact-label">
                                                    Email Address <span className="required">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={contactForm.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email address"
                                                    required
                                                    disabled={isSubmitting}
                                                    className="contact-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="contact-label">
                                            Subject <span className="required">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            name="subject"
                                            value={contactForm.subject}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isSubmitting}
                                            className="contact-input"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="application-help">Application Help</option>
                                            <option value="technical-support">Technical Support</option>
                                            <option value="bursary-info">Bursary Information</option>
                                            <option value="career-guidance">Career Guidance</option>
                                            <option value="general-inquiry">General Inquiry</option>
                                            <option value="feedback">Feedback</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="contact-label">
                                            Message <span className="required">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="message"
                                            value={contactForm.message}
                                            onChange={handleInputChange}
                                            placeholder="Tell us how we can help you..."
                                            required
                                            disabled={isSubmitting}
                                            className="contact-input contact-textarea"
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="contact-submit-btn"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default ContactUs;
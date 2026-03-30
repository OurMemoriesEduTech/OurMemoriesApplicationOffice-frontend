import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Service.css';
import FeatureCard from "./FeatureCard.jsx";

const Service = () => {
    return (
        <>
            <Container className="mt-5 mb-5">
                <div className="main-content">
                    <h1 className="display-4 text-center mb-4">
                        Our Services
                    </h1>
                    <p className="text-muted text-center mb-5">
                        Explore our comprehensive services to support your academic and career journey.
                    </p>

                    <div className="button-container text-center mb-4">
                        <Link to="/applynow">
                            <Button
                                variant="primary"
                                size="lg"
                                className="me-2"
                            >
                                Get Started
                            </Button>
                        </Link>
                        <Button
                            variant="outline-secondary"
                            size="lg"
                        >
                            Learn More
                        </Button>
                    </div>

                    <Row xs={1} md={2} lg={4} className="g-4">
                        <Col>
                            <Link to="/application-portal" className="feature-card-link">
                                <FeatureCard
                                    icon="📝"
                                    title="Application Assistance"
                                    description="Streamlined support for university, TVET college, and bursary applications."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/online-tutorials" className="feature-card-link">
                                <FeatureCard
                                    icon="🎓"
                                    title="We Offer Online Tutorials"
                                    description="Access expert-led tutorials anytime, anywhere, and boost your learning experience with us."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/assignment-assistance" className="feature-card-link">
                                <FeatureCard
                                    icon="📘"
                                    title="Assignment Assistance"
                                    description="Get expert guidance and support to help you complete your assignments with confidence."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <FeatureCard
                                icon="💼"
                                title="Information Technology (IT tutorials)"
                                description="Receive expert guidance to align your career path with your goals."
                            />
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
};

export default Service;
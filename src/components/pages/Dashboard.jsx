import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import FeatureCard from "../common/FeatureCard.jsx";
import HeroImage from "../../assets/images/hero-img.jpg"; // Add your image path

const Dashboard = () => {
    return (
        <>
            <Container className="mt-4 mb-5">
                {/* Hero Section with Image */}
                <Row className="hero-section align-items-center mb-5">
                    <Col lg={6} className="hero-content">
                        <h1 className="display-4 fw-bold mb-4">
                            Our Memories Application Office
                        </h1>
                        <p className="hero-subtitle mb-4">
                            Transforming your academic dreams into lasting realities, one application at a time
                        </p>
                        <div className="button-container mb-4">
                            <Link to="/applynow">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="me-3"
                                >
                                    Apply Now
                                </Button>
                            </Link>
                            <Button
                                variant="outline-secondary"
                                size="lg"
                            >
                                Check More
                            </Button>
                        </div>
                    </Col>
                    <Col lg={6} className="hero-image-col">
                        <div className="hero-image-container">
                            <img
                                src={HeroImage}
                                alt="Students celebrating academic success"
                                className="hero-image"
                            />
                            <div className="image-overlay"></div>
                        </div>
                    </Col>
                </Row>

                {/* Features Section */}
                <div className="features-section">
                    <h2 className="section-title text-center mb-5">Our Services</h2>
                    <Row xs={1} md={2} lg={4} className="g-4">
                        <Col>
                            <Link to="/application-portal" className="feature-card-link">
                                <FeatureCard
                                    icon="📝"
                                    title="Application Portal"
                                    description="Submit University, TVET college, and bursary (NSFAS) applications through one unified system."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/courses-you-qualify" className="feature-card-link">
                                <FeatureCard
                                    icon="🔍"
                                    title="Courses You Qualify"
                                    description="Discover courses that match your school subjects with our smart matching engine."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/digital-prospectuses" className="feature-card-link">
                                <FeatureCard
                                    icon="📚"
                                    title="Digital Prospectuses"
                                    description="Access digital prospectuses from South African institutions all in one place."
                                />
                            </Link>
                        </Col>
                        <Col>
                            <Link to="/career-guidance" className="feature-card-link">
                                <FeatureCard
                                    icon="💼"
                                    title="Career Guidance"
                                    description="Get personalized career support and guidance based on your strengths and interests."
                                />
                            </Link>
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
};

export default Dashboard;
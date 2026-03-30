import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
    FaRocket, FaHeart, FaHandshake, FaBullseye,
    FaEye, FaPhone, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import './About.css';

// Correct way to import images from src/assets or public folder
// Option 1: Put images in src/assets/images/team/ and import them
import MzwandileImg from '../../assets/images/Mzwandile.jpg';   // ← Recommended
// If you prefer public folder, just use the path as string (no import)

const teamMembers = [
    {
        name: "Shupe Mphofela",
        role: "OMAO Application Assistant",
        province: "Gauteng/Limpopo",
        phone: "+27 72 968 9254",
        email: "dannmphofela@gmail.com",
        image: "/images/team/thandiwe.jpg",        // from public folder
    },
    {
        name: "Simphiwe Mabone",
        role: "OMAO Application Assistant",
        province: "Mpumalanga",
        phone: "+27 72 325 4327",
        email: "simphiwe@memoriesapp.co.za",
        image: "/images/team/sipho.jpg",
    },
    {
        name: "Mzwandile Thabethe",
        role: "OMAO Application Assistant",
        province: "Gauteng/Mpumalanga",
        phone: "+27 76 241 2129",
        email: "mzwandile@memoriesapp.co.za",
        image: MzwandileImg,                       // Imported image (best performance)
    },
    {
        name: "Sakhile Lusiba",
        role: "OMAO Application Assistant",
        province: "Limpopo",
        phone: "+27 78 444 7788",
        email: "kabelo@memoriesapp.co.za",
        image: "/images/team/kabelo.jpg",
    },
    {
        name: "Nomsa Nkosi",
        role: "OMAO Application Assistant",
        province: "Gauteng",
        phone: "+27 60 333 9900",
        email: "nomsa@memoriesapp.co.za",
        image: "/images/team/nomsa.jpg",
    },
    {
        name: "Jacques van Wyk",
        role: "OMAO Application Assistant",
        province: "Western Cape",
        phone: "+27 83 222 4455",
        email: "jacques@memoriesapp.co.za",
        image: "/images/team/jacques.jpg",
    },
];

const About = () => {
    return (
        <Container className="mt-5 mb-5">
            <div className="about-section">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold mb-4 about-title">About OMAO</h1>
                    <p className="hero-subtitle">
                        Empowering South African students to achieve their academic dreams through innovative technology and personalized support.
                    </p>
                </div>

                {/* Mission & Vision */}
                <Row className="g-4 mb-5">
                    <Col lg={6}>
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="info-card mission-card h-100">
                                <Card.Body>
                                    <div className="card-icon-wrapper">
                                        <FaBullseye className="card-icon" />
                                    </div>
                                    <h3 className="card-title">Our Mission</h3>
                                    <p className="card-text">
                                        Our Memories Application Office is dedicated to simplifying the application process for South African students seeking admission to universities, TVET colleges, and NSFAS bursaries. We provide a unified platform to track applications, discover courses, and access digital prospectuses.
                                    </p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col lg={6}>
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Card className="info-card vision-card h-100">
                                <Card.Body>
                                    <div className="card-icon-wrapper">
                                        <FaEye className="card-icon" />
                                    </div>
                                    <h3 className="card-title">Our Vision</h3>
                                    <p className="card-text">
                                        To transform the academic journey by offering personalized tools and career guidance, ensuring every student can navigate their path to success with confidence and ease.
                                    </p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>

                {/* Core Values */}
                <div className="values-section mb-5">
                    <motion.div
                        className="section-header text-center"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Our Core Values</h2>
                        <div className="section-divider mx-auto"></div>
                    </motion.div>

                    <Row className="g-4">
                        {[
                            { icon: FaRocket, title: 'Innovation', text: 'Leveraging cutting-edge technology to simplify complex application processes.', delay: 0 },
                            { icon: FaHeart, title: 'Accessibility', text: 'Ensuring every student, regardless of background, has equal access.', delay: 0.1 },
                            { icon: FaHandshake, title: 'Support', text: 'Providing personalized guidance throughout the academic journey.', delay: 0.2 }
                        ].map((value, idx) => (
                            <Col md={4} key={idx}>
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: value.delay }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Card className="value-card h-100">
                                        <Card.Body className="text-center">
                                            <div className="value-icon-wrapper mb-3">
                                                <value.icon className="value-icon" />
                                            </div>
                                            <h4 className="value-title">{value.title}</h4>
                                            <p className="value-text">{value.text}</p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Team Section */}
                <div className="team-section">
                    <motion.div
                        className="section-header text-center mb-5"
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Meet Our Team</h2>
                        <div className="section-divider mx-auto"></div>
                        <p className="section-subtitle">Dedicated team members across South Africa ready to assist you.</p>
                    </motion.div>

                    <Row className="g-4">
                        {teamMembers.map((member, index) => (
                            <Col md={6} lg={4} key={index}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.08 }}
                                    whileHover={{ y: -8 }}
                                >
                                    <Card className="team-card h-100">
                                        <div className="team-img-wrapper">
                                            <Card.Img
                                                variant="top"
                                                src={member.image}
                                                alt={member.name}
                                                className="team-img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://via.placeholder.com/400x400/6366f1/ffffff?text=${member.name.charAt(0)}`;
                                                }}
                                            />
                                            <div className="team-overlay"></div>
                                        </div>
                                        <Card.Body>
                                            <h5 className="team-name">{member.name}</h5>
                                            <p className="team-role">{member.role}</p>
                                            <div className="team-info">
                                                <div className="info-item">
                                                    <FaMapMarkerAlt className="info-icon" />
                                                    <span>{member.province}</span>
                                                </div>
                                                <div className="info-item">
                                                    <FaPhone className="info-icon" />
                                                    <a href={`tel:${member.phone}`}>{member.phone}</a>
                                                </div>
                                                <div className="info-item">
                                                    <FaEnvelope className="info-icon" />
                                                    <a href={`mailto:${member.email}`}>{member.email}</a>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        </Container>
    );
};

export default About;
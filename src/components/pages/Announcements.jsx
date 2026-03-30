import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaBullhorn, FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Announcements.css';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/announcements`;

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        try {
            const date = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T00:00:00`);
            return isNaN(date.getTime())
                ? 'Invalid date'
                : date.toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
        } catch {
            return 'Invalid date';
        }
    };

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                setError('');
                const { data } = await axios.get(API_URL);

                if (data.success && Array.isArray(data.announcements)) {
                    const sorted = [...data.announcements].sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                    );
                    setAnnouncements(sorted);
                } else {
                    setError('No announcements available at the moment.');
                }
            } catch (err) {
                console.error('Failed to load announcements:', err);
                setError('Failed to load announcements. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted fs-5">Loading latest announcements...</p>
            </Container>
        );
    }

    return (
        <Container className="announcements-page mt-5 mb-5">
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-4 announcement-title">
                    Latest Announcements
                </h1>
                <p className="announcement-subtitle">
                    Stay updated with important news and system notices
                </p>
            </div>

            {error && <Alert variant="warning">{error}</Alert>}

            {announcements.length === 0 ? (
                <Alert variant="info" className="text-center py-5 empty-state">
                    <FaBullhorn className="empty-icon mb-3" />
                    <h4>No announcements yet</h4>
                    <p className="text-muted">Check back soon for updates!</p>
                </Alert>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {announcements.map((ann, index) => (
                        <Col key={ann.id}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                            >
                                <Card className={`announcement-card h-100 ${ann.important ? 'important-card' : ''}`}>
                                    {ann.important && (
                                        <div className="important-badge">
                                            <Badge bg="danger" className="d-flex align-items-center gap-2">
                                                <FaExclamationCircle /> Important
                                            </Badge>
                                        </div>
                                    )}

                                    <Card.Body className="d-flex flex-column">
                                        <div className="announcement-icon-wrapper mb-3">
                                            <FaBullhorn className="announcement-icon" />
                                        </div>

                                        <Card.Title className="announcement-card-title">
                                            {ann.title}
                                        </Card.Title>

                                        <Card.Text className="announcement-text flex-grow-1">
                                            {ann.message}
                                        </Card.Text>

                                        <div className="announcement-footer mt-auto pt-3">
                                            <div className="d-flex align-items-center gap-2 text-muted">
                                                <FaCalendarAlt className="footer-icon" />
                                                <small className="fw-semibold">{formatDate(ann.date)}</small>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default AnnouncementsPage;

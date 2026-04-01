import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaBullhorn, FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Announcements.css';
import { API_BASE_URL } from '../../lib/apiBase.js';

const API_URL = `${API_BASE_URL}/announcements`;
const RETRY_DELAY_MS = 1500;

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
        let isMounted = true;

        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const fetchAnnouncements = async () => {
            setLoading(true);
            setError('');
            try {
                for (let attempt = 0; attempt < 2; attempt += 1) {
                    try {
                        const { data } = await axios.get(API_URL);

                        if (!isMounted) {
                            return;
                        }

                        if (data.success && Array.isArray(data.announcements)) {
                            const sorted = [...data.announcements].sort(
                                (a, b) => new Date(b.date) - new Date(a.date)
                            );
                            setAnnouncements(sorted);
                            setError('');
                        } else {
                            setAnnouncements([]);
                            setError('');
                        }
                        return;
                    } catch (err) {
                        if (attempt === 1) {
                            console.error('Failed to load announcements:', err);
                            if (isMounted) {
                                setAnnouncements([]);
                                setError('Failed to load announcements. Please try again later.');
                            }
                            return;
                        }

                        await wait(RETRY_DELAY_MS);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnnouncements();

        return () => {
            isMounted = false;
        };
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

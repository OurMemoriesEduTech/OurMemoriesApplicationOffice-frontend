// src/pages/admin/ViewApplication.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import AdminSidebar from '../admin/AdminSidebar.jsx';
import axios from 'axios';
import { API_BASE_URL } from '../../../lib/apiBase.js';

const ViewApplication = () => {
    const { id } = useParams();
    const [applicant, setApplicant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplicant = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/admin/application/${id}/applicant`,
                    { withCredentials: true }
                );

                if (res.data.success) {
                    setApplicant(res.data.applicant);
                } else {
                    setError(res.data.message || 'Failed to load applicant');
                }
            } catch (err) {
                setError('Not authorized or server error. Are you logged in as Admin?');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicant();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex min-vh-100 bg-light">
                <AdminSidebar />
                <Container className="d-flex align-items-center justify-content-center">
                    <Spinner animation="border" className="me-3" />
                    <h4>Loading applicant details...</h4>
                </Container>
            </div>
        );
    }

    if (error || !applicant) {
        return (
            <div className="d-flex min-vh-100 bg-light">
                <AdminSidebar />
                <Container className="mt-5">
                    <Alert variant="danger">{error || 'Applicant not found'}</Alert>
                    <Link to="/admin/applications" className="btn btn-secondary">
                        â† Back to Applications
                    </Link>
                </Container>
            </div>
        );
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <AdminSidebar />

            <Container fluid className="py-5">
                <h1 className="mb-4">Applicant Details â€“ ID #{id}</h1>

                <Card className="shadow">
                    <Card.Header className="bg-primary text-white fs-5">
                        Personal Information
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <p><strong>Title:</strong> {applicant.title}</p>
                                <p><strong>Full Names:</strong> {applicant.fullNames}</p>
                                <p><strong>Surname:</strong> {applicant.lastName}</p>
                                <p><strong>Initials:</strong> {applicant.initials}</p>
                                <p><strong>Gender:</strong> {applicant.gender}</p>
                                <p><strong>Date of Birth:</strong> {applicant.dateOfBirth}</p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Email:</strong> {applicant.email}</p>
                                <p><strong>Cell:</strong> {applicant.cellNumber}</p>
                                <p><strong>Home Number:</strong> {applicant.homeNumber || 'â€”'}</p>
                                <p><strong>ID Number:</strong> {applicant.idNumber || 'â€”'}</p>
                                <p><strong>Passport:</strong> {applicant.passportNumber || 'â€”'}</p>
                                <p><strong>South African:</strong> {applicant.isSouthAfrican ? 'Yes' : 'No'}</p>
                            </Col>
                        </Row>

                        <hr />

                        <h5>Residential Address</h5>
                        <p>
                            {applicant.physicalAddress}<br />
                            {applicant.physicalCity}, {applicant.physicalProvince} {applicant.physicalPostalCode}
                            {applicant.countryOfResidence && applicant.countryOfResidence !== 'South Africa' &&
                                <><br /><strong>Country:</strong> {applicant.countryOfResidence}</>
                            }
                        </p>
                    </Card.Body>
                </Card>

                <div className="mt-4">
                    <Link to="/admin/applications" className="btn btn-lg btn-secondary">
                        â† Back to All Applications
                    </Link>
                </div>
            </Container>
        </div>
    );
};

export default ViewApplication;

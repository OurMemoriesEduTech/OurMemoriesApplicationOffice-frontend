import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import './ApplicationForms.css';

const ApplicationTypeModal = ({ show, onHide, onTypeSelect }) => {
    return (
        <Modal show={show} onHide={onHide} centered className="application-form-card">
            <Modal.Header closeButton>
                <Modal.Title>Select Application Type</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <p className="text-muted mb-4">Choose the type of application you want to start.</p>
                <Row className="g-3">
                    <Col xs={12}>
                        <Button
                            variant="outline-primary"
                            size="lg"
                            className="w-100 action-btn"
                            onClick={() => onTypeSelect('University')}
                        >
                            University
                        </Button>
                    </Col>
                    <Col xs={12}>
                        <Button
                            variant="outline-primary"
                            size="lg"
                            className="w-100 action-btn"
                            onClick={() => onTypeSelect('TVET College')}
                        >
                            TVET College
                        </Button>
                    </Col>
                    <Col xs={12}>
                        <Button
                            variant="outline-primary"
                            size="lg"
                            className="w-100 action-btn"
                            onClick={() => onTypeSelect('Bursary')}
                        >
                            Bursary
                        </Button>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default ApplicationTypeModal;
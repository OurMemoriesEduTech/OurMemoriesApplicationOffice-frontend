import React from 'react';
import {Card} from "react-bootstrap";

const FeatureCard = ({ icon, title, description }) => (
    <Card className="feature-card shadow-sm h-100">
        <Card.Body className="text-center">
            <span className='fs-2'>{icon}</span>
            <Card.Title as="h3">{title}</Card.Title>
            <Card.Text>{description}</Card.Text>
        </Card.Body>
    </Card>
);

export default FeatureCard;
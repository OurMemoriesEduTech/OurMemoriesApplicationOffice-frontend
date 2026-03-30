import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressStepper from './ProgressStepper.jsx';
import useUnsavedChangesBlocker from '../../../../hooks/useUnsavedChangesBlocker.jsx';
import '../ApplicationForms.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    saId: /^\d{13}$/,
    phone: /^\+?\d{10,15}$/,
};

const APPLICATION_STEPS = ['Personal Details', 'Family Details', 'Education & Income', 'Documents'];

const INITIAL_FORM_STATE = {
    applicationType: 'NSFAS',
    title: '',
    initials: '',
    firstName: '',
    lastName: '',
    fullNames: '',
    dateOfBirth: '',
    gender: '',
    isSouthAfrican: true,
    idNumber: '',
    passportNumber: '',
    countryOfResidence: '',
    physicalAddress: '',
    physicalCity: '',
    physicalProvince: '',
    physicalPostalCode: '',
    email: '',
    cellNumber: '',
    homeNumber: '',
    fundingType: 'Bursary',
    isDisabled: false,
    householdIncomeUnder350k: true,
    highestGrade: '',
    studyCycleYears: '',
    hasOfferLetter: false,
    isMarried: false,
    fatherAlive: true,
    fatherTitle: '',
    fatherFirstName: '',
    fatherLastName: '',
    fatherIdNumber: '',
    motherAlive: true,
    motherTitle: '',
    motherFirstName: '',
    motherLastName: '',
    motherIdNumber: '',
    hasGuardian: false,
    guardianTitle: '',
    guardianFirstName: '',
    guardianLastName: '',
    guardianIdNumber: '',
    guardianRelationship: '',
    documents: {
        applicantIdCopy: null,
        fatherIdCopy: null,
        motherIdCopy: null,
        guardianIdCopy: null,
        nsfasConsentForm: null,
        nsfasDeclarationForm: null,
        proofOfIncome: null,
        offerLetter: null,
    },
    declaration: false,
};

const BursaryApplication = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [initialFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
        [formData, initialFormData]
    );

    const { ConfirmModal } = useUnsavedChangesBlocker(isDirty);

    useEffect(() => {
        if (!user) {
            navigate('/application-portal', { state: { from: '/applynow/nsfas' } });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, [name]: files[0] }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'isSouthAfrican' || name === 'isDisabled' || name === 'householdIncomeUnder350k' || 
                   name === 'hasOfferLetter' || name === 'isMarried' || name === 'fatherAlive' || 
                   name === 'motherAlive' || name === 'hasGuardian') {
            setFormData(prev => ({ ...prev, [name]: value === 'Yes' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title) newErrors.title = 'Required';
            if (!formData.initials) newErrors.initials = 'Required';
            if (!formData.firstName) newErrors.firstName = 'Required';
            if (!formData.lastName) newErrors.lastName = 'Required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
            if (!formData.gender) newErrors.gender = 'Required';
            if (formData.isSouthAfrican && (!formData.idNumber || !VALIDATION_PATTERNS.saId.test(formData.idNumber)))
                newErrors.idNumber = 'Valid 13-digit ID required';
            if (!formData.isSouthAfrican && !formData.passportNumber)
                newErrors.passportNumber = 'Required';
            if (!formData.physicalAddress) newErrors.physicalAddress = 'Required';
            if (!formData.physicalCity) newErrors.physicalCity = 'Required';
            if (!formData.physicalProvince) newErrors.physicalProvince = 'Required';
            if (!formData.email || !VALIDATION_PATTERNS.email.test(formData.email))
                newErrors.email = 'Valid email required';
            if (!formData.cellNumber || !VALIDATION_PATTERNS.phone.test(formData.cellNumber))
                newErrors.cellNumber = 'Valid phone required';
        } else if (step === 2) {
            if (formData.fatherAlive && !formData.fatherFirstName) newErrors.fatherFirstName = 'Required';
            if (formData.motherAlive && !formData.motherFirstName) newErrors.motherFirstName = 'Required';
            if (formData.hasGuardian && !formData.guardianFirstName) newErrors.guardianFirstName = 'Required';
        } else if (step === 3) {
            if (!formData.highestGrade) newErrors.highestGrade = 'Required';
            if (!formData.studyCycleYears) newErrors.studyCycleYears = 'Required';
        } else if (step === 4) {
            if (!formData.declaration) newErrors.declaration = 'You must accept the declaration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) setStep(prev => prev + 1);
    };

    const handlePrev = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        const submissionData = new FormData();
        
        const { documents, ...restData } = formData;
        submissionData.append('data', new Blob([JSON.stringify(restData)], { type: 'application/json' }));

        Object.entries(documents).forEach(([key, file]) => {
            if (file) submissionData.append(key, file);
        });

        try {
            await axios.post(`${API_BASE_URL}/user/submit`, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            setFormData(INITIAL_FORM_STATE);
            setShowSuccessModal(true);
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Submission failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate('/application-portal');
    };

    if (!user) return null;

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0 application-form-card">
                <Card.Body className="p-4 p-lg-5">
                    <h2 className="text-center mb-2">NSFAS Bursary Application</h2>
                    <p className="text-center text-muted mb-4">
                        Apply for funding to study at a public university or TVET college
                    </p>

                    <ProgressStepper step={step} steps={APPLICATION_STEPS} />
                    <ConfirmModal />

                    {errors.submit && <Alert variant="danger" dismissible onClose={() => setErrors({})}>{errors.submit}</Alert>}

                    <Form className="mt-4">
                        {step === 1 && (
                            <>
                                <h5 className="mb-3">Personal Information</h5>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Select name="title" value={formData.title} onChange={handleChange} isInvalid={!!errors.title}>
                                                <option value="">Select</option>
                                                <option>Mr</option>
                                                <option>Mrs</option>
                                                <option>Miss</option>
                                                <option>Ms</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Initials *</Form.Label>
                                            <Form.Control name="initials" value={formData.initials} onChange={handleChange} isInvalid={!!errors.initials} />
                                            <Form.Control.Feedback type="invalid">{errors.initials}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name *</Form.Label>
                                            <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} isInvalid={!!errors.firstName} />
                                            <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name *</Form.Label>
                                            <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} isInvalid={!!errors.lastName} />
                                            <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date of Birth *</Form.Label>
                                            <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} isInvalid={!!errors.dateOfBirth} />
                                            <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gender *</Form.Label>
                                            <Form.Select name="gender" value={formData.gender} onChange={handleChange} isInvalid={!!errors.gender}>
                                                <option value="">Select</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>South African? *</Form.Label>
                                            <Form.Select name="isSouthAfrican" value={formData.isSouthAfrican ? 'Yes' : 'No'} onChange={handleChange}>
                                                <option>Yes</option>
                                                <option>No</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{formData.isSouthAfrican ? 'ID Number *' : 'Passport Number *'}</Form.Label>
                                            <Form.Control 
                                                name={formData.isSouthAfrican ? 'idNumber' : 'passportNumber'} 
                                                value={formData.isSouthAfrican ? formData.idNumber : formData.passportNumber} 
                                                onChange={handleChange} 
                                                isInvalid={!!(formData.isSouthAfrican ? errors.idNumber : errors.passportNumber)} 
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formData.isSouthAfrican ? errors.idNumber : errors.passportNumber}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} />
                                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cell Number *</Form.Label>
                                            <Form.Control name="cellNumber" value={formData.cellNumber} onChange={handleChange} isInvalid={!!errors.cellNumber} />
                                            <Form.Control.Feedback type="invalid">{errors.cellNumber}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Home Number</Form.Label>
                                            <Form.Control name="homeNumber" value={formData.homeNumber} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Physical Address *</Form.Label>
                                    <Form.Control name="physicalAddress" value={formData.physicalAddress} onChange={handleChange} isInvalid={!!errors.physicalAddress} />
                                    <Form.Control.Feedback type="invalid">{errors.physicalAddress}</Form.Control.Feedback>
                                </Form.Group>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City *</Form.Label>
                                            <Form.Control name="physicalCity" value={formData.physicalCity} onChange={handleChange} isInvalid={!!errors.physicalCity} />
                                            <Form.Control.Feedback type="invalid">{errors.physicalCity}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Province *</Form.Label>
                                            <Form.Control name="physicalProvince" value={formData.physicalProvince} onChange={handleChange} isInvalid={!!errors.physicalProvince} />
                                            <Form.Control.Feedback type="invalid">{errors.physicalProvince}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Postal Code</Form.Label>
                                            <Form.Control name="physicalPostalCode" value={formData.physicalPostalCode} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h5 className="mb-3">Family Details</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label>Marital Status *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Married" name="isMarried" value="Yes" checked={formData.isMarried} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="Single" name="isMarried" value="No" checked={!formData.isMarried} onChange={handleChange} />
                                    </div>
                                </Form.Group>

                                <h6 className="mt-4 mb-3">Father's Information</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Is your father alive? *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Yes" name="fatherAlive" value="Yes" checked={formData.fatherAlive} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="No" name="fatherAlive" value="No" checked={!formData.fatherAlive} onChange={handleChange} />
                                    </div>
                                </Form.Group>
                                {formData.fatherAlive && (
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Title</Form.Label>
                                                <Form.Select name="fatherTitle" value={formData.fatherTitle} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    <option>Mr</option>
                                                    <option>Dr</option>
                                                    <option>Prof</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control name="fatherFirstName" value={formData.fatherFirstName} onChange={handleChange} isInvalid={!!errors.fatherFirstName} />
                                                <Form.Control.Feedback type="invalid">{errors.fatherFirstName}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control name="fatherLastName" value={formData.fatherLastName} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>ID Number</Form.Label>
                                                <Form.Control name="fatherIdNumber" value={formData.fatherIdNumber} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                <h6 className="mt-4 mb-3">Mother's Information</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Is your mother alive? *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Yes" name="motherAlive" value="Yes" checked={formData.motherAlive} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="No" name="motherAlive" value="No" checked={!formData.motherAlive} onChange={handleChange} />
                                    </div>
                                </Form.Group>
                                {formData.motherAlive && (
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Title</Form.Label>
                                                <Form.Select name="motherTitle" value={formData.motherTitle} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    <option>Mrs</option>
                                                    <option>Miss</option>
                                                    <option>Ms</option>
                                                    <option>Dr</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control name="motherFirstName" value={formData.motherFirstName} onChange={handleChange} isInvalid={!!errors.motherFirstName} />
                                                <Form.Control.Feedback type="invalid">{errors.motherFirstName}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control name="motherLastName" value={formData.motherLastName} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>ID Number</Form.Label>
                                                <Form.Control name="motherIdNumber" value={formData.motherIdNumber} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}

                                <h6 className="mt-4 mb-3">Guardian Information (if applicable)</h6>
                                <Form.Group className="mb-3">
                                    <Form.Label>Do you have a guardian? *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Yes" name="hasGuardian" value="Yes" checked={formData.hasGuardian} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="No" name="hasGuardian" value="No" checked={!formData.hasGuardian} onChange={handleChange} />
                                    </div>
                                </Form.Group>
                                {formData.hasGuardian && (
                                    <Row>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Title</Form.Label>
                                                <Form.Select name="guardianTitle" value={formData.guardianTitle} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    <option>Mr</option>
                                                    <option>Mrs</option>
                                                    <option>Miss</option>
                                                    <option>Ms</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} isInvalid={!!errors.guardianFirstName} />
                                                <Form.Control.Feedback type="invalid">{errors.guardianFirstName}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>ID Number</Form.Label>
                                                <Form.Control name="guardianIdNumber" value={formData.guardianIdNumber} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Relationship</Form.Label>
                                                <Form.Control name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h5 className="mb-3">Education & Income Information</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Funding Type *</Form.Label>
                                            <Form.Select name="fundingType" value={formData.fundingType} onChange={handleChange}>
                                                <option>Bursary</option>
                                                <option>Loan</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Do you have a disability? *</Form.Label>
                                            <div className="mt-2">
                                                <Form.Check inline type="radio" label="Yes" name="isDisabled" value="Yes" checked={formData.isDisabled} onChange={handleChange} />
                                                <Form.Check inline type="radio" label="No" name="isDisabled" value="No" checked={!formData.isDisabled} onChange={handleChange} />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Is your household income under R350,000 per year? *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Yes" name="householdIncomeUnder350k" value="Yes" checked={formData.householdIncomeUnder350k} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="No" name="householdIncomeUnder350k" value="No" checked={!formData.householdIncomeUnder350k} onChange={handleChange} />
                                    </div>
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Highest Grade Passed *</Form.Label>
                                            <Form.Select name="highestGrade" value={formData.highestGrade} onChange={handleChange} isInvalid={!!errors.highestGrade}>
                                                <option value="">Select</option>
                                                <option>Grade 9</option>
                                                <option>Grade 10</option>
                                                <option>Grade 11</option>
                                                <option>Grade 12</option>
                                                <option>NCV Level 4</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.highestGrade}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Study Cycle (Years) *</Form.Label>
                                            <Form.Control type="number" name="studyCycleYears" value={formData.studyCycleYears} onChange={handleChange} isInvalid={!!errors.studyCycleYears} />
                                            <Form.Control.Feedback type="invalid">{errors.studyCycleYears}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Do you have an offer letter? *</Form.Label>
                                    <div>
                                        <Form.Check inline type="radio" label="Yes" name="hasOfferLetter" value="Yes" checked={formData.hasOfferLetter} onChange={handleChange} />
                                        <Form.Check inline type="radio" label="No" name="hasOfferLetter" value="No" checked={!formData.hasOfferLetter} onChange={handleChange} />
                                    </div>
                                </Form.Group>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <h5 className="mb-3">Supporting Documents</h5>
                                <Alert variant="info" className="mb-4">
                                    Upload supporting documents. All documents are optional but recommended.
                                </Alert>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Applicant ID Copy</Form.Label>
                                            <Form.Control type="file" name="applicantIdCopy" onChange={handleChange} accept=".pdf,.jpg,.png" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Father's ID Copy</Form.Label>
                                            <Form.Control type="file" name="fatherIdCopy" onChange={handleChange} accept=".pdf,.jpg,.png" disabled={!formData.fatherAlive} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Mother's ID Copy</Form.Label>
                                            <Form.Control type="file" name="motherIdCopy" onChange={handleChange} accept=".pdf,.jpg,.png" disabled={!formData.motherAlive} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Guardian's ID Copy</Form.Label>
                                            <Form.Control type="file" name="guardianIdCopy" onChange={handleChange} accept=".pdf,.jpg,.png" disabled={!formData.hasGuardian} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>NSFAS Consent Form</Form.Label>
                                            <Form.Control type="file" name="nsfasConsentForm" onChange={handleChange} accept=".pdf" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>NSFAS Declaration Form</Form.Label>
                                            <Form.Control type="file" name="nsfasDeclarationForm" onChange={handleChange} accept=".pdf" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Proof of Income</Form.Label>
                                            <Form.Control type="file" name="proofOfIncome" onChange={handleChange} accept=".pdf,.jpg,.png" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Offer Letter</Form.Label>
                                            <Form.Control type="file" name="offerLetter" onChange={handleChange} accept=".pdf" disabled={!formData.hasOfferLetter} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mt-4">
                                    <Form.Check 
                                        type="checkbox" 
                                        name="declaration" 
                                        checked={formData.declaration} 
                                        onChange={handleChange}
                                        isInvalid={!!errors.declaration}
                                        label="I declare that all information provided is true and correct. I understand that false information may lead to disqualification."
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.declaration}</Form.Control.Feedback>
                                </Form.Group>
                            </>
                        )}

                        <div className="d-flex justify-content-between mt-4">
                            <Button variant="secondary" onClick={handlePrev} disabled={step === 1}>
                                Previous
                            </Button>
                            {step < APPLICATION_STEPS.length ? (
                                <Button variant="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button variant="success" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Modal show={showSuccessModal} onHide={handleModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Application Submitted</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your NSFAS bursary application has been submitted successfully. You will receive a confirmation email shortly.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleModalClose}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BursaryApplication;

import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Modal, Table } from 'react-bootstrap';
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

const APPLICATION_STEPS = ['Personal Details', 'Guardian Details', 'Subjects', 'College Choices', 'Documents', 'Review'];

const INITIAL_FORM_STATE = {
    applicationType: 'TVET',
    title: '',
    initials: '',
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
    guardianRelationship: '',
    guardianTitle: '',
    guardianInitials: '',
    guardianFullNames: '',
    guardianSurname: '',
    guardianCellNumber: '',
    guardianEmail: '',
    educationStatus: '',
    subjects: [{ name: '', level: '', percentage: '' }],
    selectedInstitutions: [],
    documents: {
        applicantIdCopy: null,
        grade9_10_11_12Results: null,
    },
    declaration: false,
};

const TvetApplication = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [initialFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // For step 4: college search and per‑college course state
    const [collegeSearchTerm, setCollegeSearchTerm] = useState('');

    // Confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isDirty = useMemo(
        () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
        [formData, initialFormData]
    );

    const { ConfirmModal } = useUnsavedChangesBlocker(isDirty);

    useEffect(() => {
        if (!user) {
            navigate('/application-portal', { state: { from: '/applynow/tvet' } });
        }
    }, [user, navigate]);

    // Scroll to top on step change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

    const colleges = [
        'Boland TVET College', 'Buffalo City TVET College', 'Capricorn TVET College',
        'Central Johannesburg TVET College', 'Coastal TVET College', 'College of Cape Town',
        'Eastcape Midlands TVET College', 'Ehlanzeni TVET College', 'Ekurhuleni East TVET College',
        'Ekurhuleni West TVET College', 'Elangeni TVET College', 'Esayidi TVET College',
        'Flavius Mareka TVET College', 'Gert Sibande TVET College', 'Goldfields TVET College',
        'Ikhala TVET College', 'King Hintsa TVET College', 'Lephalale TVET College',
        'Majuba TVET College', 'Motheo TVET College', 'Northlink TVET College',
        'Orbit TVET College', 'Port Elizabeth TVET College', 'Sedibeng TVET College',
        'South Cape TVET College', 'South West Gauteng TVET College', 'Thekwini TVET College',
        'Tshwane North TVET College', 'Tshwane South TVET College', 'Umfolozi TVET College',
        'Vhembe TVET College', 'Waterberg TVET College', 'West Coast TVET College',
    ];

    const saSubjects = [
        "Mathematics", "Mathematical Literacy", "Physical Sciences", "Life Sciences",
        "English", "Afrikaans", "Accounting", "Business Studies", "Economics",
        "History", "Geography", "Life Orientation", "Information Technology (IT)",
        "Computer Applications Technology (CAT)", "Engineering Graphics & Design (EGD)",
    ];

    const tvetCourses = [
        'NCV Business Management', 'NCV Electrical Infrastructure Construction',
        'NCV Information Technology', 'NCV Engineering & Related Design',
        'N4-N6 Financial Management', 'N4-N6 Engineering Studies',
        'N4-N6 Business Management', 'N4-N6 Information Technology',
    ];

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, [name]: files[0] }
            }));
        } else if (type === 'checkbox') {
            if (name === 'selectedInstitutions') {
                // Handled separately by handleCollegeCheck
                return;
            } else {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else if (name.startsWith('subject')) {
            const [field, index] = name.split('-');
            const idx = parseInt(index, 10);
            setFormData(prev => {
                const subjects = [...prev.subjects];
                const key = field.replace('subject', '').toLowerCase();
                subjects[idx] = { ...subjects[idx], [key]: value };
                return { ...prev, subjects };
            });
        } else if (name === 'isSouthAfrican') {
            setFormData(prev => ({ ...prev, isSouthAfrican: value === 'Yes' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Handler for step 4 college checkbox (like university)
    const handleCollegeCheck = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return {
                    ...prev,
                    selectedInstitutions: [
                        ...prev.selectedInstitutions,
                        {
                            institutionName: value,
                            institutionType: 'TVET College',
                            selectedCourses: []
                        }
                    ]
                };
            } else {
                return {
                    ...prev,
                    selectedInstitutions: prev.selectedInstitutions.filter(
                        item => item.institutionName !== value
                    )
                };
            }
        });
        // Clear any global error
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.selectedInstitutions;
            return newErrors;
        });
    };

    // Handler for course selection in step 4
    const handleCourseSelect = (institutionName, courseIndex, courseValue) => {
        setFormData(prev => ({
            ...prev,
            selectedInstitutions: prev.selectedInstitutions.map(item => {
                if (item.institutionName === institutionName) {
                    const newCourses = [...(item.selectedCourses || [])];
                    newCourses[courseIndex] = courseValue;
                    return { ...item, selectedCourses: newCourses };
                }
                return item;
            })
        }));
    };

    const handleAddSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name: '', level: '', percentage: '' }]
        }));
    };

    const handleRemoveSubject = (index) => {
        if (formData.subjects.length > 1) {
            setFormData(prev => ({
                ...prev,
                subjects: prev.subjects.filter((_, i) => i !== index)
            }));
        }
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title) newErrors.title = 'Required';
            if (!formData.initials) newErrors.initials = 'Required';
            if (!formData.fullNames) newErrors.fullNames = 'Required';
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
            if (!formData.guardianRelationship) newErrors.guardianRelationship = 'Required';
            if (!formData.guardianTitle) newErrors.guardianTitle = 'Required';
            if (!formData.guardianInitials) newErrors.guardianInitials = 'Required';
            if (!formData.guardianFullNames) newErrors.guardianFullNames = 'Required';
            if (!formData.guardianSurname) newErrors.guardianSurname = 'Required';
            if (!formData.guardianCellNumber || !VALIDATION_PATTERNS.phone.test(formData.guardianCellNumber))
                newErrors.guardianCellNumber = 'Valid phone required';
            // Email is optional – no validation needed
        } else if (step === 3) {
            if (!formData.educationStatus) {
                newErrors.educationStatus = 'Please select your educational status';
            }
            formData.subjects.forEach((subject, index) => {
                if (!subject.name) newErrors[`subjectName-${index}`] = 'Required';
                if (!subject.percentage || subject.percentage < 0 || subject.percentage > 100)
                    newErrors[`subjectPercentage-${index}`] = 'Enter 0-100';
            });
        } else if (step === 4) {
            if (formData.selectedInstitutions.length === 0) {
                newErrors.selectedInstitutions = 'Select at least one college';
            } else {
                formData.selectedInstitutions.forEach(inst => {
                    if (!inst.selectedCourses || inst.selectedCourses.filter(c => c && c.trim() !== '').length === 0) {
                        newErrors[`courses-${inst.institutionName}`] = 'Select at least one course for this college';
                    }
                });
            }
        } else if (step === 5) {
            if (!formData.documents.applicantIdCopy) newErrors.applicantIdCopy = 'Required';
            if (!formData.declaration) newErrors.declaration = 'You must accept the declaration';
        }
        // Step 6 has no validation – all data already validated

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
            setErrors({});
        }
    };

    const handlePrevious = () => {
        setStep(prev => prev - 1);
        setErrors({});
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        if (!validateStep()) {
            setLoading(false);
            return;
        }

        const submissionData = new FormData();
        const { documents, ...restData } = formData;

        const filteredInstitutions = formData.selectedInstitutions
            .filter(inst => inst.selectedCourses && inst.selectedCourses.some(c => c && c.trim() !== ''))
            .map(inst => ({
                institutionName: inst.institutionName,
                institutionType: inst.institutionType || 'TVET College',
                courses: (inst.selectedCourses || []).filter(c => c && c.trim() !== '')
            }));

        const request = {
            ...restData,
            selectedInstitutions: filteredInstitutions,
            southAfrican: formData.isSouthAfrican, // send as boolean with correct field name
        };
        // Remove the old field to avoid confusion
        delete request.isSouthAfrican;

        submissionData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        Object.keys(documents).forEach(key => {
            if (documents[key]) {
                submissionData.append(key, documents[key]);
            }
        });

        try {
            const response = await axios.post(`${API_BASE_URL}/user/submit`, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (response.data.success) {
                setFormData(INITIAL_FORM_STATE);
                setShowSuccessModal(true);
            } else {
                setErrors({ submit: response.data.fail || 'Submission failed' });
            }
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Submission failed' });
        } finally {
            setLoading(false);
        }
    };

    // Filter colleges based on search term
    const filteredColleges = useMemo(() => {
        return colleges.filter(name =>
            name.toLowerCase().includes(collegeSearchTerm.toLowerCase())
        );
    }, [collegeSearchTerm]);

    if (!user) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">Please log in to access this form.</Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4 p-lg-5">
                    <h2 className="text-center mb-2">TVET College Application</h2>
                    <p className="text-center text-muted mb-4">Complete all required fields to submit your application</p>

                    <ProgressStepper step={step} steps={APPLICATION_STEPS} />
                    <ConfirmModal />

                    {errors.submit && <Alert variant="danger" dismissible onClose={() => setErrors({})}>{errors.submit}</Alert>}
                    <Form>
                        {step === 1 && (
                            <div>
                                <h4 className="mb-4">Personal Information</h4>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Select name="title" value={formData.title} onChange={handleChange} isInvalid={!!errors.title}>
                                                <option value="">Select</option>
                                                <option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option>
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
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Name(s) *</Form.Label>
                                            <Form.Control name="fullNames" value={formData.fullNames} onChange={handleChange} isInvalid={!!errors.fullNames} />
                                            <Form.Control.Feedback type="invalid">{errors.fullNames}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name *</Form.Label>
                                            <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} isInvalid={!!errors.lastName} />
                                            <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date of Birth *</Form.Label>
                                            <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} isInvalid={!!errors.dateOfBirth} />
                                            <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gender *</Form.Label>
                                            <Form.Select name="gender" value={formData.gender} onChange={handleChange} isInvalid={!!errors.gender}>
                                                <option value="">Select</option>
                                                <option>Male</option><option>Female</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>South African Citizen? *</Form.Label>
                                            <Form.Select name="isSouthAfrican" value={formData.isSouthAfrican ? 'Yes' : 'No'} onChange={handleChange}>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>{formData.isSouthAfrican ? 'ID Number' : 'Passport Number'} *</Form.Label>
                                            <Form.Control
                                                name={formData.isSouthAfrican ? 'idNumber' : 'passportNumber'}
                                                value={formData.isSouthAfrican ? formData.idNumber : formData.passportNumber}
                                                onChange={handleChange}
                                                isInvalid={!!errors.idNumber || !!errors.passportNumber}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.idNumber || errors.passportNumber}</Form.Control.Feedback>
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
                                            <Form.Select name="physicalProvince" value={formData.physicalProvince} onChange={handleChange} isInvalid={!!errors.physicalProvince}>
                                                <option value="">Select</option>
                                                <option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option>
                                                <option>Eastern Cape</option><option>Free State</option><option>Limpopo</option>
                                                <option>Mpumalanga</option><option>Northern Cape</option><option>North West</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.physicalProvince}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Postal Code *</Form.Label>
                                            <Form.Control name="physicalPostalCode" value={formData.physicalPostalCode} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email *</Form.Label>
                                            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} />
                                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cell Number *</Form.Label>
                                            <Form.Control name="cellNumber" value={formData.cellNumber} onChange={handleChange} isInvalid={!!errors.cellNumber} />
                                            <Form.Control.Feedback type="invalid">{errors.cellNumber}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h4 className="mb-4">Guardian/Parent Details</h4>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Relationship *</Form.Label>
                                            <Form.Select name="guardianRelationship" value={formData.guardianRelationship} onChange={handleChange} isInvalid={!!errors.guardianRelationship}>
                                                <option value="">Select</option>
                                                <option>Mother</option><option>Father</option><option>Guardian</option><option>Other</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.guardianRelationship}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title *</Form.Label>
                                            <Form.Select name="guardianTitle" value={formData.guardianTitle} onChange={handleChange} isInvalid={!!errors.guardianTitle}>
                                                <option value="">Select</option>
                                                <option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.guardianTitle}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Initials *</Form.Label>
                                            <Form.Control name="guardianInitials" value={formData.guardianInitials} onChange={handleChange} isInvalid={!!errors.guardianInitials} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianInitials}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Names *</Form.Label>
                                            <Form.Control name="guardianFullNames" value={formData.guardianFullNames} onChange={handleChange} isInvalid={!!errors.guardianFullNames} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianFullNames}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Surname *</Form.Label>
                                            <Form.Control name="guardianSurname" value={formData.guardianSurname} onChange={handleChange} isInvalid={!!errors.guardianSurname} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianSurname}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cell Number *</Form.Label>
                                            <Form.Control name="guardianCellNumber" value={formData.guardianCellNumber} onChange={handleChange} isInvalid={!!errors.guardianCellNumber} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianCellNumber}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email (optional)</Form.Label>
                                            <Form.Control type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h4 className="mb-4">Academic Subjects</h4>

                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Your current educational status *</Form.Label>
                                    <div>
                                        <Form.Check
                                            inline
                                            type="radio"
                                            id="status-school"
                                            name="educationStatus"
                                            value="currently_at_school"
                                            label="Currently at school"
                                            checked={formData.educationStatus === 'currently_at_school'}
                                            onChange={handleChange}
                                        />
                                        <Form.Check
                                            inline
                                            type="radio"
                                            id="status-upgrading"
                                            name="educationStatus"
                                            value="upgrading"
                                            label="Upgrading"
                                            checked={formData.educationStatus === 'upgrading'}
                                            onChange={handleChange}
                                        />
                                        <Form.Check
                                            inline
                                            type="radio"
                                            id="status-completed"
                                            name="educationStatus"
                                            value="completed"
                                            label="Completed school"
                                            checked={formData.educationStatus === 'completed'}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {errors.educationStatus && (
                                        <Form.Text className="text-danger">{errors.educationStatus}</Form.Text>
                                    )}
                                </Form.Group>

                                {formData.subjects.map((subject, index) => (
                                    <Row key={index} className="mb-3">
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>Subject *</Form.Label>
                                                <Form.Select name={`subjectName-${index}`} value={subject.name} onChange={handleChange} isInvalid={!!errors[`subjectName-${index}`]}>
                                                    <option value="">Select</option>
                                                    {saSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">{errors[`subjectName-${index}`]}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>Level</Form.Label>
                                                <Form.Select name={`subjectLevel-${index}`} value={subject.level} onChange={handleChange}>
                                                    <option value="">Select</option>
                                                    <option>HL</option><option>SL</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>% *</Form.Label>
                                                <Form.Control type="number" name={`subjectPercentage-${index}`} value={subject.percentage} onChange={handleChange} min="0" max="100" isInvalid={!!errors[`subjectPercentage-${index}`]} />
                                                <Form.Control.Feedback type="invalid">{errors[`subjectPercentage-${index}`]}</Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} className="d-flex align-items-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => handleRemoveSubject(index)} disabled={formData.subjects.length === 1}>×</Button>
                                        </Col>
                                    </Row>
                                ))}
                                <Button variant="outline-primary" size="sm" onClick={handleAddSubject}>+ Add Subject</Button>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h4 className="mb-4">Select TVET Colleges & Courses</h4>

                                {/* College search bar */}
                                <div className="uni-search-wrapper mb-4">
                                    <input
                                        type="text"
                                        className="search-box"
                                        placeholder="🔍 Search TVET colleges..."
                                        value={collegeSearchTerm}
                                        onChange={(e) => setCollegeSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* College list – vertical, each with inline course UI when selected */}
                                <div className="uni-list">
                                    {filteredColleges.map(collegeName => {
                                        const isSelected = formData.selectedInstitutions.some(i => i.institutionName === collegeName);
                                        const selectedData = formData.selectedInstitutions.find(i => i.institutionName === collegeName);

                                        return (
                                            <div key={collegeName} className="uni-list-item">
                                                <div className="uni-check-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        id={`college-${collegeName}`}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const fakeEvent = { target: { value: collegeName, checked: e.target.checked } };
                                                            handleCollegeCheck(fakeEvent);
                                                        }}
                                                    />
                                                    <label htmlFor={`college-${collegeName}`}>{collegeName}</label>
                                                </div>

                                                {isSelected && (
                                                    <div className="uni-courses-inline">
                                                        {/* Three dropdowns */}
                                                        {[0, 1, 2].map(courseIdx => (
                                                            <div key={courseIdx} className="course-row">
                                                                <label>Course {courseIdx + 1}</label>
                                                                <select
                                                                    value={selectedData?.selectedCourses?.[courseIdx] || ''}
                                                                    onChange={(e) => handleCourseSelect(collegeName, courseIdx, e.target.value)}
                                                                >
                                                                    <option value="">– Select a course –</option>
                                                                    {tvetCourses.map(course => (
                                                                        <option key={course} value={course}>
                                                                            {course}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {errors.selectedInstitutions && (
                                    <Alert variant="danger" className="mt-3">{errors.selectedInstitutions}</Alert>
                                )}
                                {formData.selectedInstitutions.map(inst => {
                                    const errorKey = `courses-${inst.institutionName}`;
                                    return errors[errorKey] && (
                                        <Alert key={errorKey} variant="danger" className="mt-2 small">
                                            {errors[errorKey]}
                                        </Alert>
                                    );
                                })}
                            </div>
                        )}

                        {step === 5 && (
                            <div>
                                <h4 className="mb-4">Documents & Declaration</h4>
                                <Form.Group className="mb-3">
                                    <Form.Label>ID/Passport Copy *</Form.Label>
                                    <Form.Control type="file" name="applicantIdCopy" onChange={handleChange} accept=".pdf,.jpg,.png" isInvalid={!!errors.applicantIdCopy} />
                                    <Form.Control.Feedback type="invalid">{errors.applicantIdCopy}</Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Grade 9/10/11/12 Results</Form.Label>
                                    <Form.Control type="file" name="grade9_10_11_12Results" onChange={handleChange} accept=".pdf,.jpg,.png" />
                                </Form.Group>
                                <Form.Group className="mt-4">
                                    <Form.Check
                                        type="checkbox"
                                        name="declaration"
                                        checked={formData.declaration}
                                        onChange={handleChange}
                                        label="I declare that all information provided is true and correct"
                                        isInvalid={!!errors.declaration}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.declaration}</Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="review-step">
                                <h4 className="mb-4 fw-bold">Review Your Application</h4>
                                <p className="text-muted mb-4">Please verify all information before submitting. You can go back to any step to make changes.</p>

                                {/* Personal Information Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">👤 Personal Information</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        <Row className="g-3">
                                            <Col md={6}><strong>Title:</strong> {formData.title || '—'}</Col>
                                            <Col md={6}><strong>Initials:</strong> {formData.initials || '—'}</Col>
                                            <Col md={6}><strong>Name(s):</strong> {formData.fullNames || '—'}</Col>
                                            <Col md={6}><strong>Last Name:</strong> {formData.lastName || '—'}</Col>
                                            <Col md={6}><strong>Date of Birth:</strong> {formData.dateOfBirth || '—'}</Col>
                                            <Col md={6}><strong>Gender:</strong> {formData.gender || '—'}</Col>
                                            <Col md={6}><strong>South African:</strong> {formData.isSouthAfrican ? 'Yes' : 'No'}</Col>
                                            <Col md={6}><strong>ID/Passport:</strong> {formData.isSouthAfrican ? formData.idNumber : formData.passportNumber}</Col>
                                            <Col md={12}><strong>Physical Address:</strong> {formData.physicalAddress || '—'}</Col>
                                            <Col md={4}><strong>City:</strong> {formData.physicalCity || '—'}</Col>
                                            <Col md={4}><strong>Province:</strong> {formData.physicalProvince || '—'}</Col>
                                            <Col md={4}><strong>Postal Code:</strong> {formData.physicalPostalCode || '—'}</Col>
                                            <Col md={6}><strong>Email:</strong> {formData.email || '—'}</Col>
                                            <Col md={6}><strong>Cell Number:</strong> {formData.cellNumber || '—'}</Col>
                                            <Col md={6}><strong>Home Number:</strong> {formData.homeNumber || '—'}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Guardian Information Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">👪 Guardian / Parent Information</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        <Row className="g-3">
                                            <Col md={6}><strong>Relationship:</strong> {formData.guardianRelationship || '—'}</Col>
                                            <Col md={6}><strong>Title:</strong> {formData.guardianTitle || '—'}</Col>
                                            <Col md={6}><strong>Initials:</strong> {formData.guardianInitials || '—'}</Col>
                                            <Col md={6}><strong>Full Names:</strong> {formData.guardianFullNames || '—'}</Col>
                                            <Col md={6}><strong>Surname:</strong> {formData.guardianSurname || '—'}</Col>
                                            <Col md={6}><strong>Cell Number:</strong> {formData.guardianCellNumber || '—'}</Col>
                                            <Col md={12}><strong>Email:</strong> {formData.guardianEmail || '—'}</Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Subjects Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">📚 Subjects & Education Status</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        <p><strong>Education Status:</strong> {formData.educationStatus || '—'}</p>
                                        {formData.subjects.length > 0 ? (
                                            <Table striped bordered hover size="sm" className="mt-2">
                                                <thead className="table-light">
                                                <tr><th>Subject</th><th>Level</th><th>Percentage</th></tr>
                                                </thead>
                                                <tbody>
                                                {formData.subjects.map((sub, idx) => (
                                                    <tr key={idx}>
                                                        <td>{sub.name || '—'}</td>
                                                        <td>{sub.level || '—'}</td>
                                                        <td>{sub.percentage || '—'}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        ) : <Alert variant="info" className="mt-2">No subjects entered.</Alert>}
                                    </Card.Body>
                                </Card>

                                {/* College Choices Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">🏛️ TVET College Choices</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        {formData.selectedInstitutions.length > 0 ? (
                                            formData.selectedInstitutions.map((inst, idx) => (
                                                <div key={idx} className="mb-3 p-3 bg-light rounded">
                                                    <h6 className="fw-bold text-dark">{inst.institutionName}</h6>
                                                    <Row className="mt-2">
                                                        <Col md={4}><strong>First Choice:</strong> {inst.selectedCourses?.[0] || '—'}</Col>
                                                        <Col md={4}><strong>Second Choice:</strong> {inst.selectedCourses?.[1] || '—'}</Col>
                                                        <Col md={4}><strong>Third Choice:</strong> {inst.selectedCourses?.[2] || '—'}</Col>
                                                    </Row>
                                                </div>
                                            ))
                                        ) : <Alert variant="info">No colleges selected.</Alert>}
                                    </Card.Body>
                                </Card>

                                {/* Documents Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">📎 Supporting Documents</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        <Row>
                                            <Col md={6}>
                                                <strong>ID/Passport Copy:</strong> {formData.documents.applicantIdCopy ? formData.documents.applicantIdCopy.name : 'Not uploaded'}
                                            </Col>
                                            <Col md={6}>
                                                <strong>Grade 9/10/11/12 Results:</strong> {formData.documents.grade9_10_11_12Results ? formData.documents.grade9_10_11_12Results.name : 'Not uploaded'}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Declaration Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Body>
                                        <Form.Check
                                            type="checkbox"
                                            label="I confirm that all information provided is true and correct."
                                            checked={formData.declaration}
                                            disabled
                                            className="fw-bold text-success"
                                        />
                                    </Card.Body>
                                </Card>

                                <p className="text-muted mt-4 small">You can go back to previous steps to make changes if needed.</p>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mt-5">
                            <Button variant="secondary" onClick={handlePrevious} disabled={step === 1}>Previous</Button>
                            <Button
                                variant="primary"
                                onClick={step === APPLICATION_STEPS.length ? () => setShowConfirmModal(true) : handleNext}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : step === APPLICATION_STEPS.length ? 'Submit' : 'Next'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Please review your application carefully. Once submitted, you will not be able to make changes.</p>
                    <p>Are you sure you want to proceed?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Yes, Submit'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal */}
            <Modal show={showSuccessModal} onHide={() => { setShowSuccessModal(false); navigate('/application-portal'); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Success!</Modal.Title>
                </Modal.Header>
                <Modal.Body>Your TVET application has been submitted successfully.</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => navigate('/application-portal')}>Done</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TvetApplication;
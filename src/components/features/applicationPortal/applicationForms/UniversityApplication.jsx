import React, { useState, useEffect, useMemo } from 'react';
import {Container, Card, Form, Button, Alert, Row, Col, Modal, Table, Badge, Spinner} from 'react-bootstrap';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressStepper from './ProgressStepper.jsx';
import useUnsavedChangesBlocker from '../../../../hooks/useUnsavedChangesBlocker.jsx';
import { FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import '../ApplicationForms.css';
import { getLevel, meetsAPS, meetsSubjects } from '../../../../utils/eligibilityUtils.js';
import { subjectCategories } from "../../coursesYouQualify/Subjects.js";
import { universities } from "./university-data/universities.js";
import { validateProofFile } from '../../../../utils/paymentUtils.js';

// Combine all university arrays
const allUniversities = universities;

// Build a lookup object: { "University Name": universityObject }
const prospectusData = allUniversities.reduce((acc, uni) => {
    acc[uni.name] = uni;
    return acc;
}, {});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    saId: /^\d{13}$/,
    phone: /^\+?\d{10,15}$/,
};

const APPLICATION_STEPS = ['Personal Details', 'Guardian Details', 'Subjects', 'Course Choices', 'Documents', 'Review', 'Payment'];

const INITIAL_FORM_STATE = {
    applicationType: 'UNIVERSITY',
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
        grade11_12Results: null,
    },
    declaration: false,
};

// Calculate fee based on number of UNIVERSITIES selected (not courses)
const calculateApplicationFee = (numberOfUniversities) => {
    const fees = { 1: 70, 2: 130, 3: 190, 4: 250, 5: 310 };
    return fees[numberOfUniversities] || 70;
};

// Validate document file
const validateDocument = (file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only PDF, JPG, and PNG files are allowed' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true, error: null };
};

const UniversityApplication = () => {
    const { state } = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [initialFormData] = useState(INITIAL_FORM_STATE);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [courseSearch, setCourseSearch] = useState({});
    const [uniSearchTerm, setUniSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showProceedToPaymentModal, setShowProceedToPaymentModal] = useState(false);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
    const [paymentId, setPaymentId] = useState(null);

    // Compute student subjects and APS
    const studentSubjects = useMemo(() => {
        return formData.subjects.filter(s => s.name && s.percentage);
    }, [formData.subjects]);

    const studentAPS = useMemo(() => {
        return studentSubjects.reduce((total, s) => total + getLevel(s.percentage), 0);
    }, [studentSubjects]);

    // Calculate total number of UNIVERSITIES selected (not courses)
    const totalUniversities = useMemo(() => {
        return formData.selectedInstitutions.filter(inst =>
            inst.selectedCourses?.some(c => c && c.trim() !== '')
        ).length;
    }, [formData.selectedInstitutions]);

    // Calculate application fee based on number of universities
    const applicationFee = useMemo(() => {
        return calculateApplicationFee(totalUniversities);
    }, [totalUniversities]);

    const programmesByUni = useMemo(() => {
        const map = {};
        allUniversities.forEach(uni => {
            if (formData.educationStatus === 'completed') {
                const eligible = [];
                uni.faculties.forEach(fac => {
                    fac.programmes.forEach(prog => {
                        const apsOk = meetsAPS(prog.aps, studentAPS);
                        const subjectsOk = meetsSubjects(prog.requirements || [], studentSubjects);
                        if (apsOk && subjectsOk) {
                            eligible.push({ faculty: fac.name, programme: prog });
                        }
                    });
                });
                map[uni.id] = eligible;
            } else {
                const all = [];
                uni.faculties.forEach(fac => {
                    fac.programmes.forEach(prog => {
                        all.push({ faculty: fac.name, programme: prog });
                    });
                });
                map[uni.id] = all;
            }
        });
        return map;
    }, [allUniversities, formData.educationStatus, studentAPS, studentSubjects]);

    const isDirty = useMemo(
        () => JSON.stringify(formData) !== JSON.stringify(initialFormData),
        [formData, initialFormData]
    );

    const { ConfirmModal } = useUnsavedChangesBlocker(isDirty);

    useEffect(() => {
        if (!user) {
            navigate('/application-portal', { state: { from: '/applynow/university' } });
        }
    }, [user, navigate]);

    const universityOptions = allUniversities.map(uni => uni.name);

    // Document handlers
    const handleFileSelect = (e, docType) => {
        const file = e.target.files[0];
        if (file) {
            const validation = validateDocument(file);
            if (validation.valid) {
                setFormData(prev => ({
                    ...prev,
                    documents: { ...prev.documents, [docType]: file }
                }));
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[docType];
                    return newErrors;
                });
            } else {
                setErrors(prev => ({ ...prev, [docType]: validation.error }));
                e.target.value = '';
            }
        }
    };

    const handleRemoveDocument = (docType) => {
        setFormData(prev => ({
            ...prev,
            documents: { ...prev.documents, [docType]: null }
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[docType];
            return newErrors;
        });
    };

    const handleProofUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validation = validateProofFile(file);
            if (validation.valid) {
                setProofFile(file);
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.proofOfPayment;
                    return newErrors;
                });
            } else {
                setErrors(prev => ({ ...prev, proofOfPayment: validation.error }));
                e.target.value = '';
            }
        }
    };

    const handleRemoveProof = () => {
        setProofFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleUniversityCheck = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                const uniData = prospectusData[value];
                if (!uniData) return prev;
                return {
                    ...prev,
                    selectedInstitutions: [
                        ...prev.selectedInstitutions,
                        {
                            institutionName: value,
                            institutionId: uniData.id,
                            institutionType: "University",
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
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.selectedInstitutions;
            return newErrors;
        });
    };

    const handleCourseSelect = (uniId, courseIndex, courseValue) => {
        setFormData(prev => ({
            ...prev,
            selectedInstitutions: prev.selectedInstitutions.map(item => {
                if (item.institutionId === uniId) {
                    const newCourses = [...(item.selectedCourses || [])];
                    newCourses[courseIndex] = courseValue;
                    return { ...item, selectedCourses: newCourses };
                }
                return item;
            })
        }));
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`courses-${uniId}`];
            return newErrors;
        });
    };

    const handleCourseSearchChange = (uniId, value) => {
        setCourseSearch(prev => ({ ...prev, [uniId]: value }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            return;
        } else if (type === 'checkbox') {
            if (name === 'selectedInstitutions') {
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
            if (!formData.guardianFullNames) newErrors.guardianFullNames = 'Required';
            if (!formData.guardianCellNumber || !VALIDATION_PATTERNS.phone.test(formData.guardianCellNumber))
                newErrors.guardianCellNumber = 'Valid phone required';
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
                newErrors.selectedInstitutions = 'Select at least one university';
            } else {
                formData.selectedInstitutions.forEach(inst => {
                    if (!inst.selectedCourses || inst.selectedCourses.filter(c => c && c.trim() !== '').length === 0) {
                        newErrors[`courses-${inst.institutionId}`] = 'Select at least one course for this university';
                    }
                });
            }
        } else if (step === 5) {
            if (!formData.documents.applicantIdCopy) newErrors.applicantIdCopy = 'Required';
            if (!formData.declaration) newErrors.declaration = 'You must accept the declaration';
        }

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

    const openProceedToPaymentModal = () => {
        setShowProceedToPaymentModal(true);
    };

    const proceedToPayment = () => {
        setShowProceedToPaymentModal(false);
        setStep(prev => prev + 1);
    };

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
        if (method === 'EFT') {
            setShowPaymentInfoModal(true);
        } else if (method === 'ONLINE') {
            setPaymentCompleted(true);
        }
    };

    const handlePaymentInfoConfirm = () => {
        setShowPaymentInfoModal(false);
        setPaymentCompleted(true);
    };

    const submitApplicationWithPayment = async () => {
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
                institutionType: inst.institutionType || 'University',
                courses: (inst.selectedCourses || []).filter(c => c && c.trim() !== '')
            }));

        const request = {
            ...restData,
            selectedInstitutions: filteredInstitutions,
            southAfrican: formData.isSouthAfrican,
            numberOfUniversities: totalUniversities,
            applicationFee: applicationFee,
            status: paymentMethod === 'EFT' ? "PENDING_PAYMENT" : "PROCESSING",
            paymentStatus: paymentMethod === 'EFT' ? "AWAITING_VERIFICATION" : "PAID",
            paymentMethod: paymentMethod,
            paymentReference: user?.email
        };

        submissionData.append('data', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        Object.keys(documents).forEach(key => {
            if (documents[key]) {
                submissionData.append(key, documents[key]);
            }
        });

        if (paymentMethod === 'EFT' && proofFile) {
            submissionData.append('proofOfPayment', proofFile);
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/user/submit`, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });

            if (response.data.success) {
                setApplicationId(response.data.applicationId);
                setPaymentId(response.data.paymentId);

                if (paymentMethod === 'EFT') {
                    localStorage.setItem(`payment_${response.data.applicationId}`, JSON.stringify({
                        paymentId: response.data.paymentId,
                        amount: applicationFee,
                        reference: user?.email,
                        uploadedProof: !!proofFile,
                        submittedAt: new Date().toISOString()
                    }));
                }

                setFormData(INITIAL_FORM_STATE);
                setShowSuccessModal(true);
            } else {
                setErrors({ submit: response.data.fail || 'Submission failed' });
            }
        } catch (error) {
            console.error('Submission error:', error);
            setErrors({ submit: error.response?.data?.message || 'Submission failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const filteredUniversityOptions = useMemo(() => {
        return universityOptions.filter(name =>
            name.toLowerCase().includes(uniSearchTerm.toLowerCase())
        );
    }, [universityOptions, uniSearchTerm]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

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
                    <h2 className="text-center mb-2">University Application</h2>
                    <p className="text-center text-muted mb-4">Complete all required fields to submit your application</p>

                    <ProgressStepper step={step} steps={APPLICATION_STEPS} />
                    <ConfirmModal />

                    {errors.submit && <Alert variant="danger" dismissible onClose={() => setErrors({})}>{errors.submit}</Alert>}

                    <Form>
                        {/* Step 1: Personal Details */}
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
                                            <Form.Label>Postal Code</Form.Label>
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

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious} disabled={step === 1}>Previous</Button>
                                    <Button variant="primary" onClick={handleNext}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Guardian Details */}
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
                                </Row>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Select name="guardianTitle" value={formData.guardianTitle} onChange={handleChange}>
                                                <option value="">Select</option>
                                                <option>Mr</option><option>Mrs</option><option>Miss</option><option>Ms</option><option>Dr</option><option>Prof</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Initials</Form.Label>
                                            <Form.Control name="guardianInitials" value={formData.guardianInitials} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Names *</Form.Label>
                                            <Form.Control name="guardianFullNames" value={formData.guardianFullNames} onChange={handleChange} isInvalid={!!errors.guardianFullNames} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianFullNames}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Surname</Form.Label>
                                            <Form.Control name="guardianSurname" value={formData.guardianSurname} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cell Number *</Form.Label>
                                            <Form.Control name="guardianCellNumber" value={formData.guardianCellNumber} onChange={handleChange} isInvalid={!!errors.guardianCellNumber} />
                                            <Form.Control.Feedback type="invalid">{errors.guardianCellNumber}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email (optional)</Form.Label>
                                            <Form.Control type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
                                    <Button variant="primary" onClick={handleNext}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Subjects */}
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
                                    <div key={index} className="subject-row-container mb-4 pb-3 border-bottom">
                                        <Row className="align-items-end">
                                            <Col md={5}>
                                                <Form.Group>
                                                    <Form.Label>Subject *</Form.Label>
                                                    <Form.Select
                                                        name={`subjectName-${index}`}
                                                        value={subject.name}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors[`subjectName-${index}`]}
                                                    >
                                                        <option value="">Select</option>
                                                        {subjectCategories.map(cat => (
                                                            <optgroup key={cat.category} label={cat.category}>
                                                                {cat.subjects.map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[`subjectName-${index}`]}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Level</Form.Label>
                                                    <Form.Select
                                                        name={`subjectLevel-${index}`}
                                                        value={subject.level}
                                                        onChange={handleChange}
                                                    >
                                                        <option value="">Select</option>
                                                        <option>HL</option>
                                                        <option>SL</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>% *</Form.Label>
                                                    <Form.Select
                                                        name={`subjectPercentage-${index}`}
                                                        value={subject.percentage}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors[`subjectPercentage-${index}`]}
                                                    >
                                                        <option value="">Select %</option>
                                                        <option value="95">80-100% (Level 7)</option>
                                                        <option value="75">70-79% (Level 6)</option>
                                                        <option value="65">60-69% (Level 5)</option>
                                                        <option value="55">50-59% (Level 4)</option>
                                                        <option value="45">40-49% (Level 3)</option>
                                                        <option value="35">30-39% (Level 2)</option>
                                                        <option value="15">0-29% (Level 1)</option>
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors[`subjectPercentage-${index}`]}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={2} className="text-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveSubject(index)}
                                                    disabled={formData.subjects.length === 1}
                                                    className="mt-2 mt-md-0"
                                                >
                                                    Remove
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                <Button variant="outline-primary" size="sm" onClick={handleAddSubject}>
                                    + Add Subject
                                </Button>

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
                                    <Button variant="primary" onClick={handleNext}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Course Choices */}
                        {step === 4 && (
                            <div>
                                <div className="step4-header">
                                    <h4 className="explorer-title">
                                        🎓 University Explorer
                                        <span className="explorer-badge">with course search</span>
                                    </h4>
                                    <div className="subhead">
                                        Select universities, then search and choose up to 3 courses per university.
                                    </div>
                                </div>

                                <div className="uni-search-wrapper">
                                    <input
                                        type="text"
                                        className="search-box"
                                        placeholder="🔍 Search universities..."
                                        value={uniSearchTerm}
                                        onChange={(e) => setUniSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="uni-list">
                                    {filteredUniversityOptions.map(uniName => {
                                        const isSelected = formData.selectedInstitutions.some(i => i.institutionName === uniName);
                                        const selectedData = formData.selectedInstitutions.find(i => i.institutionName === uniName);
                                        const uniData = prospectusData[uniName];

                                        return (
                                            <div key={uniName} className="uni-list-item">
                                                <div className="uni-check-wrapper">
                                                    <input
                                                        type="checkbox"
                                                        id={`uni-${uniName}`}
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const fakeEvent = { target: { value: uniName, checked: e.target.checked } };
                                                            handleUniversityCheck(fakeEvent);
                                                        }}
                                                    />
                                                    <label htmlFor={`uni-${uniName}`}>{uniName}</label>
                                                </div>

                                                {isSelected && uniData && (
                                                    <div className="uni-courses-inline">
                                                        <div className="course-search">
                                                            <input
                                                                type="text"
                                                                placeholder="🔍 Search courses by name or code..."
                                                                value={courseSearch[uniData.id] || ''}
                                                                onChange={(e) => handleCourseSearchChange(uniData.id, e.target.value)}
                                                            />
                                                        </div>

                                                        {programmesByUni[uniData.id]?.length === 0 ? (
                                                            <div className="alert alert-warning">No eligible courses found for your subjects and APS.</div>
                                                        ) : (
                                                            [0, 1, 2].map(courseIdx => {
                                                                const availableProgrammes = programmesByUni[uniData.id] || [];
                                                                const searchTerm = courseSearch[uniData.id] || '';
                                                                const filtered = searchTerm
                                                                    ? availableProgrammes.filter(item =>
                                                                        item.programme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                                        item.programme.code.toLowerCase().includes(searchTerm.toLowerCase())
                                                                    )
                                                                    : availableProgrammes;

                                                                const grouped = {};
                                                                filtered.forEach(item => {
                                                                    if (!grouped[item.faculty]) grouped[item.faculty] = [];
                                                                    grouped[item.faculty].push(item.programme);
                                                                });

                                                                return (
                                                                    <div key={courseIdx} className="course-row">
                                                                        <label>Course {courseIdx + 1}</label>
                                                                        <select
                                                                            value={selectedData?.selectedCourses?.[courseIdx] || ''}
                                                                            onChange={(e) => handleCourseSelect(uniData.id, courseIdx, e.target.value)}
                                                                        >
                                                                            <option value="">– Select a course –</option>
                                                                            {Object.entries(grouped).map(([facName, progs]) => (
                                                                                <optgroup key={facName} label={facName}>
                                                                                    {progs.map(prog => (
                                                                                        <option key={prog.code} value={`${prog.name} (${prog.code})`}>
                                                                                            {prog.name} ({prog.code})
                                                                                        </option>
                                                                                    ))}
                                                                                </optgroup>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {errors.selectedInstitutions && (
                                    <div className="error-message">{errors.selectedInstitutions}</div>
                                )}

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
                                    <Button variant="primary" onClick={handleNext}>Next</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Documents - WITH REMOVE FUNCTIONALITY */}
                        {step === 5 && (
                            <div>
                                <h4 className="mb-4">Documents & Declaration</h4>

                                <Alert variant="info" className="mb-4">
                                    <strong>📄 Document Guidelines:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li>Accepted formats: PDF, JPG, PNG (Max 5MB per file)</li>
                                        <li>Ensure documents are clear and readable</li>
                                        <li>You can remove and replace files before proceeding</li>
                                    </ul>
                                </Alert>

                                {/* Applicant ID Copy */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">ID/Passport Copy <span className="text-danger">*</span></Form.Label>
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control
                                            type="file"
                                            name="applicantIdCopy"
                                            onChange={(e) => handleFileSelect(e, 'applicantIdCopy')}
                                            accept=".pdf,.jpg,.png"
                                            isInvalid={!!errors.applicantIdCopy}
                                            className="flex-grow-1"
                                        />
                                        {formData.documents.applicantIdCopy && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveDocument('applicantIdCopy')}
                                                title="Remove file"
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <FiTrash2 size={14} /> Remove
                                            </Button>
                                        )}
                                    </div>
                                    {formData.documents.applicantIdCopy ? (
                                        <Form.Text className="text-success d-block mt-1">
                                            ✓ File selected: {formData.documents.applicantIdCopy.name}
                                            ({(formData.documents.applicantIdCopy.size / 1024 / 1024).toFixed(2)} MB)
                                        </Form.Text>
                                    ) : (
                                        <Form.Text className="text-muted">
                                            Please upload a clear copy of your ID or passport
                                        </Form.Text>
                                    )}
                                    <Form.Control.Feedback type="invalid">{errors.applicantIdCopy}</Form.Control.Feedback>
                                </Form.Group>

                                {/* Grade 11/12 Results */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Grade 11/12 Results</Form.Label>
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control
                                            type="file"
                                            name="grade11_12Results"
                                            onChange={(e) => handleFileSelect(e, 'grade11_12Results')}
                                            accept=".pdf,.jpg,.png"
                                            className="flex-grow-1"
                                        />
                                        {formData.documents.grade11_12Results && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveDocument('grade11_12Results')}
                                                title="Remove file"
                                                className="d-flex align-items-center gap-1"
                                            >
                                                <FiTrash2 size={14} /> Remove
                                            </Button>
                                        )}
                                    </div>
                                    {formData.documents.grade11_12Results ? (
                                        <Form.Text className="text-success d-block mt-1">
                                            ✓ File selected: {formData.documents.grade11_12Results.name}
                                            ({(formData.documents.grade11_12Results.size / 1024 / 1024).toFixed(2)} MB)
                                        </Form.Text>
                                    ) : (
                                        <Form.Text className="text-muted">
                                            Upload your latest academic results (optional but recommended)
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Declaration */}
                                <Form.Group className="mt-4 p-3 bg-light rounded">
                                    <Form.Check
                                        type="checkbox"
                                        name="declaration"
                                        checked={formData.declaration}
                                        onChange={handleChange}
                                        label="I declare that all information provided is true and correct"
                                        isInvalid={!!errors.declaration}
                                        className="fw-semibold"
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.declaration}</Form.Control.Feedback>
                                    <Form.Text className="text-muted mt-2">
                                        By checking this box, you confirm that the information provided is accurate and complete.
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleNext}
                                        disabled={!formData.documents.applicantIdCopy}
                                    >
                                        Next
                                    </Button>
                                </div>

                                {!formData.documents.applicantIdCopy && (
                                    <Alert variant="warning" className="mt-3">
                                        <small>⚠️ ID/Passport Copy is required to proceed.</small>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Step 6: REVIEW */}
                        {step === 6 && (
                            <div className="review-step">
                                <h4 className="mb-4 fw-bold">Review Your Application</h4>
                                <p className="text-muted mb-4">Please verify all information before proceeding to payment.</p>

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
                                            <Col md={6}><strong>Full Names:</strong> {formData.guardianFullNames || '—'}</Col>
                                            <Col md={6}><strong>Surname:</strong> {formData.guardianSurname || '—'}</Col>
                                            <Col md={6}><strong>Initials:</strong> {formData.guardianInitials || '—'}</Col>
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
                                                <tr><th>Subject</th><th>Level</th><th>Percentage</th></tr> </thead>
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

                                {/* University Choices Card */}
                                <Card className="mb-4 shadow-sm border-0">
                                    <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                                        <h5 className="fw-bold text-primary">🏛️ University & Course Choices</h5>
                                    </Card.Header>
                                    <Card.Body className="pt-2">
                                        {formData.selectedInstitutions.length > 0 ? (
                                            formData.selectedInstitutions.map((inst, idx) => {
                                                const hasCourses = inst.selectedCourses?.some(c => c && c.trim() !== '');
                                                if (!hasCourses) return null;
                                                return (
                                                    <div key={idx} className="mb-3 p-3 bg-light rounded">
                                                        <h6 className="fw-bold text-dark">{inst.institutionName}</h6>
                                                        <Row className="mt-2">
                                                            <Col md={4}><strong>First Choice:</strong> {inst.selectedCourses?.[0] || '—'}</Col>
                                                            <Col md={4}><strong>Second Choice:</strong> {inst.selectedCourses?.[1] || '—'}</Col>
                                                            <Col md={4}><strong>Third Choice:</strong> {inst.selectedCourses?.[2] || '—'}</Col>
                                                        </Row>
                                                    </div>
                                                );
                                            })
                                        ) : <Alert variant="info">No universities selected.</Alert>}
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
                                                <strong>Grade 11/12 Results:</strong> {formData.documents.grade11_12Results ? formData.documents.grade11_12Results.name : 'Not uploaded'}
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

                                <div className="d-flex justify-content-between mt-5">
                                    <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
                                    <Button variant="primary" onClick={openProceedToPaymentModal}>
                                        Proceed to Payment
                                    </Button>
                                </div>
                            </div>
                            )}

                        {/* Step 7: PAYMENT - WITH PROOF OF PAYMENT REMOVE FUNCTIONALITY */}

                        {step === 7 && (
                            <div>
                                <h4 className="mb-4 text-center text-md-start">Complete Your Payment</h4>

                                {/* Fee Summary - Mobile Responsive */}
                                <div className="fee-summary-card mb-4 p-3 p-md-4 bg-light rounded shadow-sm">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                                        <div className="text-center text-md-start mb-3 mb-md-0">
                                            <small className="text-muted">Number of Universities</small>
                                            <h3 className="mb-0 fw-bold text-primary">{totalUniversities}</h3>
                                        </div>
                                        <div className="vr d-none d-md-block"></div>
                                        <div className="text-center text-md-start mb-3 mb-md-0">
                                            <small className="text-muted">Total Fee</small>
                                            <h2 className="mb-0 fw-bold text-success">R {applicationFee}</h2>
                                        </div>
                                        {totalUniversities >= 5 && (
                                            <>
                                                <div className="vr d-none d-md-block"></div>
                                                <div className="text-center text-md-start">
                                                    <Badge bg="success" className="px-3 py-2">
                                                        ✓ FREE NSFAS Application Included!
                                                    </Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Payment Options - Mobile Responsive Grid */}
                                <Row className="g-3 g-md-4">
                                    <Col xs={12} md={6}>
                                        <Card
                                            className={`payment-option-card h-100 ${paymentMethod === 'EFT' ? 'selected border-primary shadow-lg' : 'border'}`}
                                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                        >
                                            <Card.Body className="text-center p-3 p-md-4">
                                                <div className="mb-3">
                                                    <span className="display-4">🏦</span>
                                                </div>
                                                <h5 className="mb-2 mb-md-3">Pay via EFT / Bank Deposit</h5>
                                                <p className="text-muted small mb-3">Pay at any bank branch, ATM, or via internet banking</p>
                                                <ul className="text-start small mb-4 ps-3">
                                                    <li>Make payment using bank details</li>
                                                    <li>Upload proof of payment now or later within 48 hours</li>
                                                    <li>Verification within 24-48 hours after upload</li>
                                                </ul>

                                                {paymentMethod === 'EFT' ? (
                                                    <Badge bg="success" className="px-3 py-2 w-100 w-md-auto">
                                                        ✓ Selected Payment Method
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="lg"
                                                        onClick={() => handlePaymentMethodSelect('EFT')}
                                                        className="w-100 w-md-auto px-4"
                                                        style={{ borderRadius: '50px' }}
                                                    >
                                                        Select EFT Payment
                                                    </Button>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Card
                                            className="payment-option-card h-100 opacity-50 border"
                                            style={{ backgroundColor: '#f8f9fa' }}
                                        >
                                            <Card.Body className="text-center p-3 p-md-4">
                                                <div className="mb-3">
                                                    <span className="display-4">💳</span>
                                                </div>
                                                <h5 className="mb-2 mb-md-3">Pay Online (Coming Soon)</h5>
                                                <p className="text-muted small mb-3">Secure payment with credit/debit card</p>
                                                <ul className="text-start small mb-4 ps-3">
                                                    <li>Instant payment confirmation</li>
                                                    <li>Secure Stripe integration</li>
                                                    <li>Immediate application processing</li>
                                                </ul>
                                                <Button variant="outline-secondary" disabled className="w-100 w-md-auto px-4">
                                                    Coming Soon
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Proof of Payment Upload Section - Mobile Responsive */}
                                {paymentMethod === 'EFT' && (
                                    <div className="mt-4 animate__animated animate__fadeInUp">
                                        <Card className="shadow-lg border-primary">
                                            <Card.Header className="bg-primary text-white py-3">
                                                <h5 className="mb-0 text-center text-md-start">📎 Upload Proof of Payment</h5>
                                            </Card.Header>
                                            <Card.Body className="p-3 p-md-4">
                                                <Alert variant="info" className="mb-4">
                                                    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                                                        <div className="fs-1">⏰</div>
                                                        <div className="flex-grow-1 text-center text-md-start">
                                                            <strong>Important:</strong> You have <strong>48 hours</strong> to upload your proof of payment after submitting your application.
                                                            <br className="d-none d-md-block" />
                                                            <small>You can upload now or later from your dashboard.</small>
                                                        </div>
                                                    </div>
                                                </Alert>

                                                <h6 className="mb-3 fw-bold text-center text-md-start">🏦 Bank Details:</h6>
                                                <div className="bank-details p-3 p-md-4 bg-light rounded mb-4 border overflow-x-auto">
                                                    <Row className="g-3">
                                                        <Col xs={12} md={6}>
                                                            <p className="mb-2"><strong>Bank:</strong> Standard Bank</p>
                                                            <p className="mb-2"><strong>Account Name:</strong> OurMemories ApplicationOffice</p>
                                                            <p className="mb-0"><strong>Account Number:</strong> 123456789</p>
                                                        </Col>
                                                        <Col xs={12} md={6}>
                                                            <p className="mb-2"><strong>Branch Code:</strong> 052852</p>
                                                            <p className="mb-2"><strong>Reference:</strong> <code className="bg-dark text-white p-1 rounded">{user?.email}</code></p>
                                                            <p className="mb-0 text-muted small">Use your email as reference</p>
                                                        </Col>
                                                    </Row>
                                                </div>

                                                <Form.Group className="mb-4">
                                                    <Form.Label className="fw-bold">Upload Proof of Payment</Form.Label>
                                                    <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                                        <Form.Control
                                                            type="file"
                                                            accept=".pdf,.jpg,.png"
                                                            onChange={handleProofUpload}
                                                            disabled={paymentCompleted}
                                                            className="flex-grow-1"
                                                            isInvalid={!!errors.proofOfPayment}
                                                            style={{ fontSize: '14px' }}
                                                        />
                                                        {proofFile && !paymentCompleted && (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={handleRemoveProof}
                                                                title="Remove file"
                                                                className="d-flex align-items-center justify-content-center gap-1"
                                                            >
                                                                <FiTrash2 size={14} /> Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {proofFile && (
                                                        <Form.Text className="text-success d-block mt-2 text-center text-md-start">
                                                            ✓ File selected: {proofFile.name} ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                                                        </Form.Text>
                                                    )}
                                                    {!proofFile && !paymentCompleted && (
                                                        <Form.Text className="text-muted d-block mt-2 text-center text-md-start">
                                                            <small>Accepted formats: PDF, JPG, PNG (Max 5MB). You can skip this and upload later from your dashboard.</small>
                                                        </Form.Text>
                                                    )}
                                                    {errors.proofOfPayment && (
                                                        <Form.Text className="text-danger d-block mt-2 text-center text-md-start">
                                                            {errors.proofOfPayment}
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>

                                                {!paymentCompleted && (
                                                    <div className="d-flex justify-content-center justify-content-md-end mt-4">
                                                        <Button
                                                            variant="success"
                                                            size="lg"
                                                            onClick={handlePaymentInfoConfirm}
                                                            className="w-100 w-md-auto px-5"
                                                            style={{ borderRadius: '50px' }}
                                                        >
                                                            {proofFile ? 'Confirm & Continue' : 'Proceed Without Proof'}
                                                        </Button>
                                                    </div>
                                                )}

                                                {paymentCompleted && (
                                                    <Alert variant="success" className="mt-4 mb-0">
                                                        <div className="d-flex flex-column flex-md-row align-items-center gap-2">
                                                            <FiCheck size={24} />
                                                            <div className="text-center text-md-start">
                                                                <strong>Payment method confirmed!</strong><br />
                                                                You can now submit your application.
                                                            </div>
                                                        </div>
                                                    </Alert>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </div>
                                )}

                                {/* Navigation Buttons - Mobile Responsive */}
                                <div className="d-flex flex-column-reverse flex-md-row justify-content-between gap-3 mt-5">
                                    <Button
                                        variant="outline-secondary"
                                        size="lg"
                                        onClick={handlePrevious}
                                        className="px-4"
                                    >
                                        ← Previous
                                    </Button>
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={() => setShowConfirmModal(true)}
                                        disabled={loading || !paymentCompleted}
                                        className="px-5"
                                        style={{ borderRadius: '50px' }}
                                    >
                                        {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Submitting...</> : 'Submit Application →'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            {/* Proceed to Payment Confirmation Modal */}
            <Modal show={showProceedToPaymentModal} onHide={() => setShowProceedToPaymentModal(false)} centered>
                <Modal.Header closeButton className="bg-warning text-dark">
                    <Modal.Title>⚠️ Verify Your Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Please carefully review all your information before proceeding to payment.</p>
                    <ul>
                        <li>Ensure all personal details are correct</li>
                        <li>Verify your selected courses and institutions</li>
                        <li>Check that all required documents are uploaded</li>
                        <li>Confirm your declaration is accepted</li>
                    </ul>
                    <Alert variant="info">
                        <strong>Important:</strong> Once you proceed to payment, you will not be able to edit your application details. You can still upload proof of payment within 48 hours after submission.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowProceedToPaymentModal(false)}>
                        Go Back to Review
                    </Button>
                    <Button variant="primary" onClick={proceedToPayment}>
                        Yes, Proceed to Payment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* EFT Payment Information Modal */}
            <Modal show={showPaymentInfoModal} onHide={() => setShowPaymentInfoModal(false)} size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>🏦 EFT Payment Instructions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        <strong>⏰ Important:</strong> You have <strong>48 hours</strong> to upload your proof of payment after submitting your application. Your application will be saved and you can upload later.
                    </Alert>

                    <h6 className="mt-3">Bank Details:</h6>
                    <div className="bank-details p-3 bg-light rounded mb-3">
                        <p><strong>Bank:</strong> Standard Bank</p>
                        <p><strong>Account Name:</strong> OurMemories ApplicationOffice</p>
                        <p><strong>Account Number:</strong> 123456789</p>
                        <p><strong>Branch Code:</strong> 052852</p>
                        <p><strong>Reference:</strong> <code>{user?.email}</code> (Use your email as reference)</p>
                    </div>

                    <h6 className="mt-3">Payment Steps:</h6>
                    <ol>
                        <li>Make an EFT payment using the bank details above</li>
                        <li>Use your registered email address as payment reference</li>
                        <li>Save the proof of payment (screenshot or bank statement)</li>
                        <li>Upload the proof of payment using the form below (or later from your dashboard)</li>
                        <li>Wait for verification (24-48 hours)</li>
                    </ol>

                    <Form.Group className="mb-3">
                        <Form.Label>Upload Proof of Payment (Optional Now - Can Upload Later)</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Control
                                type="file"
                                accept=".pdf,.jpg,.png"
                                onChange={handleProofUpload}
                                className="flex-grow-1"
                            />
                            {proofFile && (
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleRemoveProof}
                                    title="Remove file"
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FiTrash2 size={14} /> Remove
                                </Button>
                            )}
                        </div>
                        <Form.Text className="text-muted">
                            Accepted formats: PDF, JPG, PNG (Max 5MB). You can skip this and upload later from your dashboard.
                        </Form.Text>
                        {proofFile && (
                            <Form.Text className="text-success d-block mt-1">
                                ✓ File selected: {proofFile.name} ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Form.Text>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentInfoModal(false)}>
                        Upload Later
                    </Button>
                    <Button variant="primary" onClick={handlePaymentInfoConfirm}>
                        Continue with Payment
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirmation Modal - For final submission */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Final Submission</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Payment Method: <strong>{paymentMethod === 'EFT' ? 'EFT / Bank Deposit' : 'Not Selected'}</strong></p>
                    <p>Application Fee: <strong>R {applicationFee}</strong></p>
                    {paymentMethod === 'EFT' && !proofFile && (
                        <Alert variant="warning" className="mt-2">
                            <strong>⚠️ No proof of payment uploaded.</strong><br />
                            You will need to upload your proof of payment within 48 hours from your dashboard.
                        </Alert>
                    )}
                    {paymentMethod === 'EFT' && proofFile && (
                        <Alert variant="success" className="mt-2">
                            <strong>✓ Proof of payment uploaded.</strong><br />
                            Our team will verify your payment within 24-48 hours.
                        </Alert>
                    )}
                    <p className="mt-3">Are you sure you want to submit your application?</p>
                    <p className="text-muted small">Once submitted, you cannot make changes to your application details.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitApplicationWithPayment} disabled={loading}>
                        {loading ? 'Submitting...' : 'Yes, Submit'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Success Modal - Enhanced */}
            <Modal show={showSuccessModal} onHide={() => { setShowSuccessModal(false); navigate('/application-portal'); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Application Submitted Successfully!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {paymentMethod === 'EFT' ? (
                        <>
                            <Alert variant="success">
                                <strong>✓ Your application has been submitted!</strong>
                            </Alert>
                            <p>Your application reference: <strong>#{applicationId}</strong></p>
                            <p>Please complete your payment within <strong>48 hours</strong> to avoid application cancellation.</p>

                            <h6 className="mt-3">Bank Details:</h6>
                            <div className="bank-details p-3 bg-light rounded mb-3">
                                <p><strong>Bank:</strong> Standard Bank</p>
                                <p><strong>Account Name:</strong> OurMemories ApplicationOffice</p>
                                <p><strong>Account Number:</strong> 123456789</p>
                                <p><strong>Branch Code:</strong> 052852</p>
                                <p><strong>Reference:</strong> <code>{user?.email}</code></p>
                            </div>

                            {!proofFile && (
                                <Alert variant="warning" className="mt-3">
                                    <strong>⚠️ No proof of payment uploaded!</strong><br />
                                    You must upload your proof of payment within 48 hours from your dashboard.
                                </Alert>
                            )}

                            {proofFile && (
                                <Alert variant="info" className="mt-3">
                                    <strong>📎 Proof uploaded successfully!</strong><br />
                                    Our team will verify your payment within 24-48 hours. You will receive an email once verified.
                                </Alert>
                            )}

                            <div className="mt-3">
                                <strong>Next Steps:</strong>
                                <ol className="mt-2">
                                    <li>Make the EFT payment using the bank details above</li>
                                    {!proofFile && <li>Upload your proof of payment from your dashboard</li>}
                                    <li>Wait for verification (24-48 hours)</li>
                                    <li>Check your email for verification confirmation</li>
                                </ol>
                            </div>
                        </>
                    ) : (
                        <Alert variant="success">
                            Your application has been submitted and payment confirmed successfully!
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => navigate('/application-portal')}>
                        Go to Dashboard
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UniversityApplication;
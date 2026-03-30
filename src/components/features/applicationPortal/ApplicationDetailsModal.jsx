// src/components/features/applicationPortal/ApplicationDetailsModal.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    Modal,
    Row,
    Col,
    Badge,
    Button,
    Alert,
    Spinner,
    Form,
    Table,
} from "react-bootstrap";
import {
    FiCheck,
    FiX,
    FiUser,
    FiMapPin,
    FiUpload,
    FiEdit2,
    FiSave,
    FiEye,
    FiBook,
    FiRefreshCw,
    FiDollarSign,
    FiClock,
    FiAlertCircle,
    FiDownload,
    FiFileText,
    FiTrash2,
    FiPlus,
    FiInfo,
    FiLock,
} from "react-icons/fi";
import axios from "axios";
import "./ApplicationDetailsModal.css";
import { getLevel, meetsAPS, meetsSubjects } from '../../../utils/eligibilityUtils';
import { subjectCategories } from "../coursesYouQualify/Subjects.js";
import { universities } from "./applicationForms/university-data/universities.js";
import { colleges, tvetCourses } from "./applicationForms/university-data/TVET-colleges.js";
import {APPLICATION_STATUS} from "../../../constants/applicationStatus.js";

const StatusTimeline = ({ currentStatus }) => {
    const statusFlow = ['PENDING_PAYMENT', 'PAYMENT_VERIFIED', 'UNDER_REVIEW', 'APPROVED'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const isRejected = currentStatus === 'REJECTED';
    const isCancelled = currentStatus === 'CANCELLED';

    if (isRejected) {
        return (
            <div className="status-timeline mb-4 p-3 bg-light rounded">
                <Alert variant="danger" className="mb-0">
                    <strong>Application Rejected</strong>
                    <p className="mb-0 mt-2">Unfortunately, your application was not successful.</p>
                </Alert>
            </div>
        );
    }

    if (isCancelled) {
        return (
            <div className="status-timeline mb-4 p-3 bg-light rounded">
                <Alert variant="secondary" className="mb-0">
                    <strong>Application Cancelled</strong>
                    <p className="mb-0 mt-2">This application has been cancelled. You can start a new application if desired.</p>
                </Alert>
            </div>
        );
    }

    return (
        <div className="status-timeline mb-4 p-3 bg-light rounded">
            <h6 className="mb-3 fw-bold">Application Progress</h6>
            <div className="d-flex justify-content-between align-items-center">
                {statusFlow.map((status, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const statusInfo = APPLICATION_STATUS[status];

                    return (
                        <div key={status} className="text-center" style={{ flex: 1 }}>
                            <div className={`step-circle mb-2 ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                {isCompleted ? '✓' : statusInfo.icon}
                            </div>
                            <small className={`d-block ${isCurrent ? 'fw-bold text-primary' : 'text-muted'}`}>
                                {statusInfo.label}
                            </small>
                        </div>
                    );
                })}
            </div>

            {/* Next Steps Section */}
            {APPLICATION_STATUS[currentStatus]?.nextSteps && (
                <div className="mt-3 pt-3 border-top">
                    <strong>Next Steps:</strong>
                    <ul className="mb-0 mt-2">
                        {APPLICATION_STATUS[currentStatus].nextSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const allUniversities = Array.isArray(universities) ? universities : [];
const allColleges = Array.isArray(colleges) ? colleges : [];
const allTvetCourses = Array.isArray(tvetCourses) ? tvetCourses : [];

const ApplicationDetailsModal = ({ show, onHide, application, onApplicationUpdated }) => {
    const [modalData, setModalData] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const fileInputRefs = useRef({});
    const [uploadingDocs, setUploadingDocs] = useState({});

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showDocSuccessModal, setShowDocSuccessModal] = useState(false);
    const [docSuccessMessage, setDocSuccessMessage] = useState('');
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showEditWarningModal, setShowEditWarningModal] = useState(false);
    const [originalSubjects, setOriginalSubjects] = useState(null);
    const [eligibilityWarnings, setEligibilityWarnings] = useState([]);
    const [showCancelInfoModal, setShowCancelInfoModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [refundInfo, setRefundInfo] = useState(null);

    // Determine if this is a University or TVET application
    const isUniversityApp = useMemo(() => {
        return modalData?.type?.toLowerCase().includes('university') ?? true;
    }, [modalData?.type]);

    // Check if user can edit the application
    const canEdit = useMemo(() => {
        if (!modalData) return false;

        // Cannot edit if status is APPROVED or REJECTED or CANCELLED
        const lockedStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];
        if (lockedStatuses.includes(modalData.status)) {
            return false;
        }

        // Cannot edit if payment is completed/verified
        const lockedPaymentStatuses = ['PAID', 'VERIFIED'];
        if (lockedPaymentStatuses.includes(modalData.paymentStatus)) {
            return false;
        }

        // Cannot edit if payment is awaiting verification (to prevent changes during verification)
        if (modalData.paymentStatus === 'AWAITING_VERIFICATION') {
            return false;
        }

        return true;
    }, [modalData]);

    // Check if user can cancel the application
    const canCancel = useMemo(() => {
        if (!modalData) return false;

        // Cannot cancel if already approved, rejected, or cancelled
        const noCancelStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];
        if (noCancelStatuses.includes(modalData.status)) {
            return false;
        }

        // Cannot cancel if payment is already verified/completed (needs refund process)
        if (modalData.paymentStatus === 'PAID' || modalData.paymentStatus === 'VERIFIED') {
            return false;
        }

        return true;
    }, [modalData]);

    // Check if refund is needed
    const needsRefund = useMemo(() => {
        if (!modalData) return false;
        return (modalData.paymentStatus === 'PAID' || modalData.paymentStatus === 'VERIFIED') &&
            modalData.status !== 'CANCELLED';
    }, [modalData]);

    // Get refund information
    const getRefundInfo = useMemo(() => {
        if (!modalData || !needsRefund) return null;

        return {
            amount: modalData.applicationFee,
            method: modalData.paymentMethod,
            reference: modalData.paymentReference,
            status: 'Pending Review',
            processTime: '3-5 business days',
            instructions: 'Please contact support to initiate refund process'
        };
    }, [modalData, needsRefund]);

    // Get cancellation restrictions message
    const getCancelRestrictionMessage = useMemo(() => {
        if (!modalData) return null;

        if (modalData.status === 'APPROVED') {
            return "This application has been approved and cannot be cancelled. Please contact support if you need assistance.";
        }
        if (modalData.status === 'REJECTED') {
            return "This application has already been rejected.";
        }
        if (modalData.status === 'CANCELLED') {
            return "This application has already been cancelled.";
        }
        if (modalData.paymentStatus === 'PAID' || modalData.paymentStatus === 'VERIFIED') {
            return "Payment has been completed. To cancel this application, you will need to request a refund. Please contact support for assistance.";
        }
        return null;
    }, [modalData]);

    // Get edit restriction message
    const getEditRestrictionMessage = useMemo(() => {
        if (!modalData) return null;

        if (modalData.status === 'APPROVED') {
            return "This application has been approved. Changes are no longer allowed.";
        }
        if (modalData.status === 'REJECTED') {
            return "This application has been rejected. Changes are no longer allowed.";
        }
        if (modalData.status === 'CANCELLED') {
            return "This application has been cancelled. Changes are no longer allowed.";
        }
        if (modalData.paymentStatus === 'PAID' || modalData.paymentStatus === 'VERIFIED') {
            return "Payment has been completed. To make changes, please contact support for assistance.";
        }
        if (modalData.paymentStatus === 'AWAITING_VERIFICATION') {
            return "Your payment is being verified. You cannot edit the application until verification is complete.";
        }
        return null;
    }, [modalData]);

    const institutionDataList = useMemo(() => {
        if (isUniversityApp) {
            return allUniversities;
        }
        return allColleges.map(name => ({ name, isTVET: true }));
    }, [isUniversityApp]);

    const getInstitutionData = (name) => {
        if (!institutionDataList) return null;
        return institutionDataList.find(inst => inst.name === name);
    };

    // Compute student subjects and APS
    const studentSubjects = useMemo(() => {
        if (!editData?.subjects) return [];
        return editData.subjects.filter(s => s.name && s.percentage);
    }, [editData]);

    const studentAPS = useMemo(() => {
        return studentSubjects.reduce((total, s) => total + getLevel(s.percentage), 0);
    }, [studentSubjects]);

    // Programmes with eligibility
    const programmesWithEligibility = useMemo(() => {
        const map = {};
        if (isUniversityApp) {
            institutionDataList.forEach(inst => {
                const progs = [];
                if (inst.faculties) {
                    inst.faculties.forEach(fac => {
                        if (fac.programmes) {
                            fac.programmes.forEach(prog => {
                                const apsOk = meetsAPS(prog.aps, studentAPS);
                                const subjectsOk = meetsSubjects(prog.requirements || [], studentSubjects);
                                progs.push({
                                    faculty: fac.name,
                                    programme: prog,
                                    eligible: apsOk && subjectsOk
                                });
                            });
                        }
                    });
                }
                map[inst.id] = progs;
            });
        } else {
            const progs = allTvetCourses.map(course => ({
                faculty: "TVET Programmes",
                programme: {
                    name: course,
                    code: course,
                    aps: null,
                    requirements: [],
                    notes: "",
                    campus: "",
                    closingDate: ""
                },
                eligible: true
            }));
            institutionDataList.forEach(inst => {
                map[inst.name] = progs;
            });
        }
        return map;
    }, [isUniversityApp, institutionDataList, studentAPS, studentSubjects]);

    const dropdownProgrammes = useMemo(() => {
        if (!institutionDataList) return {};
        if (isUniversityApp) {
            if (modalData?.educationStatus === 'completed') {
                return programmesWithEligibility;
            } else {
                const map = {};
                institutionDataList.forEach(inst => {
                    const progs = [];
                    if (inst.faculties) {
                        inst.faculties.forEach(fac => {
                            if (fac.programmes) {
                                fac.programmes.forEach(prog => {
                                    progs.push({
                                        faculty: fac.name,
                                        programme: prog,
                                        eligible: true
                                    });
                                });
                            }
                        });
                    }
                    map[inst.id] = progs;
                });
                return map;
            }
        }
        return programmesWithEligibility;
    }, [modalData?.educationStatus, programmesWithEligibility, institutionDataList, isUniversityApp]);

    // ==================== API calls ====================
    const fetchApplicationDetails = async (appId) => {
        setModalLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/applications/${appId}`,
                { withCredentials: true }
            );
            const normalized = (() => {
                if (response.data?.applicant) {
                    const val = response.data.applicant.isSouthAfrican !== undefined
                        ? response.data.applicant.isSouthAfrican
                        : response.data.applicant.southAfrican;
                    let boolVal = false;
                    if (typeof val === 'string') {
                        boolVal = val.toLowerCase() === 'yes' || val.toLowerCase() === 'true';
                    } else {
                        boolVal = Boolean(val);
                    }
                    response.data.applicant.isSouthAfrican = boolVal;
                }
                return response.data;
            })();
            setModalData(normalized);
            setEditData(JSON.parse(JSON.stringify(normalized)));
        } catch (err) {
            console.error("Error fetching application details:", err);
            setModalData(null);
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        if (show && application?.id) {
            fetchApplicationDetails(application.id);
        }
    }, [show, application?.id]);

    // ==================== Validation & Eligibility ====================
    const validateEditData = (data) => {
        const errors = {};
        if (data.applicant) {
            const app = data.applicant;
            if (!app.title) errors.applicantTitle = 'Required';
            if (!app.initials) errors.applicantInitials = 'Required';
            if (!app.fullNames) errors.applicantFullNames = 'Required';
            if (!app.lastName) errors.applicantLastName = 'Required';
            if (!app.dateOfBirth) errors.applicantDateOfBirth = 'Required';
            if (!app.gender) errors.applicantGender = 'Required';
            if (app.isSouthAfrican && !app.idNumber) errors.applicantIdNumber = 'ID number required';
            if (!app.isSouthAfrican && !app.passportNumber) errors.applicantPassportNumber = 'Passport number required';
            if (!app.physicalAddress) errors.applicantPhysicalAddress = 'Required';
            if (!app.physicalCity) errors.applicantPhysicalCity = 'Required';
            if (!app.physicalProvince) errors.applicantPhysicalProvince = 'Required';
            if (!app.email) errors.applicantEmail = 'Email required';
            if (!app.cellNumber) errors.applicantCellNumber = 'Cell number required';
        }
        if (data.guardian) {
            const guard = data.guardian;
            if (!guard.relationship) errors.guardianRelationship = 'Required';
            if (!guard.fullNames) errors.guardianFullNames = 'Required';
            if (!guard.cellNumber) errors.guardianCellNumber = 'Cell number required';
        }
        if (data.institutions) {
            data.institutions.forEach((inst, idx) => {
                if (!inst.firstCourse && !inst.secondCourse && !inst.thirdCourse) {
                    errors[`institution-${idx}`] = 'Select at least one course';
                }
            });
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const checkSelectedCourses = (data, warnOnly = true) => {
        if (!isUniversityApp) {
            setEligibilityWarnings([]);
            return false;
        }
        const warnings = [];
        let anyInvalid = false;
        (data.institutions || []).forEach((inst) => {
            const instData = getInstitutionData(inst.institutionName);
            if (!instData) return;
            const progsForInst = programmesWithEligibility[instData.id] || [];
            const courseFields = ['firstCourse', 'secondCourse', 'thirdCourse'];
            courseFields.forEach(field => {
                const selected = inst[field];
                if (!selected) return;
                const prog = progsForInst.find(p => `${p.programme.name} (${p.programme.code})` === selected);
                if (prog && !prog.eligible) {
                    anyInvalid = true;
                    warnings.push(`${inst.institutionName}: ${selected} is no longer eligible based on your subjects.`);
                    if (!warnOnly) inst[field] = '';
                }
            });
        });
        if (anyInvalid && warnOnly) setEligibilityWarnings(warnings);
        else setEligibilityWarnings([]);
        return anyInvalid;
    };

    // ==================== Edit Mode Handlers ====================
    const handleEditToggle = () => {
        if (!editMode) {
            if (!canEdit) {
                setErrorMessage(getEditRestrictionMessage || "This application cannot be edited.");
                setShowErrorModal(true);
                return;
            }
            setShowEditWarningModal(true);
        } else {
            setEditMode(false);
            setEligibilityWarnings([]);
            setOriginalSubjects(null);
        }
    };

    const confirmEnterEditMode = () => {
        setOriginalSubjects(JSON.parse(JSON.stringify(editData?.subjects || [])));
        setEditMode(true);
        setShowEditWarningModal(false);
        setEligibilityWarnings([]);
    };

    const handleInputChange = (section, field, value) => {
        setEditData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleCitizenshipChange = (value) => {
        setEditData(prev => ({
            ...prev,
            applicant: {
                ...prev.applicant,
                isSouthAfrican: value === 'Yes',
                idNumber: value === 'Yes' ? prev.applicant?.idNumber : '',
                passportNumber: value === 'No' ? prev.applicant?.passportNumber : ''
            }
        }));
    };

    const handleSubjectAdd = () => {
        setEditData(prev => ({
            ...prev,
            subjects: [...(prev.subjects || []), { name: '', level: '', percentage: '' }]
        }));
        setTimeout(() => checkSelectedCourses(editData, true), 0);
    };

    const handleSubjectRemove = (index) => {
        setEditData(prev => {
            const newSubjects = prev.subjects.filter((_, i) => i !== index);
            const newData = { ...prev, subjects: newSubjects };
            checkSelectedCourses(newData, true);
            return newData;
        });
    };

    const handleSubjectChange = (index, field, value) => {
        setEditData(prev => {
            const newSubjects = [...(prev.subjects || [])];
            newSubjects[index] = { ...newSubjects[index], [field]: value };
            const newData = { ...prev, subjects: newSubjects };
            setTimeout(() => checkSelectedCourses(newData, true), 0);
            return newData;
        });
    };

    const handleResetSubjects = () => {
        setEditData(prev => ({
            ...prev,
            subjects: JSON.parse(JSON.stringify(originalSubjects))
        }));
        setTimeout(() => checkSelectedCourses(editData, true), 0);
    };

    const handleInstitutionFieldChange = (index, field, value) => {
        const newInstitutions = [...(editData.institutions || [])];
        if (!newInstitutions[index]) {
            newInstitutions[index] = { institutionName: '', firstCourse: '', secondCourse: '', thirdCourse: '', institutionType: isUniversityApp ? 'University' : 'TVET College' };
        }
        newInstitutions[index][field] = value;
        if (field === 'institutionName') {
            newInstitutions[index].firstCourse = '';
            newInstitutions[index].secondCourse = '';
            newInstitutions[index].thirdCourse = '';
        }
        setEditData(prev => ({ ...prev, institutions: newInstitutions }));
    };

    const handleAddInstitution = () => {
        const newInstitution = {
            institutionName: '',
            firstCourse: '',
            secondCourse: '',
            thirdCourse: '',
            institutionType: isUniversityApp ? 'University' : 'TVET College'
        };
        setEditData(prev => ({
            ...prev,
            institutions: [...(prev.institutions || []), newInstitution]
        }));
    };

    const handleRemoveInstitution = (index) => {
        setEditData(prev => ({
            ...prev,
            institutions: prev.institutions.filter((_, i) => i !== index)
        }));
    };

    const handleCancelEdit = () => {
        setEditData(JSON.parse(JSON.stringify(modalData)));
        setEditMode(false);
        setOriginalSubjects(null);
        setEligibilityWarnings([]);
    };

    const handleSaveChanges = async () => {
        if (!validateEditData(editData)) {
            setErrorMessage('Please fix the validation errors before saving.');
            setShowErrorModal(true);
            return;
        }
        if (isUniversityApp) {
            const hasInvalid = checkSelectedCourses(editData, false);
            if (hasInvalid) {
                setEligibilityWarnings([]);
                setErrorMessage("Some of your course selections were no longer eligible based on your updated subjects. They have been cleared. Please review and re-select.");
                setShowErrorModal(true);
                setEditData({ ...editData });
                return;
            }
        }
        setSaving(true);
        try {
            const mapEditDataToRequest = (data) => {
                const applicant = data.applicant || {};
                const guardian = data.guardian || {};
                return {
                    id: data.id,
                    applicant: {
                        title: applicant.title,
                        initials: applicant.initials,
                        fullNames: applicant.fullNames,
                        lastName: applicant.lastName,
                        gender: applicant.gender,
                        dateOfBirth: applicant.dateOfBirth,
                        isSouthAfrican: applicant.isSouthAfrican,
                        idNumber: applicant.idNumber,
                        passportNumber: applicant.passportNumber,
                        countryOfResidence: applicant.countryOfResidence,
                        physicalAddress: applicant.physicalAddress,
                        physicalCity: applicant.physicalCity,
                        physicalProvince: applicant.physicalProvince,
                        physicalPostalCode: applicant.physicalPostalCode,
                        email: applicant.email,
                        cellNumber: applicant.cellNumber,
                        homeNumber: applicant.homeNumber,
                    },
                    guardian: {
                        relationship: guardian.relationship,
                        title: guardian.title,
                        fullNames: guardian.fullNames,
                        surname: guardian.surname,
                        initials: guardian.initials,
                        cellNumber: guardian.cellNumber,
                        email: guardian.email,
                    },
                    subjects: (data.subjects || []).map(s => ({
                        name: s.name,
                        level: s.level,
                        percentage: parseInt(s.percentage) || 0,
                    })),
                    educationStatus: data.educationStatus,
                    applicationType: data.type,
                    institutions: (data.institutions || []).map(inst => ({
                        institutionName: inst.institutionName,
                        institutionType: inst.institutionType || (isUniversityApp ? 'University' : 'TVET College'),
                        firstCourse: inst.firstCourse || '',
                        secondCourse: inst.secondCourse || '',
                        thirdCourse: inst.thirdCourse || '',
                    })),
                };
            };

            const requestData = mapEditDataToRequest(editData);
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/applications/${modalData.id}`,
                requestData,
                { withCredentials: true }
            );
            setModalData(editData);
            setEditMode(false);
            setOriginalSubjects(null);
            setEligibilityWarnings([]);
            setShowSuccessModal(true);
            if (onApplicationUpdated) onApplicationUpdated();
        } catch (err) {
            console.error("Error saving changes:", err);
            setErrorMessage("Failed to save changes. Please try again.");
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    // ==================== Cancel Application Handler ====================
    const handleCancelApplication = async () => {
        setCancelling(true);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/applications/${modalData.id}/cancel`,
                { reason: cancelReason },
                { withCredentials: true }
            );
            setShowCancelConfirm(false);
            setDocSuccessMessage("Application cancelled successfully");
            setShowDocSuccessModal(true);
            if (onApplicationUpdated) onApplicationUpdated();
            onHide();
        } catch (err) {
            console.error("Cancel failed:", err);
            setErrorMessage(err.response?.data?.message || "Failed to cancel application");
            setShowErrorModal(true);
        } finally {
            setCancelling(false);
        }
    };

    const openCancelConfirmation = () => {
        if (!canCancel) {
            setErrorMessage(getCancelRestrictionMessage || "This application cannot be cancelled.");
            setShowErrorModal(true);
            return;
        }
        setCancelReason('');
        setShowCancelConfirm(true);
    };

    // ==================== Document Handlers ====================
    const handleViewDocument = async (docId, fileName) => {
        setPreviewLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/document/${docId}/view`,
                { responseType: "blob", withCredentials: true }
            );
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers["content-type"] }));
            setPreviewDocument({ url, fileName: fileName || 'document' });
            setShowDocumentPreview(true);
        } catch (err) {
            console.error("View failed:", err);
            setErrorMessage("Failed to open document");
            setShowErrorModal(true);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleReplaceClick = (docId) => {
        const input = fileInputRefs.current[docId];
        if (input) input.click();
    };

    const handleFileChangeForDoc = async (docId, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingDocs((s) => ({ ...s, [docId]: true }));
        try {
            const form = new FormData();
            form.append("file", file);
            const resp = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/user/document/${docId}/replace`,
                form,
                { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
            );
            const updated = resp.data?.document || resp.data;
            if (updated) {
                setModalData(prev => ({
                    ...prev,
                    documents: prev.documents.map(d => d.id === docId ? { ...d, ...updated } : d)
                }));
            } else {
                setModalData(prev => ({
                    ...prev,
                    documents: prev.documents.map(d => d.id === docId ? { ...d, fileName: file.name } : d)
                }));
            }
            setDocSuccessMessage("Document updated successfully");
            setShowDocSuccessModal(true);
        } catch (err) {
            console.error("Replace failed:", err);
            setErrorMessage("Failed to update document");
            setShowErrorModal(true);
        } finally {
            setUploadingDocs((s) => ({ ...s, [docId]: false }));
            if (fileInputRefs.current[docId]) fileInputRefs.current[docId].value = "";
        }
    };

    const handleDocSuccessClose = () => {
        setShowDocSuccessModal(false);
        onHide();
    };

    const handlePreviewClose = () => {
        if (previewDocument?.url) URL.revokeObjectURL(previewDocument.url);
        setShowDocumentPreview(false);
        setPreviewDocument(null);
    };

    // Helper functions
    const getPercentageRange = (p) => {
        if (p >= 80) return '80-100% (Level 7)';
        if (p >= 70) return '70-79% (Level 6)';
        if (p >= 60) return '60-69% (Level 5)';
        if (p >= 50) return '50-59% (Level 4)';
        if (p >= 40) return '40-49% (Level 3)';
        if (p >= 30) return '30-39% (Level 2)';
        return '0-29% (Level 1)';
    };

    const getStatusBadge = (status) => {
        if (!status) return null;
        if (status === "APPROVED") return <Badge bg="success" className="fs-6 px-4 py-2"><FiCheck className="me-2" size={16} />APPROVED</Badge>;
        if (status === "REJECTED") return <Badge bg="danger" className="fs-6 px-4 py-2"><FiX className="me-2" size={16} />REJECTED</Badge>;
        if (status === "PROCESSING") return <Badge bg="info" className="fs-6 px-4 py-2">📋 PROCESSING</Badge>;
        if (status === "CANCELLED") return <Badge bg="secondary" className="fs-6 px-4 py-2">✗ CANCELLED</Badge>;
        return <Badge bg="warning" className="fs-6 px-4 py-2">📋 PENDING</Badge>;
    };

    const getPaymentStatusBadge = (paymentStatus) => {
        if (!paymentStatus) return null;
        switch (paymentStatus) {
            case "PAID":
            case "VERIFIED":
                return <Badge bg="success" className="fs-6 px-4 py-2">✓ Payment Verified</Badge>;
            case "PENDING":
                return <Badge bg="warning" className="fs-6 px-4 py-2">⏳ Pending Payment</Badge>;
            case "AWAITING_VERIFICATION":
                return <Badge bg="info" className="fs-6 px-4 py-2">📎 Awaiting Verification</Badge>;
            case "REJECTED":
                return <Badge bg="danger" className="fs-6 px-4 py-2">✗ Payment Rejected</Badge>;
            default:
                return null;
        }
    };

    if (modalLoading) {
        return (
            <Modal show={show} onHide={onHide} centered>
                <Modal.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </Modal.Body>
            </Modal>
        );
    }

    if (!modalData && !modalLoading) return null;

    return (
        <>
            {/* Edit Warning Modal */}
            <Modal show={showEditWarningModal} onHide={() => setShowEditWarningModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Application</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Changing your subject marks may affect which courses you are eligible for. If a course you previously selected becomes ineligible, it will be cleared and you will need to select a new course.</p>
                    <p>Do you want to continue?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditWarningModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={confirmEnterEditMode}>Continue to Edit</Button>
                </Modal.Footer>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Application</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning" className="mb-3">
                        <FiAlertCircle className="me-2" size={18} />
                        <strong>Important:</strong> Cancelling your application cannot be undone.
                    </Alert>
                    <Form.Group className="mb-3">
                        <Form.Label>Reason for cancellation (optional):</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please tell us why you're cancelling..."
                        />
                    </Form.Group>
                    <p className="text-muted small mb-0">You can reapply at any time by starting a new application.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>No, Keep</Button>
                    <Button variant="danger" onClick={handleCancelApplication} disabled={cancelling}>
                        {cancelling ? 'Cancelling...' : 'Yes, Cancel Application'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Main Application Modal */}
            <Modal show={show} onHide={onHide} size="xl" scrollable centered className="modal-professional">
                <Modal.Header className="modal-header-pro header-bg" closeButton>
                    <div className="w-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <Modal.Title className="fw-bold">Application Details</Modal.Title>
                                <small className="text-white-50">ID: #{modalData.id}</small>
                            </div>
                            <div className="d-flex gap-2">
                                {!editMode && canEdit && (
                                    <Button variant="outline-light" size="sm" onClick={handleEditToggle} className="d-flex align-items-center gap-2">
                                        <FiEdit2 size={16} /> Edit
                                    </Button>
                                )}
                                {!editMode && canCancel && modalData.status !== 'CANCELLED' && modalData.status !== 'APPROVED' && (
                                    <Button variant="outline-danger" size="sm" onClick={openCancelConfirmation} className="d-flex align-items-center gap-2">
                                        <FiX size={16} /> Cancel
                                    </Button>
                                )}
                                {!canEdit && getEditRestrictionMessage && (
                                    <Button variant="outline-secondary" size="sm" disabled className="d-flex align-items-center gap-2">
                                        <FiLock size={16} /> Editing Disabled
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal.Header>

                <Modal.Body className="modal-body-pro">
                    {/* Edit Restriction Banner */}
                    {!canEdit && getEditRestrictionMessage && (
                        <Alert variant="warning" className="mb-4">
                            <div className="d-flex align-items-center">
                                <FiLock className="me-2" size={18} />
                                <span>{getEditRestrictionMessage}</span>
                            </div>
                        </Alert>
                    )}

                    {/* Status Banner */}
                    <div className="status-banner text-center mb-4 p-4 rounded-lg bg-white">
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                            {getStatusBadge(modalData.status)}
                            {getPaymentStatusBadge(modalData.paymentStatus)}
                        </div>
                        <p className="mt-3 mb-0">
                            <strong>Type:</strong> <span className="fw-semibold text-primary ms-2">{modalData.type || "N/A"}</span>
                            <span className="mx-3">|</span>
                            <strong>Submitted:</strong> <span className="fw-semibold ms-2">{modalData.submittedDate ? new Date(modalData.submittedDate).toLocaleString() : "N/A"}</span>
                        </p>
                    </div>

                    {/* Eligibility Warnings */}
                    {isUniversityApp && eligibilityWarnings.length > 0 && (
                        <Alert variant="warning" className="mb-4">
                            <strong>⚠️ Note:</strong> Changes to your subjects have made some of your previously selected courses ineligible.
                            <ul className="mb-0 mt-2">{eligibilityWarnings.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
                        </Alert>
                    )}

                    {/* ================== PAYMENT INFORMATION ================== */}
                    {(modalData.applicationFee > 0 || modalData.paymentStatus) && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 section-card" style={{ borderLeft: "4px solid #10b981" }}>
                            <div className="d-flex align-items-center mb-3">
                                <FiDollarSign className="me-2" size={24} style={{ color: "#10b981" }} />
                                <h5 className="mb-0 fw-bold">Payment Information</h5>
                            </div>
                            <Row className="g-3">
                                <Col md={4}>
                                    <small className="text-muted">Application Fee</small>
                                    <div className="fw-semibold fs-5 text-primary">
                                        R {modalData.applicationFee}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <small className="text-muted">Payment Method</small>
                                    <div className="fw-semibold">
                                        {modalData.paymentMethod === 'EFT' ? '🏦 EFT / Bank Deposit' :
                                            modalData.paymentMethod === 'ONLINE' ? '💳 Online Payment' : '—'}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <small className="text-muted">Payment Status</small>
                                    <div className="fw-semibold">
                                        {getPaymentStatusBadge(modalData.payment.status)}
                                    </div>
                                </Col>
                            </Row>
                            {modalData.paymentReference && (
                                <Row className="mt-2">
                                    <Col md={12}>
                                        <small className="text-muted">Payment Reference</small>
                                        <div className="fw-semibold"><code>{modalData.paymentReference}</code></div>
                                    </Col>
                                </Row>
                            )}
                            {modalData.paymentStatus === 'AWAITING_VERIFICATION' && (
                                <Alert variant="info" className="mt-3 mb-0">
                                    <strong>📎 Proof of payment uploaded!</strong><br />
                                    Your payment is being verified by our team. This usually takes 24-48 hours.
                                </Alert>
                            )}
                            {modalData.paymentStatus === 'PENDING' && modalData.paymentMethod === 'EFT' && (
                                <Alert variant="warning" className="mt-3 mb-0">
                                    <strong>⏰ Payment pending!</strong><br />
                                    Please complete your EFT payment within 48 hours. Upload proof of payment from your dashboard.
                                </Alert>
                            )}
                            {(modalData.paymentStatus === 'PAID' || modalData.paymentStatus === 'VERIFIED') && (
                                <Alert variant="success" className="mt-3 mb-0">
                                    <strong>✓ Payment confirmed!</strong><br />
                                    Your payment has been successfully verified. Your application is now being processed.
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* ================== APPLICANT INFORMATION ================== */}
                    {modalData.applicant && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 section-card" style={{ borderLeft: `4px solid ${canEdit ? '#3b82f6' : '#94a3b8'}` }}>
                            <div className="d-flex align-items-center mb-4">
                                <FiUser className="me-3" size={28} style={{ color: canEdit ? "#3b82f6" : "#94a3b8" }} />
                                <div>
                                    <h5 className="mb-0 fw-bold">Learner / Applicant Information</h5>
                                    <small>Personal details and contact information</small>
                                </div>
                            </div>
                            {editMode && canEdit ? (
                                <Form>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Personal Information</h6>
                                        <Row className="g-3">
                                            <Col md={6}><Form.Group><Form.Label>Title *</Form.Label><Form.Control type="text" value={editData.applicant?.title || ""} onChange={e => handleInputChange("applicant", "title", e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Initials *</Form.Label><Form.Control type="text" value={editData.applicant?.initials || ""} onChange={e => handleInputChange("applicant", "initials", e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Full Names *</Form.Label><Form.Control type="text" value={editData.applicant?.fullNames || ""} onChange={e => handleInputChange("applicant", "fullNames", e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Surname *</Form.Label><Form.Control type="text" value={editData.applicant?.lastName || ""} onChange={e => handleInputChange("applicant", "lastName", e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Gender *</Form.Label><Form.Select value={editData.applicant?.gender || ""} onChange={e => handleInputChange("applicant", "gender", e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option></Form.Select></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Date of Birth *</Form.Label><Form.Control type="date" value={editData.applicant?.dateOfBirth || ""} onChange={e => handleInputChange("applicant", "dateOfBirth", e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </div>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Citizenship & Identification</h6>
                                        <Row className="g-3">
                                            <Col md={6}><Form.Group><Form.Label>South African Citizen? *</Form.Label><Form.Select value={editData.applicant?.isSouthAfrican ? 'Yes' : 'No'} onChange={e => handleCitizenshipChange(e.target.value)}><option value="Yes">Yes</option><option value="No">No</option></Form.Select></Form.Group></Col>
                                            {editData.applicant?.isSouthAfrican ? (
                                                <Col md={6}><Form.Group><Form.Label>ID Number *</Form.Label><Form.Control type="text" value={editData.applicant?.idNumber || ""} onChange={e => handleInputChange("applicant", "idNumber", e.target.value)} /></Form.Group></Col>
                                            ) : (
                                                <Col md={6}><Form.Group><Form.Label>Passport Number *</Form.Label><Form.Control type="text" value={editData.applicant?.passportNumber || ""} onChange={e => handleInputChange("applicant", "passportNumber", e.target.value)} /></Form.Group></Col>
                                            )}
                                        </Row>
                                    </div>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Contact Information</h6>
                                        <Row className="g-3">
                                            <Col md={6}><Form.Group><Form.Label>Email *</Form.Label><Form.Control type="email" value={editData.applicant?.email || ""} onChange={e => handleInputChange("applicant", "email", e.target.value)} /></Form.Group></Col>
                                            <Col md={6}><Form.Group><Form.Label>Cell Number *</Form.Label><Form.Control type="text" value={editData.applicant?.cellNumber || ""} onChange={e => handleInputChange("applicant", "cellNumber", e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-3">Address Information</h6>
                                        <Row className="g-3">
                                            <Col md={12}><Form.Group><Form.Label>Physical Address *</Form.Label><Form.Control type="text" value={editData.applicant?.physicalAddress || ""} onChange={e => handleInputChange("applicant", "physicalAddress", e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group><Form.Label>City *</Form.Label><Form.Control type="text" value={editData.applicant?.physicalCity || ""} onChange={e => handleInputChange("applicant", "physicalCity", e.target.value)} /></Form.Group></Col>
                                            <Col md={4}><Form.Group><Form.Label>Province *</Form.Label><Form.Select value={editData.applicant?.physicalProvince || ""} onChange={e => handleInputChange("applicant", "physicalProvince", e.target.value)}><option value="">Select</option><option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option><option>Eastern Cape</option><option>Free State</option><option>Limpopo</option><option>Mpumalanga</option><option>Northern Cape</option><option>North West</option></Form.Select></Form.Group></Col>
                                            <Col md={4}><Form.Group><Form.Label>Postal Code</Form.Label><Form.Control type="text" value={editData.applicant?.physicalPostalCode || ""} onChange={e => handleInputChange("applicant", "physicalPostalCode", e.target.value)} /></Form.Group></Col>
                                        </Row>
                                    </div>
                                </Form>
                            ) : (
                                <>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Personal Information</h6>
                                        <Row className="g-3">
                                            <Col md={6}><small className="text-muted">Title</small><div className="fw-semibold">{modalData.applicant?.title || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Initials</small><div className="fw-semibold">{modalData.applicant?.initials || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Full Names</small><div className="fw-semibold">{modalData.applicant?.fullNames || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Surname</small><div className="fw-semibold">{modalData.applicant?.lastName || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Gender</small><div className="fw-semibold">{modalData.applicant?.gender || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Date of Birth</small><div className="fw-semibold">{modalData.applicant?.dateOfBirth || "—"}</div></Col>
                                        </Row>
                                    </div>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Identification</h6>
                                        <Row className="g-3">
                                            <Col md={6}><small className="text-muted">South African Citizen</small><div className="fw-semibold">{modalData.applicant?.isSouthAfrican ? "Yes" : "No"}</div></Col>
                                            <Col md={6}><small className="text-muted">ID Number</small><div className="fw-semibold">{modalData.applicant?.idNumber || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Passport Number</small><div className="fw-semibold">{modalData.applicant?.passportNumber || "—"}</div></Col>
                                        </Row>
                                    </div>
                                    <div className="mb-4 pb-4 border-bottom">
                                        <h6 className="fw-bold mb-3">Contact Information</h6>
                                        <Row className="g-3">
                                            <Col md={6}><small className="text-muted">Email</small><div className="fw-semibold">{modalData.applicant?.email || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Cell Number</small><div className="fw-semibold">{modalData.applicant?.cellNumber || "—"}</div></Col>
                                            <Col md={6}><small className="text-muted">Home Number</small><div className="fw-semibold">{modalData.applicant?.homeNumber || "—"}</div></Col>
                                        </Row>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold mb-3">Address Information</h6>
                                        <Row className="g-3">
                                            <Col md={12}><small className="text-muted">Physical Address</small><div className="fw-semibold">{modalData.applicant?.physicalAddress || "—"}</div></Col>
                                            <Col md={4}><small className="text-muted">City</small><div className="fw-semibold">{modalData.applicant?.physicalCity || "—"}</div></Col>
                                            <Col md={4}><small className="text-muted">Province</small><div className="fw-semibold">{modalData.applicant?.physicalProvince || "—"}</div></Col>
                                            <Col md={4}><small className="text-muted">Postal Code</small><div className="fw-semibold">{modalData.applicant?.physicalPostalCode || "—"}</div></Col>
                                        </Row>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ================== GUARDIAN INFORMATION ================== */}
                    {modalData.guardian && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 section-card" style={{ borderLeft: `4px solid ${canEdit ? '#10b981' : '#94a3b8'}` }}>
                            <div className="d-flex align-items-center mb-3">
                                <FiUser className="me-2" size={24} style={{ color: canEdit ? "#10b981" : "#94a3b8" }} />
                                <h5 className="mb-0 fw-bold">Guardian / Parent Information</h5>
                            </div>
                            {editMode && canEdit ? (
                                <Form>
                                    <Row className="g-3">
                                        <Col md={6}><Form.Group><Form.Label>Relationship *</Form.Label><Form.Control type="text" value={editData.guardian?.relationship || ""} onChange={e => handleInputChange("guardian", "relationship", e.target.value)} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Title</Form.Label><Form.Control type="text" value={editData.guardian?.title || ""} onChange={e => handleInputChange("guardian", "title", e.target.value)} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Full Names *</Form.Label><Form.Control type="text" value={editData.guardian?.fullNames || ""} onChange={e => handleInputChange("guardian", "fullNames", e.target.value)} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Surname</Form.Label><Form.Control type="text" value={editData.guardian?.surname || ""} onChange={e => handleInputChange("guardian", "surname", e.target.value)} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Initials</Form.Label><Form.Control type="text" value={editData.guardian?.initials || ""} onChange={e => handleInputChange("guardian", "initials", e.target.value)} /></Form.Group></Col>
                                        <Col md={6}><Form.Group><Form.Label>Cell Number *</Form.Label><Form.Control type="text" value={editData.guardian?.cellNumber || ""} onChange={e => handleInputChange("guardian", "cellNumber", e.target.value)} /></Form.Group></Col>
                                        <Col md={12}><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={editData.guardian?.email || ""} onChange={e => handleInputChange("guardian", "email", e.target.value)} /></Form.Group></Col>
                                    </Row>
                                </Form>
                            ) : (
                                <Row className="g-3">
                                    <Col md={6}><small className="text-muted">Relationship</small><div className="fw-semibold">{modalData.guardian?.relationship || "—"}</div></Col>
                                    <Col md={6}><small className="text-muted">Title</small><div className="fw-semibold">{modalData.guardian?.title || "—"}</div></Col>
                                    <Col md={6}><small className="text-muted">Full Names</small><div className="fw-semibold">{modalData.guardian?.fullNames || "—"}</div></Col>
                                    <Col md={6}><small className="text-muted">Surname</small><div className="fw-semibold">{modalData.guardian?.surname || "—"}</div></Col>
                                    <Col md={6}><small className="text-muted">Initials</small><div className="fw-semibold">{modalData.guardian?.initials || "—"}</div></Col>
                                    <Col md={6}><small className="text-muted">Cell Number</small><div className="fw-semibold">{modalData.guardian?.cellNumber || "—"}</div></Col>
                                    <Col md={12}><small className="text-muted">Email</small><div className="fw-semibold">{modalData.guardian?.email || "—"}</div></Col>
                                </Row>
                            )}
                        </div>
                    )}

                    {/* ================== SUBJECTS ================== */}
                    {modalData.subjects && modalData.subjects.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 section-card" style={{ borderLeft: `4px solid ${canEdit ? '#8b5cf6' : '#94a3b8'}` }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center">
                                    <FiBook className="me-2" size={24} style={{ color: canEdit ? "#8b5cf6" : "#94a3b8" }} />
                                    <h5 className="mb-0 fw-bold">Subjects & Academic Performance</h5>
                                </div>
                                {editMode && canEdit && originalSubjects && (
                                    <Button variant="outline-secondary" size="sm" onClick={handleResetSubjects}>
                                        <FiRefreshCw className="me-1" /> Reset to original
                                    </Button>
                                )}
                            </div>
                            <Row className="mb-3">
                                <Col md={6}><small className="text-muted">Education status</small><div className="fw-semibold">{modalData.educationStatus || "—"}</div></Col>
                            </Row>
                            {editMode && canEdit ? (
                                <div className="mt-3">
                                    {(editData.subjects || []).map((subject, idx) => (
                                        <div key={idx} className="subject-row-container mb-4 pb-3 border-bottom">
                                            <Row className="align-items-end">
                                                <Col md={5}>
                                                    <Form.Group><Form.Label>Subject *</Form.Label>
                                                        <Form.Select value={subject.name || ""} onChange={e => handleSubjectChange(idx, 'name', e.target.value)}>
                                                            <option value="">Select</option>
                                                            {subjectCategories.map(cat => (
                                                                <optgroup key={cat.category} label={cat.category}>
                                                                    {cat.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </optgroup>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group><Form.Label>Level</Form.Label>
                                                        <Form.Select value={subject.level || ""} onChange={e => handleSubjectChange(idx, 'level', e.target.value)}>
                                                            <option value="">Select</option>
                                                            <option>HL</option>
                                                            <option>SL</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Group><Form.Label>% *</Form.Label>
                                                        <Form.Select value={subject.percentage || ""} onChange={e => handleSubjectChange(idx, 'percentage', e.target.value)}>
                                                            <option value="">Select %</option>
                                                            <option value="95">80-100% (Level 7)</option>
                                                            <option value="75">70-79% (Level 6)</option>
                                                            <option value="65">60-69% (Level 5)</option>
                                                            <option value="55">50-59% (Level 4)</option>
                                                            <option value="45">40-49% (Level 3)</option>
                                                            <option value="35">30-39% (Level 2)</option>
                                                            <option value="15">0-29% (Level 1)</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2} className="text-end">
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleSubjectRemove(idx)} disabled={(editData.subjects?.length || 0) === 1}>Remove</Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    ))}
                                    <Button variant="outline-primary" size="sm" onClick={handleSubjectAdd}>+ Add Subject</Button>
                                </div>
                            ) : (
                                <div className="table-responsive mt-3">
                                    <Table striped bordered hover size="sm">
                                        <thead className="table-light">
                                        <tr><th>Subject</th><th>Level</th><th>Percentage</th></tr>
                                        </thead>
                                        <tbody>
                                        {modalData.subjects.map((sub, idx) => (
                                            <tr key={sub.id || idx}>
                                                <td>{sub.name || "—"}</td>
                                                <td>{sub.level || "—"}</td>
                                                <td><Badge bg={parseInt(sub.percentage || "0") >= 50 ? "success" : "warning"}>{sub.percentage ? getPercentageRange(sub.percentage) : "—"}</Badge></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ================== INSTITUTIONS ================== */}
                    {(modalData.institutions?.length > 0 || editMode) && (
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 section-card" style={{ borderLeft: `4px solid ${canEdit ? '#f59e0b' : '#94a3b8'}` }}>
                            <div className="d-flex align-items-center mb-3">
                                <FiMapPin className="me-2" size={24} style={{ color: canEdit ? "#f59e0b" : "#94a3b8" }} />
                                <h5 className="mb-0 fw-bold">{isUniversityApp ? "University(s) & Course Preferences" : "TVET College(s) & Course Preferences"}</h5>
                            </div>
                            {isUniversityApp && modalData?.educationStatus === 'completed' && Object.values(programmesWithEligibility).some(progs => progs.some(p => !p.eligible)) && (
                                <Alert variant="warning" className="mb-3">
                                    <strong>Note:</strong> Some courses may not meet your current subject requirements. Ineligible courses are shown as disabled with "(Not Eligible)".
                                </Alert>
                            )}
                            {(editMode && canEdit ? editData.institutions || [] : modalData.institutions || []).map((inst, idx) => {
                                const instData = getInstitutionData(inst.institutionName);
                                const progsForInst = instData ? dropdownProgrammes[instData.id || instData.name] || [] : [];
                                const grouped = {};
                                progsForInst.forEach(p => {
                                    if (!grouped[p.faculty]) grouped[p.faculty] = [];
                                    grouped[p.faculty].push(p);
                                });
                                const selectedInstNames = (editMode && canEdit ? editData.institutions : modalData.institutions)
                                    .filter((_, i) => i !== idx)
                                    .map(i => i.institutionName).filter(Boolean);
                                const availableInstNames = institutionDataList
                                    .map(i => i.name)
                                    .filter(n => !selectedInstNames.includes(n)).sort();
                                return (
                                    <div key={inst.id || idx} className="p-3 mb-3 border rounded bg-light position-relative">
                                        {editMode && canEdit && (
                                            <Button variant="outline-danger" size="sm" className="position-absolute top-0 end-0 m-2"
                                                    onClick={() => handleRemoveInstitution(idx)} disabled={(editData.institutions?.length || 0) === 1}>×</Button>
                                        )}
                                        {editMode && canEdit ? (
                                            <>
                                                <Row className="g-3">
                                                    <Col md={12}>
                                                        <Form.Group><Form.Label>Institution *</Form.Label>
                                                            <Form.Select value={inst.institutionName || ""} onChange={e => handleInstitutionFieldChange(idx, "institutionName", e.target.value)}>
                                                                <option value="">Select {isUniversityApp ? "University" : "College"}</option>
                                                                {availableInstNames.map(name => <option key={name} value={name}>{name}</option>)}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group><Form.Label>First Choice</Form.Label>
                                                            <Form.Select value={inst.firstCourse || ""} onChange={e => handleInstitutionFieldChange(idx, "firstCourse", e.target.value)}>
                                                                <option value="">Select</option>
                                                                {Object.entries(grouped).map(([facName, progs]) => (
                                                                    <optgroup key={facName} label={facName}>
                                                                        {progs.map(p => (
                                                                            <option key={p.programme.code} value={`${p.programme.name} (${p.programme.code})`} disabled={isUniversityApp ? !p.eligible : false}>
                                                                                {p.programme.name} ({p.programme.code}){isUniversityApp && !p.eligible && " (Not Eligible)"}
                                                                            </option>
                                                                        ))}
                                                                    </optgroup>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group><Form.Label>Second Choice</Form.Label>
                                                            <Form.Select value={inst.secondCourse || ""} onChange={e => handleInstitutionFieldChange(idx, "secondCourse", e.target.value)}>
                                                                <option value="">Select</option>
                                                                {Object.entries(grouped).map(([facName, progs]) => (
                                                                    <optgroup key={facName} label={facName}>
                                                                        {progs.map(p => (
                                                                            <option key={p.programme.code} value={`${p.programme.name} (${p.programme.code})`} disabled={isUniversityApp ? !p.eligible : false}>
                                                                                {p.programme.name} ({p.programme.code}){isUniversityApp && !p.eligible && " (Not Eligible)"}
                                                                            </option>
                                                                        ))}
                                                                    </optgroup>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group><Form.Label>Third Choice</Form.Label>
                                                            <Form.Select value={inst.thirdCourse || ""} onChange={e => handleInstitutionFieldChange(idx, "thirdCourse", e.target.value)}>
                                                                <option value="">Select</option>
                                                                {Object.entries(grouped).map(([facName, progs]) => (
                                                                    <optgroup key={facName} label={facName}>
                                                                        {progs.map(p => (
                                                                            <option key={p.programme.code} value={`${p.programme.name} (${p.programme.code})`} disabled={isUniversityApp ? !p.eligible : false}>
                                                                                {p.programme.name} ({p.programme.code}){isUniversityApp && !p.eligible && " (Not Eligible)"}
                                                                            </option>
                                                                        ))}
                                                                    </optgroup>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                {validationErrors[`institution-${idx}`] && <Alert variant="danger" className="mt-2 mb-0 small py-2">{validationErrors[`institution-${idx}`]}</Alert>}
                                            </>
                                        ) : (
                                            <Row className="g-3">
                                                <Col md={6}><small className="text-muted">Institution</small><div className="fw-semibold">{inst.institutionName || "—"}</div></Col>
                                                <Col md={6}><small className="text-muted">First Choice</small><div className="fw-semibold">{inst.firstCourse || "—"}</div></Col>
                                                <Col md={6}><small className="text-muted">Second Choice</small><div className="fw-semibold">{inst.secondCourse || "—"}</div></Col>
                                                <Col md={6}><small className="text-muted">Third Choice</small><div className="fw-semibold">{inst.thirdCourse || "—"}</div></Col>
                                            </Row>
                                        )}
                                    </div>
                                );
                            })}
                            {editMode && canEdit && (
                                <Button variant="outline-primary" size="sm" onClick={handleAddInstitution} className="mt-2">
                                    + Add Another {isUniversityApp ? "University" : "College"}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* ================== SUPPORTING DOCUMENTS ================== */}
                    {modalData.documents && modalData.documents.length > 0 ? (
                        <div className="bg-white p-4 rounded-lg shadow-sm mt-4 section-card" style={{ borderLeft: `4px solid ${canEdit ? '#ef4444' : '#94a3b8'}` }}>
                            <div className="d-flex align-items-center mb-4">
                                <FiUpload className="me-3" size={28} style={{ color: canEdit ? "#ef4444" : "#94a3b8" }} />
                                <div><h5 className="mb-0 fw-bold">Supporting Documents</h5><small>{modalData.documents.length} file{modalData.documents.length !== 1 ? "s" : ""} attached</small></div>
                            </div>
                            <div className="row g-4">
                                {modalData.documents.map(doc => (
                                    <div key={doc.id} className="col-md-6 col-lg-4">
                                        <div className="document-card border rounded-lg p-4 bg-white h-100 d-flex flex-column justify-content-between">
                                            <div className="mb-3">
                                                <strong className="d-block text-primary mb-2">{doc.documentType || "Untitled Document"}</strong>
                                                {doc.fileName && <small className="text-muted d-block">{doc.fileName}</small>}
                                            </div>
                                            <input type="file" accept=".pdf,.jpg,.png" ref={el => fileInputRefs.current[doc.id] = el} style={{ display: "none" }} onChange={e => handleFileChangeForDoc(doc.id, e)} />
                                            <div className="d-grid gap-2 mt-4">
                                                <Button variant="outline-primary" size="sm" onClick={() => handleViewDocument(doc.id, doc.fileName)}>
                                                    {previewLoading ? <Spinner animation="border" size="sm" /> : <><FiEye className="me-2" size={14} /> View</>}
                                                </Button>
                                                {canEdit && (
                                                    <Button variant="outline-secondary" size="sm" onClick={() => handleReplaceClick(doc.id)} disabled={uploadingDocs[doc.id]}>
                                                        {uploadingDocs[doc.id] ? <><Spinner animation="border" size="sm" className="me-2" /> Updating...</> : <><FiEdit2 className="me-2" size={14} /> Replace</>}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Alert variant="info" className="mt-4">No supporting documents uploaded.</Alert>
                    )}
                </Modal.Body>

                <Modal.Footer className="modal-footer-pro">
                    {editMode && canEdit ? (
                        <>
                            <Button variant="success" onClick={handleSaveChanges} disabled={saving}>
                                {saving ? <><Spinner animation="border" size="sm" className="me-2" /> Saving...</> : <><FiSave className="me-2" /> Save Changes</>}
                            </Button>
                            <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
                        </>
                    ) : (
                        <Button variant="outline-secondary" onClick={onHide}>Close</Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Document Preview Modal */}
            <Modal show={showDocumentPreview} onHide={handlePreviewClose} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="text-truncate">{previewDocument?.fileName || 'Document Preview'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: 0, minHeight: '300px' }}>
                    {previewLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : previewDocument ? (
                        <iframe src={previewDocument.url} title={previewDocument.fileName} style={{ width: '100%', height: '70vh', border: 'none' }} />
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handlePreviewClose}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Success/Error Modals */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Success</Modal.Title></Modal.Header>
                <Modal.Body>Your application has been updated successfully.</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowSuccessModal(false)}>OK</Button></Modal.Footer>
            </Modal>

            <Modal show={showDocSuccessModal} onHide={() => setShowDocSuccessModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Success</Modal.Title></Modal.Header>
                <Modal.Body>{docSuccessMessage}</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={handleDocSuccessClose}>OK</Button></Modal.Footer>
            </Modal>

            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Error</Modal.Title></Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer><Button variant="primary" onClick={() => setShowErrorModal(false)}>OK</Button></Modal.Footer>
            </Modal>
        </>
    );
};

export default ApplicationDetailsModal;
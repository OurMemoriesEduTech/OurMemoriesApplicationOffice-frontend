// src/constants/documentTypes.js
export const DOCUMENT_TYPES = {
    // Payment-related documents (trigger status updates)
    PROOF_OF_PAYMENT: {
        name: 'Proof of Payment',
        triggersPaymentUpdate: true,
        required: false,
        icon: '💰',
        description: 'Upload bank proof of payment'
    },
    // Regular documents (just storage)
    APPLICANT_ID_COPY: {
        name: 'Applicant ID Copy',
        triggersPaymentUpdate: false,
        required: true,
        icon: '🪪',
        description: 'ID document or passport copy'
    },
    GRADE_11_12_RESULTS: {
        name: 'Grade 11/12 Results',
        triggersPaymentUpdate: false,
        required: true,
        icon: '📊',
        description: 'Latest school results'
    },
    GRADE_9_10_11_12_RESULTS: {
        name: 'Grade 9/10/11/12 Results',
        triggersPaymentUpdate: false,
        required: true,
        icon: '📚',
        description: 'All school results'
    },
    PROOF_OF_RESIDENCE: {
        name: 'Proof of Residence',
        triggersPaymentUpdate: false,
        required: true,
        icon: '🏠',
        description: 'Municipal bill or affidavit'
    },
    PARENT_ID_COPY: {
        name: 'Parent ID Copy',
        triggersPaymentUpdate: false,
        required: true,
        icon: '👨‍👩‍👧',
        description: 'Parent/guardian ID'
    },
    PROOF_OF_INCOME: {
        name: 'Proof of Income',
        triggersPaymentUpdate: false,
        required: true,
        icon: '💰',
        description: 'Salary slip or bank statement'
    }
};

export const getDocumentConfig = (docName) => {
    const key = docName.toUpperCase().replace(/\s+/g, '_').replace(/\//g, '_');
    return DOCUMENT_TYPES[key] || {
        name: docName,
        displayName: docName,
        triggersPaymentUpdate: false,
        icon: '📄'
    };
};
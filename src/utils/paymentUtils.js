// src/utils/paymentUtils.js

/**
 * Format currency to ZAR
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'R 0.00';
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '—';
    }
};

/**
 * Get status badge variant for Bootstrap
 */
export const getStatusBadgeVariant = (status) => {
    const variants = {
        'PENDING': 'warning',
        'AWAITING_VERIFICATION': 'info',
        'PAID': 'success',
        'VERIFIED': 'success',
        'REJECTED': 'danger',
        'EXPIRED': 'secondary',
        'SUCCEEDED': 'success',
        'FAILED': 'danger'
    };
    return variants[status] || 'secondary';
};

/**
 * Get human-readable status display
 */
export const getStatusDisplay = (status) => {
    const displays = {
        'PENDING': 'Pending Payment',
        'AWAITING_VERIFICATION': 'Awaiting Verification',
        'PAID': 'Payment Verified',
        'VERIFIED': 'Payment Verified',
        'REJECTED': 'Payment Rejected',
        'EXPIRED': 'Payment Expired',
        'SUCCEEDED': 'Payment Successful',
        'FAILED': 'Payment Failed'
    };
    return displays[status] || status;
};

/**
 * Calculate application fee based on number of applications
 */
export const calculateApplicationFee = (numberOfApplications) => {
    const feeStructure = {
        1: 70.00,
        2: 130.00,
        3: 190.00,
        4: 250.00,
        5: 310.00
    };
    return feeStructure[numberOfApplications] || 70.00;
};

/**
 * Check if qualifies for free NSFAS
 */
export const qualifiesForFreeNSFAS = (numberOfApplications) => {
    return numberOfApplications >= 5;
};

/**
 * Get fee breakdown
 */
export const getFeeBreakdown = (numberOfApplications) => {
    const totalFee = calculateApplicationFee(numberOfApplications);
    const freeNSFAS = qualifiesForFreeNSFAS(numberOfApplications);

    return {
        totalApplications: numberOfApplications,
        totalFee,
        perApplicationFee: 70.00,
        freeNSFASIncluded: freeNSFAS,
        applicationsFee: freeNSFAS ? 310.00 : totalFee,
        nsfasFee: freeNSFAS ? 0.00 : null
    };
};

/**
 * Validate proof of payment file
 */
export const validateProofFile = (file) => {
    if (!file) {
        return { valid: false, error: 'Please select a file' };
    }

    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only PDF, JPG, and PNG files are allowed' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true, error: null };
};

/**
 * Get payment instructions for EFT
 */
export const getPaymentInstructions = () => {
    return {
        bankName: 'Standard Bank',
        accountName: 'OurMemories ApplicationOffice (Pty) Ltd',
        accountNumber: '123456789',
        accountType: 'Cheque Account',
        branchCode: '052852',
        branchName: 'Johannesburg',
        swiftCode: 'SBZAZAJJ',
        reference: 'Your Email Address',
        note: 'Please use your registered email address as reference'
    };
};
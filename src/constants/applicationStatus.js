// src/constants/applicationStatus.js

export const APPLICATION_STATUS = {
    // Initial state after submission with payment selected
    PENDING_PAYMENT: {
        code: 'PENDING_PAYMENT',
        label: 'Awaiting Payment',
        color: 'warning',
        icon: '⏳',
        description: 'Please complete your payment',
        userMessage: 'Complete your payment to proceed with application review',
        nextSteps: ['Make EFT payment', 'Upload proof of payment']
    },
    // After admin verifies payment
    PAYMENT_VERIFIED: {
        code: 'PAYMENT_VERIFIED',
        label: 'Payment Verified',
        color: 'info',
        icon: '✓',
        description: 'Payment confirmed, ready for review',
        userMessage: 'Your payment has been verified. Your application is now being reviewed.',
        nextSteps: ['Wait for admin review', 'Check email for updates']
    },
    // Admin is actively reviewing
    UNDER_REVIEW: {
        code: 'UNDER_REVIEW',
        label: 'Under Review',
        color: 'primary',
        icon: '📋',
        description: 'Application being processed',
        userMessage: 'Your application is currently being reviewed by our team.',
        nextSteps: ['Review may take 3-5 business days', 'Check dashboard for updates']
    },
    // Application successful
    APPROVED: {
        code: 'APPROVED',
        label: 'Approved',
        color: 'success',
        icon: '🎉',
        description: 'Application successful',
        userMessage: 'Congratulations! Your application has been approved.',
        nextSteps: ['Check your email for next steps', 'Prepare for registration']
    },
    // Application unsuccessful
    REJECTED: {
        code: 'REJECTED',
        label: 'Rejected',
        color: 'danger',
        icon: '✗',
        description: 'Application not successful',
        userMessage: 'Unfortunately, your application was not successful.',
        nextSteps: ['Contact support for feedback', 'Explore alternative options']
    },
    // User cancelled
    CANCELLED: {
        code: 'CANCELLED',
        label: 'Cancelled',
        color: 'secondary',
        icon: '✗',
        description: 'Application cancelled',
        userMessage: 'This application has been cancelled.',
        nextSteps: ['Start a new application if desired']
    }
};

export const PAYMENT_STATUS = {
    PENDING: {
        code: 'PENDING',
        label: 'Pending Payment',
        color: 'warning',
        icon: '⏳',
        description: 'User selected EFT but no proof uploaded',
        adminAction: 'Awaiting proof upload',
        userAction: 'Upload proof of payment'
    },
    AWAITING_VERIFICATION: {
        code: 'AWAITING_VERIFICATION',
        label: 'Awaiting Verification',
        color: 'info',
        icon: '📎',
        description: 'Proof uploaded, waiting for admin verification',
        adminAction: 'Verify payment',
        userAction: 'Wait for verification (24-48 hours)'
    },
    VERIFIED: {
        code: 'VERIFIED',
        label: 'Verified',
        color: 'success',
        icon: '✓',
        description: 'Payment confirmed',
        adminAction: 'Verified',
        userAction: 'Application under review'
    },
    REJECTED: {
        code: 'REJECTED',
        label: 'Rejected',
        color: 'danger',
        icon: '✗',
        description: 'Proof rejected, user needs to re-upload',
        adminAction: 'Re-upload required',
        userAction: 'Upload correct proof'
    },
    EXPIRED: {
        code: 'EXPIRED',
        label: 'Expired',
        color: 'secondary',
        icon: '⏰',
        description: '48 hours passed without payment',
        adminAction: 'Application cancelled',
        userAction: 'Start new application'
    }
};

export const getApplicationStatus = (code) => {
    return APPLICATION_STATUS[code] || APPLICATION_STATUS.PENDING_PAYMENT;
};

export const getPaymentStatus = (code) => {
    return PAYMENT_STATUS[code] || PAYMENT_STATUS.PENDING;
};

export const getStatusColor = (status, type = 'application') => {
    const statusMap = type === 'application' ? APPLICATION_STATUS : PAYMENT_STATUS;
    return statusMap[status]?.color || 'secondary';
};

export const getStatusLabel = (status, type = 'application') => {
    const statusMap = type === 'application' ? APPLICATION_STATUS : PAYMENT_STATUS;
    return statusMap[status]?.label || status;
};

export const getStatusIcon = (status, type = 'application') => {
    const statusMap = type === 'application' ? APPLICATION_STATUS : PAYMENT_STATUS;
    return statusMap[status]?.icon || '📋';
};
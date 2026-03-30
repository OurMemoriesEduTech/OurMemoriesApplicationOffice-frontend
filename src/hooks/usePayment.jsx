// src/hooks/usePayment.js
import { useState, useCallback } from 'react';
import paymentService from '../components/features/payment/paymentService';

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    const initiateEFTPayment = useCallback(async (applicationId, paymentReference, description) => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentService.initiateEFTPayment(applicationId, paymentReference, description);
            setSuccess(response.message);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadProof = useCallback(async (paymentId, file) => {
        setLoading(true);
        setError(null);
        try {
            const response = await paymentService.uploadProofOfPayment(paymentId, file);
            setSuccess(response.message);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPaymentHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const payments = await paymentService.getUserEFTPayments();
            return payments;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getPaymentDetails = useCallback(async (paymentId) => {
        setLoading(true);
        setError(null);
        try {
            const payment = await paymentService.getPaymentDetails(paymentId);
            return payment;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        success,
        clearMessages,
        initiateEFTPayment,
        uploadProof,
        getPaymentHistory,
        getPaymentDetails
    };
};
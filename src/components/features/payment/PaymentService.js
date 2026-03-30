// src/services/paymentService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

class PaymentService {
    /**
     * Get EFT payment instructions
     */
    async getEFTInstructions() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/eft-instructions`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get fee structure
     */
    async getFeeStructure() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/fee-structure`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Initiate EFT payment
     */
    async initiateEFTPayment(applicationId, paymentReference, description = '') {
        try {
            const response = await axios.post(`${API_BASE_URL}/payments/initiate-eft`, {
                applicationId,
                paymentMethod: 'EFT',
                paymentReference,
                description
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Upload proof of payment
     */
    async uploadProofOfPayment(paymentId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${API_BASE_URL}/payments/upload-proof/${paymentId}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get user's EFT payment history
     */
    async getUserEFTPayments() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/my-eft-payments`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get specific payment details
     */
    async getPaymentDetails(paymentId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/eft/${paymentId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Admin: Get pending EFT verifications
     */
    async getPendingVerifications() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/admin/pending-eft`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Admin: Verify EFT payment
     */
    async verifyPayment(paymentId, status, notes) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/admin/verify-eft/${paymentId}`,
                { paymentId, status, notes },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Admin: Download proof of payment
     */
    async downloadProof(paymentId) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/admin/download-proof/${paymentId}`,
                {
                    withCredentials: true,
                    responseType: 'blob'
                }
            );
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Admin: Get EFT statistics
     */
    async getEFTStatistics() {
        try {
            const response = await axios.get(`${API_BASE_URL}/payments/admin/eft-stats`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            return new Error(error.response.data?.error || error.response.data?.message || 'Server error');
        } else if (error.request) {
            return new Error('Network error. Please check your connection.');
        } else {
            return new Error(error.message || 'An error occurred');
        }
    }
}

export default new PaymentService();
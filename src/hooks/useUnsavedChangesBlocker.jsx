// src/hooks/useUnsavedChangesBlocker.jsx
import { useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';  // ← This is the correct import
import { Modal, Button } from 'react-bootstrap';

const useUnsavedChangesBlocker = (isDirty) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const blockerRef = useRef(null);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            blockerRef.current = blocker;
            setShowConfirmModal(true);
        }
    }, [blocker]);

    const handleConfirmLeave = () => {
        setShowConfirmModal(false);
        if (blockerRef.current) blockerRef.current.proceed();
    };

    const handleStay = () => {
        setShowConfirmModal(false);
        if (blockerRef.current) blockerRef.current.reset();
    };

    // Browser refresh/back
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const ConfirmModal = () => (
        <Modal show={showConfirmModal} onHide={handleStay} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Discard Changes?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>You have unsaved changes in this form.</p>
                <p className="text-danger fw-bold">Are you sure you want to leave?</p>
                <small>All unsaved data will be lost.</small>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleStay}>
                    Stay on Page
                </Button>
                <Button variant="danger" onClick={handleConfirmLeave}>
                    Leave Anyway
                </Button>
            </Modal.Footer>
        </Modal>
    );

    return { ConfirmModal };
};

export default useUnsavedChangesBlocker;
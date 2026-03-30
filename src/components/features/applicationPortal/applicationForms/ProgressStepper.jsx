import React from 'react';
import PropTypes from 'prop-types';
import './ProgressStepper.css';

const ProgressStepper = ({ step, steps }) => {
    const getStepStatus = (index) => {
        const stepNumber = index + 1;
        return {
            isActive: step === stepNumber,
            isCompleted: step > stepNumber,
            stepNumber,
        };
    };

    const getStepClassName = (isActive, isCompleted) => {
        const classes = ['step-circle'];
        if (isActive) classes.push('active');
        if (isCompleted) classes.push('completed');
        return classes.join(' ');
    };

    const getAriaLabel = (stepNumber, stepName, isCompleted, isActive) => {
        const status = isCompleted ? 'completed' : isActive ? 'current' : 'upcoming';
        return `Step ${stepNumber}: ${stepName}, ${status}`;
    };

    return (
        <nav className="progress-stepper" aria-label="Application progress">
            <ol className="stepper-container">
                {steps.map((stepName, index) => {
                    const { isActive, isCompleted, stepNumber } = getStepStatus(index);

                    return (
                        <li key={stepNumber} className="step-item">
                            <div className="step-content">
                                <div
                                    className={getStepClassName(isActive, isCompleted)}
                                    aria-current={isActive ? 'step' : undefined}
                                    aria-label={getAriaLabel(stepNumber, stepName, isCompleted, isActive)}
                                    role="img"
                                >
                                    {isCompleted ? (
                                        <svg className="step-icon" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    ) : (
                                        <span className="step-number">{stepNumber}</span>
                                    )}
                                </div>
                                <span className="step-label">{stepName}</span>
                            </div>
                            {stepNumber < steps.length && (
                                <div
                                    className={`step-connector ${isCompleted ? 'completed' : ''}`}
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

ProgressStepper.propTypes = {
    step: PropTypes.number.isRequired,
    steps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProgressStepper;
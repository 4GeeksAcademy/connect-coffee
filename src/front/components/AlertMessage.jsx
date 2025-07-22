import React, { useEffect } from 'react';

const AlertMessage = ({ message, type = 'danger', show, onClose, autoClose = 5000 }) => {
    useEffect(() => {
        if (show && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoClose);

            return () => clearTimeout(timer);
        }
    }, [show, autoClose, onClose]);

    if (!show) return null;

    const getAlertClass = () => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'warning':
                return 'alert-warning';
            case 'info':
                return 'alert-info';
            default:
                return 'alert-danger';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '✕';
        }
    };

    return (
        <div
            className="position-fixed top-0 start-50 translate-middle-x mt-3"
            style={{ zIndex: 1055, minWidth: '300px', maxWidth: '500px' }}
        >
            <div className={`alert ${getAlertClass()} alert-dismissible fade show shadow-lg`} role="alert">
                <div className="d-flex align-items-center">
                    <div className="me-2" style={{ fontSize: '1.5rem' }}>
                        {getIcon()}
                    </div>
                    <div className="flex-grow-1">
                        <strong>{type === 'danger' ? 'Error' : type === 'success' ? 'Éxito' : 'Información'}</strong>
                        <div>{message}</div>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default AlertMessage;
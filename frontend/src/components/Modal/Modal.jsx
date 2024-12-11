import React from 'react';
import './Modal.css';

const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;

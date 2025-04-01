import React from 'react';

const Notification = ({ type, message, onClose }) => {
  const notificationClass = `notification notification-${type}`;
  
  return (
    <div className={notificationClass}>
      <div className="notification-content">
        {message}
      </div>
      {onClose && (
        <button 
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification;

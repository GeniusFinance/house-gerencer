/**
 * Sheet Notifications
 * Toast notifications for operation results
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  affectedRows?: number;
  onDismiss: (id: string) => void;
  duration?: number;
}

function Notification({ id, type, message, affectedRows, onDismiss, duration = 6000 }: NotificationProps) {
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      setAnimateOut(true);
      setTimeout(() => onDismiss(id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    info: 'text-blue-900',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const icons = {
    success: <Check size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        animateOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <div
        className={`border rounded-lg p-4 flex items-start gap-3 ${
          bgColors[type]
        }`}
      >
        <div className={`flex-shrink-0 mt-0.5 ${iconColors[type]}`}>
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${textColors[type]}`}>
            {message}
          </p>
          {affectedRows !== undefined && (
            <p className={`text-xs mt-1 ${textColors[type]} opacity-75`}>
              Affected rows: {affectedRows}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setAnimateOut(true);
            setTimeout(() => onDismiss(id), 300);
          }}
          className={`flex-shrink-0 ${textColors[type]} opacity-50 hover:opacity-100 transition-opacity`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    affectedRows?: number;
    timestamp: number;
    duration?: number;
  }>;
  onDismiss: (id: string) => void;
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          id={notif.id}
          type={notif.type}
          message={notif.message}
          affectedRows={notif.affectedRows}
          duration={notif.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: 'success' | 'error' | 'info';
      message: string;
      affectedRows?: number;
      timestamp: number;
      duration?: number;
    }>
  >([]);

  const addNotification = useCallback(
    (
      type: 'success' | 'error' | 'info',
      message: string,
      options?: { affectedRows?: number; duration?: number }
    ) => {
      const id = `notif-${Date.now()}`;
      setNotifications((prev) => [
        ...prev,
        {
          id,
          type,
          message,
          affectedRows: options?.affectedRows,
          timestamp: Date.now(),
          duration: options?.duration,
        },
      ]);
      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addSuccess = useCallback(
    (message: string, affectedRows?: number) =>
      addNotification('success', message, { affectedRows, duration: 4000 }),
    [addNotification]
  );

  const addError = useCallback(
    (message: string) => addNotification('error', message, { duration: 6000 }),
    [addNotification]
  );

  const addInfo = useCallback(
    (message: string) => addNotification('info', message, { duration: 3000 }),
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    dismissNotification,
    addSuccess,
    addError,
    addInfo,
  };
}

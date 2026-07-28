import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const success = useCallback((msg: string) => toast.success(msg), []);
  const error = useCallback((msg: string) => toast.error(msg), []);
  const info = useCallback((msg: string) => toast(msg, { icon: 'ℹ️' }), []);

  return (
    <NotificationContext.Provider value={{ success, error, info }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          },
          duration: 4000,
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

import { Toaster } from 'react-hot-toast';

export const ToastContainer = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1E293B',
          color: '#F1F5F9',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#F1F5F9',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#F1F5F9',
          },
        },
      }}
    />
  );
};

export default ToastContainer;

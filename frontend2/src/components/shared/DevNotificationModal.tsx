import { X } from 'lucide-react';

interface DevNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevNotificationModal: React.FC<DevNotificationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-yellow-600 rounded-full p-1 mr-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Development Notice</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-yellow-200 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center leading-relaxed">
            🚧 <strong>Website is Under Development</strong> 🚧
            <br />
            <br />
            Some features might not work as expected. We're working hard to bring you the best experience!
          </p>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevNotificationModal;

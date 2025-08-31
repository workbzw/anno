import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50" onClick={onCancel}></div>
      <div className="modal-container bg-white w-11/12 md:max-w-lg mx-auto rounded-lg shadow-2xl relative" style={{ zIndex: 10000 }}>
        <div className="modal-content p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">录音批次完成</h3>
          </div>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
              onClick={onConfirm}
            >
              继续录音
            </button>
            <button
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              onClick={onCancel}
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
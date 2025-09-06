import React from 'react';
import { X } from 'lucide-react';

const ConfirmModal = ({
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  open
}) => {
  if (!open) return null;

  const confirmClasses =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-secondary-600 hover:bg-secondary-700';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${confirmClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

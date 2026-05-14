import React from 'react'

const DeleteConfirmation = ({ onConfirm, onCancel, message }) => (
    <div className="p-2 sm:p-3 w-full">
        <p className="mb-4 font-semibold text-sm leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 sm:gap-4">
            <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 rounded-lg text-xs sm:text-sm hover:bg-gray-700 transition active:scale-95"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-500 rounded-lg text-xs sm:text-sm hover:bg-red-600 transition font-bold active:scale-95 shadow-lg"
            >
                Delete
            </button>
        </div>
    </div>
);

export default DeleteConfirmation

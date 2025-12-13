import React, { useState, useRef } from 'react';

export default function UploadSection({ onFileUpload, targetAMB, setTargetAMB }) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-gradient p-4 sm:p-8">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
            <span className="text-xl sm:text-2xl">📄</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Upload Bank Statement</h2>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all duration-200 ${
            dragOver
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">📁</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Drag & Drop PDF Here
            </h3>
            <p className="text-gray-600 mb-4">or</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-4">
              Only PDF files are supported (Max 10MB)
            </p>
          </div>
        </div>

        {/* Target AMB Input */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <label htmlFor="targetAMB" className="block text-sm font-semibold text-gray-700 mb-2">
            Target AMB (₹):
          </label>
          <input
            type="number"
            id="targetAMB"
            value={targetAMB}
            onChange={(e) => setTargetAMB(parseInt(e.target.value) || 0)}
            min="0"
            step="100"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
          />
        </div>
      </div>
    </div>
  );
}

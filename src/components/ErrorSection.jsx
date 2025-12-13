import React from 'react';

export default function ErrorSection({ error, onReset }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-gradient p-12 text-center border-2 border-red-200">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">❌</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Something went wrong
        </h3>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
        
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

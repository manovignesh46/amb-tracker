import React from 'react';

export default function LoadingSection() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-gradient p-12 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Analyzing your statement...
        </h3>
        <p className="text-gray-600">
          Please wait while we process your PDF
        </p>
        
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

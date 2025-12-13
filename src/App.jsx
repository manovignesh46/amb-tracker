import React, { useState } from 'react';
import UploadSection from './components/UploadSection';
import LoadingSection from './components/LoadingSection';
import ResultsSection from './components/ResultsSection';
import ErrorSection from './components/ErrorSection';

function App() {
  const [view, setView] = useState('upload'); // upload, loading, results, error
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [targetAMB, setTargetAMB] = useState(5000);

  const handleFileUpload = async (file) => {
    setView('loading');
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('targetAMB', targetAMB);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      setResults(responseData.data);
      setView('results');
    } catch (err) {
      setError(err.message);
      setView('error');
    }
  };

  const resetApp = () => {
    setView('upload');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">🏦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 px-2">
            HDFC Bank AMB Tracker
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Track your Average Monthly Balance easily
          </p>
        </header>

        {/* Main Content */}
        <main>
          {view === 'upload' && (
            <UploadSection
              onFileUpload={handleFileUpload}
              targetAMB={targetAMB}
              setTargetAMB={setTargetAMB}
            />
          )}
          
          {view === 'loading' && <LoadingSection />}
          
          {view === 'results' && (
            <ResultsSection
              results={results}
              onReset={resetApp}
            />
          )}
          
          {view === 'error' && (
            <ErrorSection
              error={error}
              onReset={resetApp}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Made with <span className="text-red-500">❤️</span> for easy AMB tracking | HDFC Bank Statement Analyzer
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

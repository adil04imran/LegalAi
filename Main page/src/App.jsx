import React from "react";
import { FileText, Brain } from "lucide-react";

const App = () => {
    const redirectTo = (port) => {
    window.location.href = `http://localhost:${port}`;
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        LexAI Research Hub
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Document Analyzer Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all text-center">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Lextract</h2>
          <p className="text-gray-600 mb-4">
            Upload and analyze legal documents using NLP.
          </p>
          <button
            onClick={() => redirectTo(5178)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 w-full"
          >
            Open Document Analyzer
          </button>
        </div>

        {/* Research Agent Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">The Second Mind</h2>
          <p className="text-gray-600 mb-4">
            Discover research agent for Legal Analysis.
          </p>
          <button
            onClick={() => redirectTo(5176)}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 w-full"
          >
            Launch Research Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

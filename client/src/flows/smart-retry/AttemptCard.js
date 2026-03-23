import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const AttemptCard = ({ attempt, isHighlighted, showConnector }) => {
  const isApproved = attempt.status === 'approved';
  const isDeclined = attempt.status === 'declined';

  return (
    <div className="relative">
      {/* Card */}
      <div className={`rounded-xl border-2 p-6 transition-all duration-500 ${
        isHighlighted
          ? 'bg-white border-gray-400 shadow-lg transform scale-[1.02]'
          : isApproved 
            ? 'bg-green-50 border-green-200' 
            : isDeclined
              ? 'bg-red-50 border-red-200'
              : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* PSP Badge */}
            <div className={`px-4 py-2 rounded-lg text-base font-bold text-white ${
              attempt.psp === 'PSP1' ? 'bg-gray-700' :
              attempt.psp === 'PSP2' ? 'bg-gray-600' :
              'bg-gray-500'
            }`}>
              {attempt.psp}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                Attempt {attempt.id}
              </h4>
              <p className="text-base text-gray-500 mt-1">
                {attempt.payload}
              </p>
            </div>
          </div>
          
          {/* Status Icon and Text */}
          <div className="flex items-center gap-2">
            {isApproved ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-lg font-bold text-green-700">Success</span>
              </>
            ) : isDeclined ? (
              <>
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-lg font-bold text-red-700">Failed</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Error/Success Details */}
        <div className="text-lg">
          {isDeclined && (
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-semibold">{attempt.errorMessage}</span>
              <span className="text-gray-500">(Error Code: {attempt.errorCode})</span>
            </div>
          )}

          {isApproved && (
            <div className="flex items-center gap-2 text-green-700">
              <span className="font-semibold">Payment Approved</span>
              <span className="text-gray-500">• Auth: {attempt.authCode} • {attempt.network}</span>
            </div>
          )}
        </div>

        {/* Retry Strategy Badge */}
        {attempt.strategy && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-base text-gray-600">Next retry strategy:</span>
            <span className="px-4 py-1 bg-blue-100 text-blue-800 text-base font-medium rounded-full">
              {attempt.strategy}
            </span>
          </div>
        )}
      </div>

      {/* Connector Arrow */}
      {showConnector && (
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gray-300"></div>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptCard;

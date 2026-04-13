import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const AttemptCard = ({ attempt, isHighlighted, showConnector }) => {
  const isApproved = attempt.status === 'approved';
  const isDeclined = attempt.status === 'declined';

  return (
    <div className="relative">
      <div className={`rounded-xl border-2 p-6 transition-all duration-500 ${
        isHighlighted
          ? 'bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 shadow-lg transform scale-[1.02]'
          : isApproved 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : isDeclined
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg text-base font-bold text-white ${
              attempt.psp === 'PSP1' ? 'bg-gray-700' :
              attempt.psp === 'PSP2' ? 'bg-gray-600' :
              'bg-gray-500'
            }`}>
              {attempt.psp}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                Attempt {attempt.id}
              </h4>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                {attempt.payload}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isApproved ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <span className="text-lg font-bold text-green-700 dark:text-green-400">Success</span>
              </>
            ) : isDeclined ? (
              <>
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                <span className="text-lg font-bold text-red-700 dark:text-red-400">Failed</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="text-lg">
          {isDeclined && (
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <span className="font-semibold">{attempt.errorMessage}</span>
              <span className="text-gray-500 dark:text-gray-400">(Error Code: {attempt.errorCode})</span>
            </div>
          )}

          {isApproved && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <span className="font-semibold">Payment Approved</span>
              <span className="text-gray-500 dark:text-gray-400">• Auth: {attempt.authCode} • {attempt.network}</span>
            </div>
          )}
        </div>

        {attempt.strategy && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-base text-gray-600 dark:text-gray-400">Next retry strategy:</span>
            <span className="px-4 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-base font-medium rounded-full">
              {attempt.strategy}
            </span>
          </div>
        )}
      </div>

      {showConnector && (
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
            <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptCard;

import React from 'react';
import { useRecoilValue } from 'recoil';
import { apiResponseState } from '../utils/atoms';
import { Code, Server, CreditCard, CheckCircle } from 'lucide-react';

const APIResponsePanel = () => {
  const apiResponse = useRecoilValue(apiResponseState);

  if (!apiResponse.steps || apiResponse.steps.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <Code size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Select a flow to see API request/response details
        </p>
      </div>
    );
  }

  const getStepIcon = (title) => {
    if (title.includes('Create')) return <Server size={20} />;
    if (title.includes('SDK')) return <CreditCard size={20} />;
    if (title.includes('Capture')) return <CheckCircle size={20} />;
    return <Code size={20} />;
  };

  const formatJSON = (obj) => {
    if (typeof obj === 'string') return obj;
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <Code size={20} className="text-primary" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            API Request / Response
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {apiResponse.steps.map((step, index) => (
          <div 
            key={index} 
            className={`p-6 ${index === apiResponse.currentStep ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                index < apiResponse.currentStep 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : index === apiResponse.currentStep
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {getStepIcon(step.title)}
              </div>
              <div className="flex flex-col">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {step.title}
                </h4>
                {step.subTitle && (
                  <span className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {step.subTitle}
                  </span>
                )}
              </div>
              {index < apiResponse.currentStep && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
              {index === apiResponse.currentStep && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Current
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Request */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Request
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  {typeof step.request === 'string' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {step.request}
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                          {step.request.method}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {step.request.url}
                        </span>
                      </div>
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        <code>{formatJSON(step.request.body)}</code>
                      </pre>
                    </>
                  )}
                </div>
              </div>

              {/* Response */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Response
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  {typeof step.response === 'string' ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {step.response}
                    </p>
                  ) : (
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre">
                      <code>{formatJSON(step.response)}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APIResponsePanel;

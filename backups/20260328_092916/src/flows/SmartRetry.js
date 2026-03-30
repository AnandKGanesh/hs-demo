import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { retryScenarios } from './smart-retry/scenarios';
import ScenarioRunner from './smart-retry/ScenarioRunner';

const SmartRetry = () => {
  const [selectedScenario, setSelectedScenario] = useState(retryScenarios[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Scenario
        </label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          <div className="text-left">
            <span className="font-medium text-gray-900">
              {selectedScenario.name}
            </span>
            <span className="block text-xs text-gray-500">
              {selectedScenario.description}
            </span>
          </div>
          {isDropdownOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {retryScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => {
                  setSelectedScenario(scenario);
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedScenario.id === scenario.id
                    ? 'bg-gray-50 border-l-4 border-gray-800'
                    : ''
                }`}
              >
                <span className="font-medium text-gray-900">
                  {scenario.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {scenario.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Runner - Key forces reset when scenario changes */}
      <ScenarioRunner key={selectedScenario.id} scenario={selectedScenario} />
    </div>
  );
};

export default SmartRetry;

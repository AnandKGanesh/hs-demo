import React from 'react';
import { Network, Shield, ArrowRightLeft, CreditCard } from 'lucide-react';

const mechanismIcons = {
  networkSwitch: Network,
  stepUp: Shield,
  cascade: ArrowRightLeft,
  credential: CreditCard,
};

const MechanismBar = ({ mechanisms, activeMechanisms }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
        Mechanisms in this flow
      </h3>
      <div className="flex gap-2">
        {mechanisms.map((mechanism) => {
          const Icon = mechanismIcons[mechanism.id];
          const isActive = activeMechanisms.includes(mechanism.id);
          
          return (
            <div
              key={mechanism.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="font-medium">{mechanism.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MechanismBar;

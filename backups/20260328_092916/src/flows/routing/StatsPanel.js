import React from 'react';
import { Activity, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

// Stat Card Component with Juspay Blue
const StatCard = ({ icon: Icon, label, value, subtext, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-[#E6F0FF] border-[#0066FF] text-[#0066FF]',
    green: 'bg-[#E6F0FF] border-[#10B981] text-[#10B981]',
    amber: 'bg-[#FFF7ED] border-[#F59E0B] text-[#F59E0B]',
  };
  
  return (
    <div className={`p-4 rounded-lg border-2 ${colorStyles[color] || colorStyles.blue}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium opacity-80 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
        </div>
        <Icon className="w-5 h-5 opacity-60 flex-shrink-0 ml-2" />
      </div>
    </div>
  );
};

// PSP Distribution Bar Chart with Juspay Blue
const PspDistributionChart = ({ distribution, psps }) => {
  const data = psps.map(psp => ({
    name: psp.shortName,
    value: distribution[psp.id] || 0,
  }));
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-white rounded-xl border-2 border-[#E6F0FF] p-4">
      <h4 className="text-sm font-bold text-[#0066FF] mb-3 uppercase tracking-wide">PSP Distribution</h4>
      
      {total === 0 ? (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
          No data yet
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-6 text-xs font-bold text-gray-700">{item.name}</div>
                <div className="flex-1 bg-[#E6F0FF] rounded h-3 overflow-hidden">
                  <div 
                    className="h-full rounded bg-[#0066FF] transition-all duration-500"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
                <div className="w-10 text-right text-xs font-bold text-gray-700">
                  {((item.value / total) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 grid grid-cols-4 gap-1">
            {data.map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-bold text-[#0066FF]">{item.name}</p>
                <p className="text-xs text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main Stats Panel Component - No Simulation Progress
const StatsPanel = ({ stats, psps }) => {
  const avgAuthRate = stats.totalProcessed > 0 
    ? ((stats.successful / stats.totalProcessed) * 100).toFixed(1)
    : '0.0';
  
  const avgCostPerTxn = stats.totalProcessed > 0 
    ? (stats.totalCost / stats.totalProcessed).toFixed(2)
    : '0.00';
  
  // Format large numbers
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  return (
    <div className="space-y-4">
      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={Activity}
          label="Success Rate"
          value={`${avgAuthRate}%`}
          subtext={`${stats.successful.toLocaleString()} successful`}
          color="green"
        />
        <StatCard 
          icon={DollarSign}
          label="Total Cost"
          value={formatCurrency(stats.totalCost)}
          subtext={`$${avgCostPerTxn} avg/txn`}
          color="blue"
        />
        <StatCard 
          icon={TrendingUp}
          label="Overrides"
          value={stats.overrides.toLocaleString()}
          subtext="Dynamic rules"
          color="amber"
        />
        <StatCard 
          icon={CheckCircle}
          label="Processed"
          value={stats.totalProcessed.toLocaleString()}
          subtext={`of ${stats.totalTarget.toLocaleString()}`}
          color="blue"
        />
      </div>
      
      {/* PSP Distribution */}
      <PspDistributionChart distribution={stats.pspDistribution} psps={psps} />
      
      {/* PSP Real-time Stats */}
      <div className="bg-white rounded-xl border-2 border-[#E6F0FF] p-4">
        <h4 className="text-sm font-bold text-[#0066FF] mb-3 uppercase tracking-wide">PSP Performance</h4>
        <div className="space-y-2">
          {psps.map(psp => (
            <div key={psp.id} className="flex items-center justify-between p-2 bg-[#E6F0FF] rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0066FF] flex items-center justify-center text-white text-xs font-bold">
                  {psp.shortName}
                </div>
                <span className="font-bold text-gray-800">{psp.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium">{(psp.currentAuthRate * 100).toFixed(0)}% auth</span>
                <span>{psp.currentLatency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;

import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon, BarChartBig } from 'lucide-react';

const CHART_COLORS = [
  'hsl(44, 96%, 51%)',
  'hsl(218, 57%, 54%)',
  'hsl(354, 70%, 50%)',
  'hsl(112, 16%, 52%)',
  'hsl(274, 74%, 66%)',
];

const getAllProcessorIds = (history) => {
  if (!history || history.length === 0) {
    return [];
  }
  const processorIdSet = new Set();
  history.forEach((dataPoint) => {
    Object.keys(dataPoint).forEach((key) => {
      if (key !== 'time') {
        processorIdSet.add(key);
      }
    });
  });
  return Array.from(processorIdSet);
};

const processDiscreteVolumeData = (history) => {
  if (!history || history.length === 0) {
    return [];
  }

  const processorIds = getAllProcessorIds(history);
  const discreteData = [];
  let previousCumulativeVolumes = {};

  processorIds.forEach((id) => {
    previousCumulativeVolumes[id] = 0;
  });

  for (const dataPoint of history) {
    const newPoint = { time: dataPoint.time };

    for (const processorId of processorIds) {
      const cumulativeVolumeAtT = Number(dataPoint[processorId]) || 0;
      newPoint[processorId] = cumulativeVolumeAtT - (previousCumulativeVolumes[processorId] || 0);
      previousCumulativeVolumes[processorId] = cumulativeVolumeAtT;
    }
    discreteData.push(newPoint);
  }
  return discreteData;
};

const SuccessRateTooltip = ({ active, payload, label, merchantConnectors }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-xs">
        <p className="mb-2 font-semibold text-sm text-gray-900 dark:text-white">
          Time: {new Date(label).toLocaleTimeString()}
        </p>
        {payload.map((pld, index) => {
          const connector = merchantConnectors?.find(
            (mc) => (mc.merchant_connector_id || mc.connector_name) === pld.name
          );
          const displayName = connector ? connector.connector_name : pld.name;
          return (
            <div key={index} className="mb-1.5 last:mb-0">
              <div className="flex items-center mb-0.5">
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: pld.stroke,
                    marginRight: '6px',
                    borderRadius: '2px',
                  }}
                />
                <span className="font-medium text-gray-900 dark:text-white">{displayName}</span>
              </div>
              <p className="pl-[16px] text-gray-700 dark:text-gray-300">
                Success Rate: <span className="font-semibold">{parseFloat(pld.value).toFixed(1)}%</span>
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const VolumeTooltip = ({ active, payload, label, merchantConnectors }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-xs">
        <p className="mb-2 font-semibold text-sm text-gray-900 dark:text-white">
          Time: {new Date(label).toLocaleTimeString()}
        </p>
        {payload.map((pld, index) => {
          const connector = merchantConnectors?.find(
            (mc) => (mc.merchant_connector_id || mc.connector_name) === pld.name
          );
          const displayName = connector ? connector.connector_name : pld.name;
          return (
            <div key={index} className="mb-1.5 last:mb-0">
              <div className="flex items-center mb-0.5">
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: pld.stroke,
                    marginRight: '6px',
                    borderRadius: '2px',
                  }}
                />
                <span className="font-medium text-gray-900 dark:text-white">{displayName}</span>
              </div>
              <p className="pl-[16px] text-gray-700 dark:text-gray-300">
                Volume: <span className="font-semibold">{parseInt(pld.value, 10).toLocaleString()}</span>
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const DecisionEngineCharts = ({ successRateHistory, volumeHistory, merchantConnectors, connectorToggleStates }) => {
  const uniqueProcessorIds = getAllProcessorIds(successRateHistory);

  const processorColorMap = useMemo(() => {
    const map = new Map();
    uniqueProcessorIds.forEach((processorId, i) => {
      map.set(processorId, CHART_COLORS[i % CHART_COLORS.length]);
    });
    return map;
  }, [uniqueProcessorIds]);

  const chartVolumeData = processDiscreteVolumeData(volumeHistory);
  const uniqueVolumeProcessorIds = getAllProcessorIds(volumeHistory);

  const volumeColorMap = useMemo(() => {
    const map = new Map();
    uniqueVolumeProcessorIds.forEach((processorId, i) => {
      map.set(processorId, CHART_COLORS[i % CHART_COLORS.length]);
    });
    return map;
  }, [uniqueVolumeProcessorIds]);

  const formatTime = (timestamp) => {
    if (typeof timestamp !== 'number') return '';
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
            <LineChartIcon className="mr-2 h-5 w-5 text-primary" /> Success Rate Over Time
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Processor success rates as the simulation progresses.
          </p>
        </div>
        <div className="p-6">
          {successRateHistory && successRateHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={successRateHistory} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" tickFormatter={formatTime} />
                <YAxis
                  stroke="#6b7280"
                  domain={[0, 100]}
                  tickFormatter={(value) => String(Math.round(value))}
                  width={45}
                />
                <Tooltip
                  content={<SuccessRateTooltip merchantConnectors={merchantConnectors} />}
                  labelFormatter={formatTime}
                />
                <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                {successRateHistory.length > 0 &&
                  Object.keys(successRateHistory[0])
                    .filter((key) => key !== 'time' && connectorToggleStates[key] === true)
                    .map((processorId) => {
                      const connector = merchantConnectors.find(
                        (mc) => (mc.merchant_connector_id || mc.connector_name) === processorId
                      );
                      const displayName = connector ? connector.connector_name : processorId;
                      return (
                        <Area
                          key={processorId}
                          type="monotone"
                          dataKey={processorId}
                          name={displayName}
                          stroke={processorColorMap.get(processorId)}
                          fill={processorColorMap.get(processorId)}
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={{ r: 1, strokeWidth: 1 }}
                          activeDot={{ r: 4, strokeWidth: 1 }}
                        />
                      );
                    })}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                No success rate data available yet. Run a simulation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
            <BarChartBig className="mr-2 h-5 w-5 text-primary" /> Volume Over Time
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Transaction volume per processor for each time interval.
          </p>
        </div>
        <div className="p-6">
          {chartVolumeData && chartVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartVolumeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" tickFormatter={formatTime} />
                <YAxis stroke="#6b7280" width={50} tickFormatter={(value) => value.toLocaleString()} />
                <Tooltip
                  content={<VolumeTooltip merchantConnectors={merchantConnectors} />}
                  labelFormatter={formatTime}
                />
                <Legend wrapperStyle={{ color: '#374151', paddingTop: '10px' }} />
                {chartVolumeData.length > 0 &&
                  uniqueVolumeProcessorIds
                    .filter((processorId) => connectorToggleStates[processorId] === true)
                    .map((processorId) => {
                      const connector = merchantConnectors.find(
                        (mc) => (mc.merchant_connector_id || mc.connector_name) === processorId
                      );
                      const displayName = connector ? connector.connector_name : processorId;
                      return (
                        <Area
                          key={processorId}
                          type="monotone"
                          dataKey={processorId}
                          name={displayName}
                          stroke={volumeColorMap.get(processorId)}
                          fill={volumeColorMap.get(processorId)}
                          fillOpacity={0.2}
                          strokeWidth={2}
                          dot={{ r: 1, strokeWidth: 1 }}
                          activeDot={{ r: 4, strokeWidth: 1 }}
                        />
                      );
                    })}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No volume data available yet. Run a simulation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DecisionEngineCharts;

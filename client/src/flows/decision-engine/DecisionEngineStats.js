import React, { useMemo } from 'react';
import { ListChecks, CheckCircle2, XCircle, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, Tooltip, YAxis } from 'recharts';

const CHART_COLORS = [
  'hsl(44, 96%, 51%)',
  'hsl(218, 57%, 54%)',
  'hsl(354, 70%, 50%)',
  'hsl(112, 16%, 52%)',
  'hsl(274, 74%, 66%)',
];

const DecisionEngineStats = ({
  currentControls,
  merchantConnectors,
  processedPayments = 0,
  totalSuccessful = 0,
  totalFailed = 0,
  overallSuccessRateHistory = [],
}) => {
  const overallSR = currentControls?.overallSuccessRate ?? 0;

  const processorSRData = useMemo(() => {
    if (!currentControls?.processorWiseSuccessRates) {
      return [];
    }

    return Object.keys(currentControls.processorWiseSuccessRates)
      .map((processorId) => {
        const processorData = currentControls.processorWiseSuccessRates[processorId];
        const connectorInfo = merchantConnectors.find(
          (mc) => (mc.merchant_connector_id || mc.connector_name) === processorId
        );
        const processorName = connectorInfo ? connectorInfo.connector_name : processorId;

        const successfulPayments = processorData.successfulPaymentCount;
        const totalPayments = processorData.totalPaymentCount;
        const calculatedSr = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

        return {
          processor: processorName,
          sr: calculatedSr,
          successfulPaymentCount: successfulPayments,
          totalPaymentCount: totalPayments,
          volumeForSort: totalPayments,
        };
      })
      .sort((a, b) => b.volumeForSort - a.volumeForSort)
      .map(({ volumeForSort, ...rest }) => rest);
  }, [currentControls?.processorWiseSuccessRates, merchantConnectors]);

  const transactionDistributionData = useMemo(() => {
    if (!currentControls?.processorWiseSuccessRates) {
      return [];
    }
    return Object.keys(currentControls.processorWiseSuccessRates)
      .map((processorId) => {
        const stats = currentControls.processorWiseSuccessRates[processorId];
        const connectorInfo = merchantConnectors.find(
          (mc) => (mc.merchant_connector_id || mc.connector_name) === processorId
        );
        const processorName = connectorInfo ? connectorInfo.connector_name : processorId;
        return {
          name: processorName,
          value: stats.volumeShare,
          fill: '',
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [currentControls?.processorWiseSuccessRates, merchantConnectors]);

  const getAllNamesFromConnectors = (connectors) => {
    if (!connectors || connectors.length === 0) {
      return [];
    }
    return connectors.map((connector) => connector.connector_name).sort();
  };

  const uniqueNames = getAllNamesFromConnectors(merchantConnectors);

  const nameColorMap = useMemo(() => {
    const map = new Map();
    uniqueNames.forEach((name, i) => {
      map.set(name, CHART_COLORS[i % CHART_COLORS.length]);
    });
    return map;
  }, [uniqueNames]);

  const hasDistributionData = transactionDistributionData.length > 0;
  const hasEnoughDataForChart = overallSuccessRateHistory.length >= 1;

  return (
    <div className="space-y-6 flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 pl-6 pr-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Processed</h3>
            <ListChecks className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {processedPayments.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              of {currentControls?.totalPayments?.toLocaleString() || 'N/A'} target
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 pl-6 pr-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Successful</h3>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSuccessful.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {processedPayments > 0
                ? `${((totalSuccessful / processedPayments) * 100).toFixed(1)}% of processed`
                : '0.0%'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 pl-6 pr-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Total Failed</h3>
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="p-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalFailed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {processedPayments > 0
                ? `${((totalFailed / processedPayments) * 100).toFixed(1)}% of processed`
                : '0.0%'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2 pt-6 pl-6 pr-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Overall Success Rate</h3>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col p-6">
            <div className="text-4xl font-bold text-primary">{overallSR.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Based on current simulation parameters
            </p>
            {hasEnoughDataForChart ? (
              <div className="h-[80px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overallSuccessRateHistory} margin={{ top: 5, right: 0, left: -55, bottom: 0 }}>
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      stroke="#6b7280"
                      tick={{ fontSize: 10 }}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#f3f4f6',
                        fontSize: '0.75rem',
                      }}
                      itemStyle={{ color: '#f3f4f6' }}
                      labelFormatter={() => 'Progress'}
                      formatter={(value) => [`${value.toFixed(1)}%`, 'Overall SR']}
                    />
                    <Line
                      type="monotone"
                      dataKey="overallSR"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[80px] w-full mt-2 flex items-center justify-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Run simulation to see trend.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="pt-6 pl-6 pr-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
            <PieChartIcon className="mr-2 h-6 w-6 text-primary" /> Transaction Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Processor-wise distribution of transactions.
          </p>
        </div>
        <div className="flex items-center justify-center h-[300px] p-6">
          {hasDistributionData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Legend
                  wrapperStyle={{ color: '#374151', fontSize: '12px', paddingTop: '10px' }}
                />
                <Pie
                  data={transactionDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  fontSize={12}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {transactionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={nameColorMap.get(entry.name)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <PieChartIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chart data will appear here after simulation.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="pt-6 pl-6 pr-6">
          <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
            <BarChart3 className="mr-2 h-6 w-6 text-primary" /> Connector-wise Stats
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Success and failure data per connector, with detailed breakdown.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {processorSRData.length > 0 ? (
              processorSRData.map((item) => {
                const failedPaymentCount = item.totalPaymentCount - item.successfulPaymentCount;
                return (
                  <div key={item.processor} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center p-4">
                      <span className="font-medium text-gray-900 dark:text-white">{item.processor}</span>
                      <span
                        className={`font-semibold ${
                          item.sr >= 70
                            ? 'text-green-500'
                            : item.sr >= 40
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        Success Rate: {item.sr.toFixed(1)}%
                      </span>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-3 gap-2 text-xs p-2 border rounded-md bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <div className="font-medium text-center text-gray-700 dark:text-gray-300">
                            Total Payments:
                          </div>
                          <div className="text-center text-gray-900 dark:text-white">
                            {item.totalPaymentCount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600 text-center">Successful Payments:</div>
                          <div className="text-green-600 text-center">
                            {item.successfulPaymentCount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-red-600 text-center">Failed Payments:</div>
                          <div className="text-red-600 text-center">{failedPaymentCount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No connector data available. Run a simulation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionEngineStats;

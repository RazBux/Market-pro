import React, { useMemo, useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GET_FINANCIAL_DATA = gql`
  query GetFinancialData($tableName: String!, $columns: [String!]!, $limit: String!) {
    customQuery(tableName: $tableName, columns: $columns, limit: $limit) {
      data
    }
  }
`;

const GET_COMPANIES = gql`
  query GetCompanies {
    dbTables {
      tables
    }
  }
`;

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#387908",
  "#ff0000",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
];

// Available metric bundles
const METRIC_BUNDLES = [
  {
    id: "revenue_profit",
    label: "Revenue & Profit",
    metrics: ["totalRevenue", "grossProfit", "netIncome"],
  },
  {
    id: "operating_view",
    label: "Operating View",
    metrics: ["totalRevenue", "operatingIncome", "operatingExpenses"],
  },
  {
    id: "profitability",
    label: "Profitability",
    metrics: ["grossProfit", "operatingIncome", "netIncome"],
  },
  {
    id: "rnd_focus",
    label: "R&D Focus",
    metrics: ["totalRevenue", "researchAndDevelopment", "operatingExpenses"],
  },
];

// All available metrics
const ALL_METRICS = [
  { value: 'totalRevenue', label: 'Total Revenue' },
  { value: 'grossProfit', label: 'Gross Profit' },
  { value: 'operatingIncome', label: 'Operating Income' },
  { value: 'operatingExpenses', label: 'Operating Expenses' },
  { value: 'netIncome', label: 'Net Income' },
  { value: 'ebitda', label: 'EBITDA' },
  { value: 'researchAndDevelopment', label: 'R&D' },
];

function formatCategoryLabel(s) {
  if (!s) return "";
  // Convert camelCase to Title Case
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
}

function formatYAxis(value) {
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value}`;
}

function processFinancialData(data) {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => {
    const processed = { name: item.fiscalDateEnding || '' };
    Object.keys(item).forEach(key => {
      if (key !== 'fiscalDateEnding' && key !== 'symbol' && key !== '__typename') {
        const value = parseFloat(item[key]);
        if (!isNaN(value)) {
          processed[key] = value;
        }
      }
    });
    return processed;
  }).reverse(); // Reverse to show chronological order
}

function useIsMobile(breakpointPx = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);

  return isMobile;
}

// Extract unique company symbols from table names
function extractCompaniesFromTables(tables) {
  if (!tables || !Array.isArray(tables)) return [];
  
  const companySet = new Set();
  const pattern = /^income_statement_([A-Z]+)_(quarterly|annual)$/;
  
  tables.forEach(tableName => {
    const match = tableName.match(pattern);
    if (match && match[1]) {
      companySet.add(match[1]);
    }
  });
  
  return Array.from(companySet).sort().map(symbol => ({
    value: symbol,
    label: symbol
  }));
}

export default function AnalysisView({ darkTheme, selectedCompany }) {
  const [company, setCompany] = useState(selectedCompany || 'AAPL');
  const [period, setPeriod] = useState('quarterly');
  const [selectedMetrics, setSelectedMetrics] = useState(['totalRevenue', 'grossProfit', 'netIncome']);
  const [limitType, setLimitType] = useState('20');
  
  const isMobile = useIsMobile(640);

  // Fetch available companies from database
  const { data: companiesData, loading: companiesLoading, error: companiesError } = useQuery(GET_COMPANIES);

  // Extract companies from table names
  const companies = useMemo(() => {
    const tables = companiesData?.dbTables?.tables || [];
    return extractCompaniesFromTables(tables);
  }, [companiesData]);

  // Update company if it's not in the list and list is loaded
  useEffect(() => {
    if (companies.length > 0 && !companies.find(c => c.value === company)) {
      setCompany(companies[0].value);
    }
  }, [companies, company]);

  // Build table name and columns
  const tableName = `income_statement_${company}_${period}`;
  const columns = ['symbol', 'fiscalDateEnding', ...selectedMetrics];

  // Query financial data
  const { loading, error, data, refetch } = useQuery(GET_FINANCIAL_DATA, {
    variables: {
      tableName: tableName,
      columns: columns,
      limit: limitType
    },
    errorPolicy: 'all',
    skip: !company // Don't query until we have a company
  });

  useEffect(() => {
    if (company) {
      refetch();
    }
  }, [company, period, selectedMetrics, limitType, refetch]);

  const financialData = data?.customQuery?.map(item => item.data) || [];
  const processedData = useMemo(() => processFinancialData(financialData), [financialData]);

  const [activeBundle, setActiveBundle] = useState(null);

  const applyBundle = (bundleId, metrics) => {
    setSelectedMetrics(metrics);
    setActiveBundle(bundleId);
  };

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      } else {
        return [...prev, metric];
      }
    });
    setActiveBundle(null); // Clear active bundle when manually toggling metrics
  };

  // Theme styles
  const gridStroke = darkTheme ? "#374151" : "#e5e7eb";
  const axisTickFill = darkTheme ? "#e5e7eb" : "#374151";
  const tooltipBg = darkTheme ? "#111827" : "#ffffff";
  const tooltipBorder = darkTheme ? "#374151" : "#e5e7eb";
  const tooltipText = darkTheme ? "#e5e7eb" : "#111827";

  const chartHeight = isMobile ? 360 : 520;
  const xInterval = isMobile ? "preserveStartEnd" : 0;
  const xTickFont = isMobile ? 10 : 12;
  const yTickFont = isMobile ? 10 : 12;
  const yWidth = isMobile ? 70 : 90;

  const margin = isMobile
    ? { top: 0, right: 0, left: 0, bottom: 0 }
    : { top: 10, right: 19, left: 0, bottom: 10 };

  const legendProps = isMobile
    ? {
        verticalAlign: "bottom",
        align: "center",
        wrapperStyle: { paddingTop: 8, color: axisTickFill, fontSize: 11 },
      }
    : {
        verticalAlign: "top",
        align: "right",
        wrapperStyle: { color: axisTickFill },
      };

  return (
    <div className="flex flex-col w-full overflow-auto max-w-6xl mx-auto mt-6 px-3 sm:px-0">
      {/* Controls */}
      <div
        className="flex flex-col sm:flex-row p-4 sm:flex-wrap items-stretch sm:items-center justify-between gap-3 mb-4 rounded-2xl shadow-sm border"
        style={darkTheme ? { 
          backgroundColor: '#1f2937', 
          borderColor: '#374151',
          color: '#f3f4f6' 
        } : { 
          backgroundColor: '#ffffff', 
          borderColor: '#e5e7eb' 
        }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          {/* Company Selector */}
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={darkTheme ? {
              backgroundColor: '#374151',
              color: '#f3f4f6',
              borderColor: '#4b5563'
            } : {
              backgroundColor: '#f9fafb',
              color: '#111827',
              borderColor: '#d1d5db'
            }}
            disabled={companiesLoading}
          >
            {companiesLoading && <option>Loading companies...</option>}
            {companiesError && <option>Error loading companies</option>}
            {!companiesLoading && !companiesError && companies.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={darkTheme ? {
              backgroundColor: '#374151',
              color: '#f3f4f6',
              borderColor: '#4b5563'
            } : {
              backgroundColor: '#f9fafb',
              color: '#111827',
              borderColor: '#d1d5db'
            }}
          >
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>

          {/* Limit Selector */}
          <select
            value={limitType}
            onChange={(e) => setLimitType(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium border"
            style={darkTheme ? {
              backgroundColor: '#374151',
              color: '#f3f4f6',
              borderColor: '#4b5563'
            } : {
              backgroundColor: '#f9fafb',
              color: '#111827',
              borderColor: '#d1d5db'
            }}
          >
            <option value="4">Last 4 periods</option>
            <option value="8">Last 8 periods</option>
            <option value="12">Last 12 periods</option>
            <option value="20">Last 20 periods</option>
            <option value="1000">All periods</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div
        className="rounded-xl border shadow-md p-2 sm:p-4 mb-4"
        style={darkTheme ? {
          backgroundColor: '#1f2937',
          borderColor: '#374151'
        } : {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb'
        }}
      >
        {(loading || companiesLoading) && (
          <p className="text-center py-8" style={{ color: axisTickFill }}>
            Loading financial data...
          </p>
        )}
        
        {(error || companiesError) && (
          <p className="text-center py-8 text-red-600">
            Error loading data: {error?.message || companiesError?.message}
          </p>
        )}

        {!loading && !companiesLoading && !error && !companiesError && processedData.length > 0 && (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ReLineChart data={processedData} margin={margin}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              
              <XAxis
                dataKey="name"
                tick={{ fill: axisTickFill, fontSize: xTickFont }}
                tickMargin={8}
                interval={xInterval}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 80 : 30}
              />

              <YAxis
                width={yWidth}
                tick={{ fill: axisTickFill, fontSize: yTickFont }}
                tickFormatter={formatYAxis}
                tickMargin={8}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  color: tooltipText,
                  borderRadius: 12,
                }}
                labelStyle={{ color: tooltipText, fontSize: isMobile ? 12 : 13 }}
                itemStyle={{ color: tooltipText, fontSize: isMobile ? 12 : 13 }}
                formatter={(value) => formatYAxis(value)}
              />

              <Legend {...legendProps} />

              {selectedMetrics.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  name={formatCategoryLabel(metric)}
                  stroke={colors[index % colors.length]}
                  dot={false}
                  strokeWidth={isMobile ? 2 : 2.5}
                  isAnimationActive={!isMobile}
                />
              ))}
            </ReLineChart>
          </ResponsiveContainer>
        )}

        {!loading && !companiesLoading && !error && !companiesError && processedData.length === 0 && (
          <p className="text-center py-8" style={{ color: axisTickFill }}>
            No data available for {company} ({period})
          </p>
        )}
      </div>

      {/* Metric Selection */}
      <div
        className="rounded-xl border shadow-md p-3 sm:p-4"
        style={darkTheme ? {
          backgroundColor: '#1f2937',
          borderColor: '#374151'
        } : {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb'
        }}
      >
        {/* Bundles */}
        <div className="mb-4">
          <h3
            className="font-extrabold text-xl mb-2"
            style={{ color: darkTheme ? '#f3f4f6' : '#111827' }}
          >
            Quick Views
          </h3>
          <div className="flex flex-wrap gap-2">
            {METRIC_BUNDLES.map((bundle) => {
              const isActive = activeBundle === bundle.id;
              return (
                <button
                  key={bundle.id}
                  onClick={() => applyBundle(bundle.id, bundle.metrics)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold transition"
                  style={
                    isActive
                      ? {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: '2px solid #3b82f6',
                        }
                      : darkTheme
                      ? {
                          backgroundColor: '#374151',
                          color: '#f3f4f6',
                          border: '2px solid transparent',
                        }
                      : {
                          backgroundColor: '#f3f4f6',
                          color: '#374151',
                          border: '2px solid transparent',
                        }
                  }
                >
                  {bundle.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="mb-4">
          <h3
            className="font-extrabold text-xl mb-2"
            style={{ color: darkTheme ? '#f3f4f6' : '#111827' }}
          >
            Metrics
          </h3>
          <div className="flex flex-wrap gap-2">
            {ALL_METRICS.map((metric) => (
              <button
                key={metric.value}
                onClick={() => toggleMetric(metric.value)}
                className="px-3 py-2 rounded-xl text-sm font-semibold transition"
                style={
                  selectedMetrics.includes(metric.value)
                    ? darkTheme
                      ? {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: '1px solid #3b82f6',
                        }
                      : {
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: '1px solid #3b82f6',
                        }
                    : darkTheme
                    ? {
                        backgroundColor: '#374151',
                        color: '#f3f4f6',
                        border: '1px solid #4b5563',
                      }
                    : {
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                      }
                }
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Metrics Display */}
        <div>
          <h3
            className="pl-1 font-bold mb-1"
            style={{ color: darkTheme ? '#e5e7eb' : '#374151' }}
          >
            Selected Metrics ({selectedMetrics.length}):
          </h3>
          {selectedMetrics.length > 0 ? (
            <ul
              className="pb-1 pl-2 font-serif"
              style={{ color: darkTheme ? '#e5e7eb' : '#374151' }}
            >
              {selectedMetrics.map((metric) => (
                <li key={metric} className="list-disc ml-5">
                  {formatCategoryLabel(metric)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic pl-1">
              No metrics selected. Click metrics above to add them.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
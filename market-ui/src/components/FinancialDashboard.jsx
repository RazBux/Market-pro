import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

// ===== GRAPHQL QUERIES =====

const GET_FINANCIAL_DATA = gql`
  query GetFinancialData($tableName: String!, $columns: [String!]!, $limit: String) {
    customQuery(tableName: $tableName, columns: $columns, limit: $limit) {
      data
    }
  }
`;

// const GET_ALL_TABLES = gql`
//   query GetAllTables {
//     tables {
//       tables
//     }
//   }
// `;

// const COMPARE_COMPANIES = gql`
//   query CompareCompanies($companies: [String!]!, $period: String!, $columns: [String!]!) {
//     compareCompanies(companies: $companies, period: $period, columns: $columns) {
//       data
//     }
//   }
// `;

// ===== UTILITY FUNCTIONS =====

const formatCurrency = (value) => {
    if (!value || value === 'None' || value === null) return '$0';
    const num = parseFloat(value);
    if (isNaN(num)) return '$0';

    if (Math.abs(num) >= 1000000000) {
        return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (Math.abs(num) >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    } else if (Math.abs(num) >= 1000) {
        return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toLocaleString()}`;
};

// const formatPercentage = (value) => {
//     if (!value || value === 'None' || value === null || isNaN(value)) return '0%';
//     return `${parseFloat(value).toFixed(2)}%`;
// };

// const parseValue = (value) => {
//     if (!value || value === 'None' || value === null) return 0;
//     return parseFloat(value) / 1000000; // Convert to millions
// };

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
};

// const getCompanyName = (symbol) => {
//     const names = {
//         AAPL: 'Apple Inc.',
//         ENPH: 'Enphase Energy',
//         MNDY: 'Monday.com',
//         SEDG: 'SolarEdge Technologies'
//     };
//     return names[symbol] || symbol;
// };

const getCompanyName = (symbol) => {
    const names = {
        AAPL: 'Apple Inc.',
        MSFT: 'Microsoft Corporation',
        GOOG: 'Alphabet Inc. (Google)',
        NVDA: 'NVIDIA Corporation',
        TSLA: 'Tesla Inc.',
        AMD: 'Advanced Micro Devices',
        QCOM: 'Qualcomm Inc.',
        ENPH: 'Enphase Energy',
        SEDG: 'SolarEdge Technologies',
        FSLR: 'First Solar Inc.',
        MNDY: 'Monday.com Ltd.'
    };
    return names[symbol] || symbol;
};

const calculateTrend = (data, field) => {
    if (!data || data.length < 2) return 0;
    const current = parseFloat(data[0]?.[field]) || 0;
    const previous = parseFloat(data[1]?.[field]) || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

const calculateMargin = (numerator, denominator) => {
    const num = parseFloat(numerator) || 0;
    const denom = parseFloat(denominator) || 0;
    if (denom === 0) return 0;
    return (num / denom) * 100;
};

const calculateCAGR = (data, field) => {
    if (!data || data.length < 2) return 0;
    const startValue = parseFloat(data[data.length - 1]?.[field]) || 0;
    const endValue = parseFloat(data[0]?.[field]) || 0;
    const periods = data.length - 1;

    if (startValue <= 0 || endValue <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
};

// ===== MAIN COMPONENT =====

export default function FinancialDashboard() {
    const [darkTheme, setDarkTheme] = useState(true); // Default to dark mode
    const [selectedCompany, setSelectedCompany] = useState('AAPL');
    const [period, setPeriod] = useState('quarterly');
    const [limitType, setLimitType] = useState('all'); // 'all', '4', '8', '20', 'custom'
    const [customLimit, setCustomLimit] = useState('12');
    const [view, setView] = useState('overview');
    const [profitabilityView, setProfitabilityView] = useState('margins'); // 'margins', 'efficiency', 'returns'
    const [selectedCompanies, setSelectedCompanies] = useState(['AAPL', 'ENPH']);

    // Calculate actual limit to use
    const getActualLimit = () => {
        if (limitType === 'all') return '1000'; // Large number to get all available
        if (limitType === 'custom') return customLimit;
        return limitType;
    };

    const tableName = `income_statement_${selectedCompany}_${period}`;

    // Columns to fetch - only using columns that exist in the database
    const columns = [
        "symbol",
        "fiscalDateEnding",
        "totalRevenue",
        "grossProfit",
        "operatingIncome",
        "operatingExpenses",
        "netIncome",
        "ebitda",
        "researchAndDevelopment"
    ];

    const { loading, error, data, refetch } = useQuery(GET_FINANCIAL_DATA, {
        variables: {
            tableName: tableName,
            columns: columns,
            limit: getActualLimit()
        },
        errorPolicy: 'all'
    });

    useEffect(() => {
        refetch();
    }, [selectedCompany, period, limitType, customLimit, refetch]);

    if (loading) return <LoadingScreen darkTheme={darkTheme} />;

    if (error) {
        console.error('GraphQL Error:', error);
        return <ErrorScreen error={error} tableName={tableName} columns={columns} darkTheme={darkTheme} />;
    }

    const financialData = data?.customQuery?.map(item => item.data) || [];

    if (financialData.length === 0) {
        return <NoDataScreen tableName={tableName} darkTheme={darkTheme} />;
    }

    const latestData = financialData[0] || {};

    return (
        <div style={darkTheme ? styles.containerDark : styles.container}>
            <ControlPanel
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                period={period}
                setPeriod={setPeriod}
                limitType={limitType}
                setLimitType={setLimitType}
                customLimit={customLimit}
                setCustomLimit={setCustomLimit}
                darkTheme={darkTheme}
                setDarkTheme={setDarkTheme}
                view={view}
                setView={setView}
            />

            {view === 'overview' && (
                <OverviewView
                    latestData={latestData}
                    financialData={financialData}
                    company={selectedCompany}
                    darkTheme={darkTheme}
                    profitabilityView={profitabilityView}
                    setProfitabilityView={setProfitabilityView}
                />
            )}

            {view === 'detailed' && (
                <DetailedView 
                    financialData={financialData} 
                    darkTheme={darkTheme}
                    columns={columns}
                />
            )}

            {view === 'comparison' && (
                <ComparisonView 
                    darkTheme={darkTheme}
                    period={period}
                    selectedCompanies={selectedCompanies}
                    setSelectedCompanies={setSelectedCompanies}
                    limit={getActualLimit()}
                />
            )}
        </div>
    );
}

// ===== SUB-COMPONENTS =====

function ControlPanel({ 
    selectedCompany, setSelectedCompany, period, setPeriod, 
    limitType, setLimitType, customLimit, setCustomLimit,
    darkTheme, setDarkTheme, view, setView 
}) {
// const companies = [
//     { value: 'AAPL', label: '🍎 Apple Inc.' },
//     { value: 'ENPH', label: '⚡ Enphase Energy' },
//     { value: 'MNDY', label: '💼 Monday.com' },
//     { value: 'SEDG', label: '☀️ SolarEdge' },
// ];
const companies = [
        { value: 'AAPL', label: '🍎 Apple' },
        { value: 'MSFT', label: '💻 Microsoft' },
        { value: 'GOOG', label: '🔍 Google' },
        { value: 'NVDA', label: '🎮 NVIDIA' },
        { value: 'TSLA', label: '🚗 Tesla' },
        { value: 'AMD', label: '⚡ AMD' },
        { value: 'QCOM', label: '📱 Qualcomm' },
        { value: 'ENPH', label: '☀️ Enphase' },
        { value: 'SEDG', label: '🔋 SolarEdge' },
        { value: 'FSLR', label: '🌞 First Solar' },
        { value: 'MNDY', label: '💼 Monday.com' }
    ];

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'detailed', label: '📈 Detailed' },
        { id: 'comparison', label: '⚖️ Compare' }
    ];

    return (
        <div style={darkTheme ? styles.unifiedToolbarDark : styles.unifiedToolbar}>
            {/* Left Side - View Tabs */}
            <div style={styles.toolbarLeft}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        style={{
                            ...(darkTheme ? styles.viewTabDark : styles.viewTab),
                            ...(view === tab.id ? (darkTheme ? styles.viewTabActiveDark : styles.viewTabActive) : {})
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Right Side - Controls */}
            <div style={styles.toolbarRight}>
                {/* Company Selector */}
                <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    style={darkTheme ? styles.toolbarSelectDark : styles.toolbarSelect}
                >
                    {companies.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>

                {/* Period Selector */}
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    style={darkTheme ? styles.toolbarSelectDark : styles.toolbarSelect}
                >
                    <option value="quarterly">📅 Quarterly</option>
                    <option value="annual">📆 Annual</option>
                </select>

                {/* Limit Type Selector */}
                <select
                    value={limitType}
                    onChange={(e) => setLimitType(e.target.value)}
                    style={darkTheme ? styles.toolbarSelectDark : styles.toolbarSelect}
                >
                    <option value="all">All Periods</option>
                    <option value="4">4 Periods</option>
                    <option value="8">8 Periods</option>
                    <option value="20">20 Periods</option>
                    <option value="custom">Custom...</option>
                </select>

                {/* Custom Limit Input */}
                {limitType === 'custom' && (
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={customLimit}
                        onChange={(e) => setCustomLimit(e.target.value)}
                        placeholder="# periods"
                        style={darkTheme ? styles.customInputDark : styles.customInput}
                    />
                )}

                {/* Dark Mode Toggle */}
                <button
                    onClick={() => setDarkTheme(!darkTheme)}
                    style={darkTheme ? styles.darkModeToggleDark : styles.darkModeToggle}
                    title={darkTheme ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkTheme ? '☀️' : '🌙'}
                </button>
            </div>
        </div>
    );
}

// ===== OVERVIEW VIEW =====

function OverviewView({ latestData, financialData, company, darkTheme, profitabilityView, setProfitabilityView }) {
    return (
        <div>
            <div style={styles.metricsGrid}>
                <MetricCard
                    title="Total Revenue"
                    value={latestData.totalRevenue}
                    trend={calculateTrend(financialData, 'totalRevenue')}
                    color="#3b82f6"
                    icon="💰"
                    darkTheme={darkTheme}
                />
                <MetricCard
                    title="Net Income"
                    value={latestData.netIncome}
                    trend={calculateTrend(financialData, 'netIncome')}
                    color="#10b981"
                    icon="📈"
                    darkTheme={darkTheme}
                />
                <MetricCard
                    title="Gross Profit"
                    value={latestData.grossProfit}
                    trend={calculateTrend(financialData, 'grossProfit')}
                    color="#8b5cf6"
                    icon="💎"
                    darkTheme={darkTheme}
                />
                <MetricCard
                    title="EBITDA"
                    value={latestData.ebitda}
                    trend={calculateTrend(financialData, 'ebitda')}
                    color="#f59e0b"
                    icon="⚡"
                    darkTheme={darkTheme}
                />
            </div>

            <div style={styles.chartsContainer}>
                <RevenueChart data={financialData} darkTheme={darkTheme} />
                <ProfitabilityAnalysis 
                    data={financialData} 
                    latestData={latestData}
                    darkTheme={darkTheme}
                    view={profitabilityView}
                    setView={setProfitabilityView}
                />
            </div>

            <QuickStats data={financialData} latestData={latestData} darkTheme={darkTheme} />
        </div>
    );
}

function MetricCard({ title, value, trend, color, icon, darkTheme }) {
    const isPositive = trend >= 0;

    return (
        <div 
            style={darkTheme ? styles.metricCardDark : styles.metricCard}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={darkTheme ? styles.metricTitleDark : styles.metricTitle}>
                    {title}
                </div>
                <div style={{ fontSize: '1.5rem' }}>{icon}</div>
            </div>
            <div style={darkTheme ? styles.metricValueDark : styles.metricValue}>
                {formatCurrency(value)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                    color: isPositive ? '#10b981' : '#ef4444',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                }}>
                    {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(2)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: darkTheme ? '#94a3b8' : '#6b7280' }}>
                    vs prev period
                </span>
            </div>
        </div>
    );
}

function RevenueChart({ data, darkTheme }) {
    if (!data || data.length === 0) return null;

    const maxRevenue = Math.max(...data.map(d => parseFloat(d.totalRevenue) || 0));
    const displayData = data.slice(0, 12).reverse();

    return (
        <div style={darkTheme ? styles.chartCardDark : styles.chartCard}>
            <h3 style={darkTheme ? styles.chartTitleDark : styles.chartTitle}>
                Revenue Trend Analysis
            </h3>

            {/* Chart Info */}
            <div style={{ 
                marginBottom: '16px',
                padding: '12px',
                background: darkTheme ? '#0f172a' : '#f9fafb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '0.875rem', color: darkTheme ? '#94a3b8' : '#6b7280' }}>
                    Showing {displayData.length} periods
                </div>
                <div style={{ fontSize: '0.875rem', color: darkTheme ? '#94a3b8' : '#6b7280' }}>
                    Peak: {formatCurrency(maxRevenue)}
                </div>
            </div>

            {/* Chart Area */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '20px'
            }}>
                {displayData.map((item, index) => {
                    const revenue = parseFloat(item.totalRevenue) || 0;
                    const percentage = (revenue / maxRevenue) * 100;
                    const isPositiveGrowth = index > 0 && revenue > parseFloat(displayData[index - 1].totalRevenue || 0);

                    return (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {/* Date Label */}
                            <div style={{
                                minWidth: '80px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: darkTheme ? '#cbd5e1' : '#374151',
                                textAlign: 'right'
                            }}>
                                {formatDate(item.fiscalDateEnding)}
                            </div>

                            {/* Bar */}
                            <div style={{
                                flex: 1,
                                height: '32px',
                                background: darkTheme ? '#1e293b' : '#e5e7eb',
                                borderRadius: '6px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        background: isPositiveGrowth 
                                            ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                            : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                        borderRadius: '6px',
                                        transition: 'width 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        paddingLeft: '12px',
                                        minWidth: '60px'
                                    }}
                                >
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: 'white',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {formatCurrency(revenue)}
                                    </span>
                                </div>
                            </div>

                            {/* Growth Indicator */}
                            {index > 0 && (
                                <div style={{
                                    minWidth: '60px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: isPositiveGrowth ? '#10b981' : '#ef4444',
                                    textAlign: 'left'
                                }}>
                                    {isPositiveGrowth ? '↑' : '↓'} {Math.abs(
                                        ((revenue - parseFloat(displayData[index - 1].totalRevenue || 0)) / 
                                        parseFloat(displayData[index - 1].totalRevenue || 1)) * 100
                                    ).toFixed(1)}%
                                </div>
                            )}
                            {index === 0 && <div style={{ minWidth: '60px' }}></div>}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                gap: '24px',
                justifyContent: 'center',
                paddingTop: '16px',
                borderTop: `1px solid ${darkTheme ? '#334155' : '#e5e7eb'}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        borderRadius: '4px'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', color: darkTheme ? '#94a3b8' : '#6b7280' }}>
                        Growth
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        borderRadius: '4px'
                    }}></div>
                    <span style={{ fontSize: '0.875rem', color: darkTheme ? '#94a3b8' : '#6b7280' }}>
                        Decline
                    </span>
                </div>
            </div>
        </div>
    );
}

function ProfitabilityAnalysis({ data, latestData, darkTheme, view, setView }) {
    const viewOptions = [
        { id: 'margins', label: '📊 Margins', icon: '📊' },
        { id: 'efficiency', label: '⚙️ Efficiency', icon: '⚙️' },
        { id: 'returns', label: '💹 Returns', icon: '💹' },
        { id: 'trends', label: '📈 Trends', icon: '📈' }
    ];

    const grossMargin = calculateMargin(latestData.grossProfit, latestData.totalRevenue);
    const operatingMargin = calculateMargin(latestData.operatingIncome, latestData.totalRevenue);
    const netMargin = calculateMargin(latestData.netIncome, latestData.totalRevenue);
    const ebitdaMargin = calculateMargin(latestData.ebitda, latestData.totalRevenue);

    const opexRatio = calculateMargin(latestData.operatingExpenses, latestData.totalRevenue);
    const rdRatio = calculateMargin(latestData.researchAndDevelopment, latestData.totalRevenue);

    const revenueCAGR = calculateCAGR(data, 'totalRevenue');
    const netIncomeCAGR = calculateCAGR(data, 'netIncome');
    const grossProfitCAGR = calculateCAGR(data, 'grossProfit');

    return (
        <div style={darkTheme ? styles.chartCardDark : styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={darkTheme ? styles.chartTitleDark : styles.chartTitle}>
                    Profitability Analysis
                </h3>
                <div style={styles.viewSelector}>
                    {viewOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setView(option.id)}
                            style={{
                                ...(darkTheme ? styles.viewButtonDark : styles.viewButton),
                                ...(view === option.id ? (darkTheme ? styles.viewButtonActiveDark : styles.viewButtonActive) : {})
                            }}
                            title={option.label}
                        >
                            {option.icon}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'margins' && (
                <div style={styles.metricsContainer}>
                    <ProfitMetric 
                        label="Gross Margin" 
                        value={grossMargin} 
                        color="#10b981"
                        darkTheme={darkTheme}
                        description="Revenue after COGS"
                    />
                    <ProfitMetric 
                        label="Operating Margin" 
                        value={operatingMargin} 
                        color="#3b82f6"
                        darkTheme={darkTheme}
                        description="Operational efficiency"
                    />
                    <ProfitMetric 
                        label="Net Margin" 
                        value={netMargin} 
                        color="#8b5cf6"
                        darkTheme={darkTheme}
                        description="Bottom line profitability"
                    />
                    <ProfitMetric 
                        label="EBITDA Margin" 
                        value={ebitdaMargin} 
                        color="#f59e0b"
                        darkTheme={darkTheme}
                        description="Cash generation capability"
                    />
                </div>
            )}

            {view === 'efficiency' && (
                <div style={styles.metricsContainer}>
                    <ProfitMetric 
                        label="Operating Expense %" 
                        value={opexRatio} 
                        color="#f97316"
                        darkTheme={darkTheme}
                        description="Operating costs efficiency"
                        inverse={true}
                    />
                    <ProfitMetric 
                        label="R&D Investment %" 
                        value={rdRatio} 
                        color="#06b6d4"
                        darkTheme={darkTheme}
                        description="Innovation investment"
                    />
                    <ProfitMetric 
                        label="Operating Margin %" 
                        value={operatingMargin} 
                        color="#8b5cf6"
                        darkTheme={darkTheme}
                        description="Operating profitability"
                    />
                    <ProfitMetric 
                        label="Gross Margin %" 
                        value={grossMargin} 
                        color="#10b981"
                        darkTheme={darkTheme}
                        description="Gross profitability"
                    />
                </div>
            )}

            {view === 'returns' && (
                <div style={styles.metricsContainer}>
                    <ProfitMetric 
                        label="Net Profit Margin" 
                        value={netMargin} 
                        color="#10b981"
                        darkTheme={darkTheme}
                        description="Net profit efficiency"
                    />
                    <ProfitMetric 
                        label="Gross Profit Margin" 
                        value={grossMargin} 
                        color="#3b82f6"
                        darkTheme={darkTheme}
                        description="Gross profit efficiency"
                    />
                    <ProfitMetric 
                        label="Operating Leverage" 
                        value={(parseFloat(latestData.operatingIncome) / parseFloat(latestData.operatingExpenses || 1)).toFixed(2)} 
                        color="#8b5cf6"
                        darkTheme={darkTheme}
                        description="Operating profit vs expenses"
                        isRatio={true}
                    />
                    <ProfitMetric 
                        label="EBITDA Coverage" 
                        value={(parseFloat(latestData.ebitda) / parseFloat(latestData.operatingExpenses || 1)).toFixed(2)} 
                        color="#f59e0b"
                        darkTheme={darkTheme}
                        description="Cash coverage of operations"
                        isRatio={true}
                    />
                </div>
            )}

            {view === 'trends' && (
                <div style={styles.metricsContainer}>
                    <ProfitMetric 
                        label="Revenue CAGR" 
                        value={revenueCAGR} 
                        color="#10b981"
                        darkTheme={darkTheme}
                        description="Compound annual growth rate"
                    />
                    <ProfitMetric 
                        label="Net Income CAGR" 
                        value={netIncomeCAGR} 
                        color="#3b82f6"
                        darkTheme={darkTheme}
                        description="Profit growth trajectory"
                    />
                    <ProfitMetric 
                        label="Gross Profit CAGR" 
                        value={grossProfitCAGR} 
                        color="#8b5cf6"
                        darkTheme={darkTheme}
                        description="Core profitability growth"
                    />
                    <ProfitMetric 
                        label="Margin Trend" 
                        value={calculateTrend(data, 'netIncome') - calculateTrend(data, 'totalRevenue')} 
                        color="#f59e0b"
                        darkTheme={darkTheme}
                        description="Profitability improvement"
                    />
                </div>
            )}
        </div>
    );
}

function ProfitMetric({ label, value, color, darkTheme, description, inverse = false, isRatio = false }) {
    const displayValue = isRatio ? `${value}x` : `${value.toFixed(2)}%`;
    // const numValue = parseFloat(value);
    // const isGood = inverse ? numValue < 50 : numValue > 0;

    return (
        <div style={{
            ...styles.profitMetric,
            background: darkTheme ? '#0f172a' : '#f9fafb',
            border: `2px solid ${darkTheme ? '#334155' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = color;
            e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = darkTheme ? '#334155' : '#e5e7eb';
            e.currentTarget.style.transform = 'scale(1)';
        }}
        >
            <div style={{ 
                fontSize: '0.875rem', 
                color: darkTheme ? '#94a3b8' : '#6b7280',
                marginBottom: '8px',
                fontWeight: '500'
            }}>
                {label}
            </div>
            <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700',
                color: color,
                marginBottom: '4px'
            }}>
                {displayValue}
            </div>
            <div style={{ 
                fontSize: '0.75rem', 
                color: darkTheme ? '#64748b' : '#9ca3af',
                lineHeight: '1.2'
            }}>
                {description}
            </div>
        </div>
    );
}

function QuickStats({ data, latestData, darkTheme }) {
    const avgRevenue = data.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0) / data.length;
    const avgNetIncome = data.reduce((sum, d) => sum + (parseFloat(d.netIncome) || 0), 0) / data.length;
    const revenueVolatility = calculateVolatility(data, 'totalRevenue');
    const profitVolatility = calculateVolatility(data, 'netIncome');

    return (
        <div style={darkTheme ? styles.quickStatsContainerDark : styles.quickStatsContainer}>
            <h3 style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
                📊 Period Statistics
            </h3>
            <div style={styles.statsGrid}>
                <StatItem 
                    label="Average Revenue" 
                    value={formatCurrency(avgRevenue)} 
                    darkTheme={darkTheme}
                />
                <StatItem 
                    label="Average Net Income" 
                    value={formatCurrency(avgNetIncome)} 
                    darkTheme={darkTheme}
                />
                <StatItem 
                    label="Revenue Volatility" 
                    value={`${revenueVolatility.toFixed(2)}%`} 
                    darkTheme={darkTheme}
                />
                <StatItem 
                    label="Profit Volatility" 
                    value={`${profitVolatility.toFixed(2)}%`} 
                    darkTheme={darkTheme}
                />
                <StatItem 
                    label="Periods Analyzed" 
                    value={data.length.toString()} 
                    darkTheme={darkTheme}
                />
                <StatItem 
                    label="Latest Period" 
                    value={formatDate(latestData.fiscalDateEnding)} 
                    darkTheme={darkTheme}
                />
            </div>
        </div>
    );
}

function calculateVolatility(data, field) {
    if (data.length < 2) return 0;
    const values = data.map(d => parseFloat(d[field]) || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return (stdDev / mean) * 100;
}

function StatItem({ label, value, darkTheme }) {
    return (
        <div style={darkTheme ? styles.statItemDark : styles.statItem}>
            <div style={darkTheme ? styles.statLabelDark : styles.statLabel}>{label}</div>
            <div style={darkTheme ? styles.statValueDark : styles.statValue}>{value}</div>
        </div>
    );
}

// ===== DETAILED VIEW =====

function DetailedView({ financialData, darkTheme, columns }) {
    // All available fields with their display names (only fields that exist in DB)
    const allFields = {
        fiscalDateEnding: 'Date',
        totalRevenue: 'Total Revenue',
        grossProfit: 'Gross Profit',
        operatingIncome: 'Operating Income',
        operatingExpenses: 'Operating Expenses',
        netIncome: 'Net Income',
        ebitda: 'EBITDA',
        researchAndDevelopment: 'R&D'
    };

    // Get all available fields from the data
    const availableFields = Object.keys(allFields).filter(field => 
        financialData.some(item => item[field] !== undefined && item[field] !== null && item[field] !== 'None')
    );

    return (
        <div style={darkTheme ? styles.detailedContainerDark : styles.detailedContainer}>
            <h2 style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
                📋 Detailed Financial Statements
            </h2>
            <p style={{ 
                color: darkTheme ? '#94a3b8' : '#6b7280',
                marginBottom: '20px',
                fontSize: '0.95rem'
            }}>
                Showing all {financialData.length} periods • {availableFields.length - 1} metrics tracked
            </p>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={darkTheme ? styles.tableHeaderRowDark : styles.tableHeaderRow}>
                            {availableFields.map(field => (
                                <th key={field} style={darkTheme ? styles.tableHeaderDark : styles.tableHeader}>
                                    {allFields[field]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {financialData.map((item, idx) => (
                            <tr 
                                key={idx} 
                                style={darkTheme ? styles.tableRowDark : styles.tableRow}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkTheme ? '#334155' : '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {availableFields.map(field => (
                                    <td key={field} style={darkTheme ? styles.tableCellDark : styles.tableCell}>
                                        {field === 'fiscalDateEnding' 
                                            ? formatDate(item[field])
                                            : formatCurrency(item[field])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Statistics Section */}
            <div style={{ marginTop: '30px' }}>
                <h3 style={darkTheme ? styles.chartTitleDark : styles.chartTitle}>
                    📊 Summary Statistics
                </h3>
                <div style={{ ...styles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    {availableFields.filter(f => f !== 'fiscalDateEnding' && f !== 'symbol').map(field => {
                        const values = financialData.map(d => parseFloat(d[field]) || 0);
                        const avg = values.reduce((a, b) => a + b, 0) / values.length;
                        const max = Math.max(...values);
                        const min = Math.min(...values);

                        return (
                            <div key={field} style={{
                                ...styles.statItem,
                                ...(darkTheme ? { background: '#0f172a', border: '1px solid #334155' } : {})
                            }}>
                                <div style={darkTheme ? styles.statLabelDark : styles.statLabel}>
                                    {allFields[field]}
                                </div>
                                <div style={darkTheme ? styles.statValueDark : styles.statValue}>
                                    Avg: {formatCurrency(avg)}
                                </div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: darkTheme ? '#64748b' : '#9ca3af',
                                    marginTop: '4px'
                                }}>
                                    Range: {formatCurrency(min)} - {formatCurrency(max)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}


function ComparisonView({ darkTheme, period, selectedCompanies, setSelectedCompanies, limit }) {
    const companies = ['AAPL', 'MSFT', 'GOOG', 'NVDA', 'TSLA', 'AMD', 'QCOM', 'ENPH', 'SEDG', 'FSLR', 'MNDY'];
    const [comparisonMetric, setComparisonMetric] = useState('revenue');

    const metricOptions = [
        { id: 'revenue', label: 'Revenue Analysis' },
        { id: 'profitability', label: 'Profitability' },
        { id: 'margins', label: 'Margin Comparison' },
        { id: 'growth', label: 'Growth Rates' },
        { id: 'efficiency', label: 'Operational Efficiency' }
    ];

    const toggleCompany = (company) => {
        if (selectedCompanies.includes(company)) {
            if (selectedCompanies.length > 1) {
                setSelectedCompanies(selectedCompanies.filter(c => c !== company));
            }
        } else {
            setSelectedCompanies([...selectedCompanies, company]);
        }
    };

    return (
        <div style={darkTheme ? styles.comparisonContainerDark : styles.comparisonContainer}>
            <h2 style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
                ⚖️ Company Comparison Analysis
            </h2>

            {/* Company Selection */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    fontSize: '0.875rem',
                    color: darkTheme ? '#94a3b8' : '#6b7280',
                    marginBottom: '12px',
                    fontWeight: '500'
                }}>
                    Select Companies to Compare (min 2):
                </div>
                <div style={styles.companyButtons}>
                    {companies.map(company => (
                        <button
                            key={company}
                            onClick={() => toggleCompany(company)}
                            style={{
                                ...(darkTheme ? styles.companyButtonDark : styles.companyButton),
                                ...(selectedCompanies.includes(company)
                                    ? (darkTheme ? styles.companyButtonActiveDark : styles.companyButtonActive)
                                    : {})
                            }}
                        >
                            {getCompanyName(company)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Selection */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    fontSize: '0.875rem',
                    color: darkTheme ? '#94a3b8' : '#6b7280',
                    marginBottom: '12px',
                    fontWeight: '500'
                }}>
                    Comparison Type:
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {metricOptions.map(option => (
                        <button
                            key={option.id}
                            onClick={() => setComparisonMetric(option.id)}
                            style={{
                                ...(darkTheme ? styles.companyButtonDark : styles.companyButton),
                                ...(comparisonMetric === option.id
                                    ? (darkTheme ? styles.companyButtonActiveDark : styles.companyButtonActive)
                                    : {})
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparison Grid */}
            <div style={styles.comparisonGrid}>
                {selectedCompanies.map(company => (
                    <CompanyComparisonCard
                        key={company}
                        company={company}
                        period={period}
                        darkTheme={darkTheme}
                        metric={comparisonMetric}
                        limit={limit}
                    />
                ))}
            </div>

            {/* Relative Performance Section */}
            {selectedCompanies.length > 1 && (
                <RelativePerformance
                    companies={selectedCompanies}
                    period={period}
                    darkTheme={darkTheme}
                    metric={comparisonMetric}
                    limit={limit}
                />
            )}
        </div>
    );
}

// old
// ===== COMPARISON VIEW =====

// function ComparisonView({ darkTheme, period, selectedCompanies, setSelectedCompanies, limit }) {
//     const companies = ['AAPL', 'ENPH', 'MNDY', 'SEDG'];
//     const [comparisonMetric, setComparisonMetric] = useState('revenue');

//     const metricOptions = [
//         { id: 'revenue', label: 'Revenue Analysis' },
//         { id: 'profitability', label: 'Profitability' },
//         { id: 'margins', label: 'Margin Comparison' },
//         { id: 'growth', label: 'Growth Rates' },
//         { id: 'efficiency', label: 'Operational Efficiency' }
//     ];

//     const toggleCompany = (company) => {
//         if (selectedCompanies.includes(company)) {
//             if (selectedCompanies.length > 1) {
//                 setSelectedCompanies(selectedCompanies.filter(c => c !== company));
//             }
//         } else {
//             setSelectedCompanies([...selectedCompanies, company]);
//         }
//     };

//     return (
//         <div style={darkTheme ? styles.comparisonContainerDark : styles.comparisonContainer}>
//             <h2 style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
//                 ⚖️ Company Comparison Analysis
//             </h2>

//             {/* Company Selection */}
//             <div style={{ marginBottom: '24px' }}>
//                 <div style={{ 
//                     fontSize: '0.875rem', 
//                     color: darkTheme ? '#94a3b8' : '#6b7280',
//                     marginBottom: '12px',
//                     fontWeight: '500'
//                 }}>
//                     Select Companies to Compare (min 2):
//                 </div>
//                 <div style={styles.companyButtons}>
//                     {companies.map(company => (
//                         <button
//                             key={company}
//                             onClick={() => toggleCompany(company)}
//                             style={{
//                                 ...(darkTheme ? styles.companyButtonDark : styles.companyButton),
//                                 ...(selectedCompanies.includes(company) 
//                                     ? (darkTheme ? styles.companyButtonActiveDark : styles.companyButtonActive) 
//                                     : {})
//                             }}
//                         >
//                             {getCompanyName(company)}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Metric Selection */}
//             <div style={{ marginBottom: '24px' }}>
//                 <div style={{ 
//                     fontSize: '0.875rem', 
//                     color: darkTheme ? '#94a3b8' : '#6b7280',
//                     marginBottom: '12px',
//                     fontWeight: '500'
//                 }}>
//                     Comparison Type:
//                 </div>
//                 <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//                     {metricOptions.map(option => (
//                         <button
//                             key={option.id}
//                             onClick={() => setComparisonMetric(option.id)}
//                             style={{
//                                 ...(darkTheme ? styles.companyButtonDark : styles.companyButton),
//                                 ...(comparisonMetric === option.id 
//                                     ? (darkTheme ? styles.companyButtonActiveDark : styles.companyButtonActive) 
//                                     : {})
//                             }}
//                         >
//                             {option.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Comparison Grid */}
//             <div style={styles.comparisonGrid}>
//                 {selectedCompanies.map(company => (
//                     <CompanyComparisonCard
//                         key={company}
//                         company={company}
//                         period={period}
//                         darkTheme={darkTheme}
//                         metric={comparisonMetric}
//                         limit={limit}
//                     />
//                 ))}
//             </div>

//             {/* Relative Performance Section */}
//             {selectedCompanies.length > 1 && (
//                 <RelativePerformance
//                     companies={selectedCompanies}
//                     period={period}
//                     darkTheme={darkTheme}
//                     metric={comparisonMetric}
//                     limit={limit}
//                 />
//             )}
//         </div>
//     );
// }

function CompanyComparisonCard({ company, period, darkTheme, metric, limit }) {
    const tableName = `income_statement_${company}_${period}`;
    const columns = [
        "fiscalDateEnding", "totalRevenue", "grossProfit", "operatingIncome",
        "netIncome", "ebitda", "operatingExpenses", "researchAndDevelopment"
    ];

    const { loading, error, data } = useQuery(GET_FINANCIAL_DATA, {
        variables: { tableName, columns, limit },
        errorPolicy: 'all'
    });

    if (loading) return <div style={darkTheme ? styles.comparisonCardDark : styles.comparisonCard}>Loading...</div>;
    if (error) return <div style={darkTheme ? styles.comparisonCardDark : styles.comparisonCard}>Error loading data</div>;

    const financialData = data?.customQuery?.map(item => item.data) || [];
    if (financialData.length === 0) return null;

    const latest = financialData[0];
    const grossMargin = calculateMargin(latest.grossProfit, latest.totalRevenue);
    const operatingMargin = calculateMargin(latest.operatingIncome, latest.totalRevenue);
    const netMargin = calculateMargin(latest.netIncome, latest.totalRevenue);
    const revenueGrowth = calculateTrend(financialData, 'totalRevenue');
    const profitGrowth = calculateTrend(financialData, 'netIncome');
    const revenueCAGR = calculateCAGR(financialData, 'totalRevenue');
    const opexRatio = calculateMargin(latest.operatingExpenses, latest.totalRevenue);
    const rdRatio = calculateMargin(latest.researchAndDevelopment, latest.totalRevenue);

    return (
        <div style={darkTheme ? styles.comparisonCardDark : styles.comparisonCard}>
            <h3 style={darkTheme ? styles.comparisonCardTitleDark : styles.comparisonCardTitle}>
                {getCompanyName(company)}
            </h3>

            {metric === 'revenue' && (
                <div style={styles.comparisonMetrics}>
                    <ComparisonMetric label="Total Revenue" value={formatCurrency(latest.totalRevenue)} darkTheme={darkTheme} />
                    <ComparisonMetric label="YoY Growth" value={`${revenueGrowth.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="CAGR" value={`${revenueCAGR.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Gross Profit" value={formatCurrency(latest.grossProfit)} darkTheme={darkTheme} />
                </div>
            )}

            {metric === 'profitability' && (
                <div style={styles.comparisonMetrics}>
                    <ComparisonMetric label="Net Income" value={formatCurrency(latest.netIncome)} darkTheme={darkTheme} />
                    <ComparisonMetric label="Operating Income" value={formatCurrency(latest.operatingIncome)} darkTheme={darkTheme} />
                    <ComparisonMetric label="EBITDA" value={formatCurrency(latest.ebitda)} darkTheme={darkTheme} />
                    <ComparisonMetric label="Profit Growth" value={`${profitGrowth.toFixed(2)}%`} darkTheme={darkTheme} />
                </div>
            )}

            {metric === 'margins' && (
                <div style={styles.comparisonMetrics}>
                    <ComparisonMetric label="Gross Margin" value={`${grossMargin.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Operating Margin" value={`${operatingMargin.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Net Margin" value={`${netMargin.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="EBITDA Margin" value={`${calculateMargin(latest.ebitda, latest.totalRevenue).toFixed(2)}%`} darkTheme={darkTheme} />
                </div>
            )}

            {metric === 'growth' && (
                <div style={styles.comparisonMetrics}>
                    <ComparisonMetric label="Revenue Growth" value={`${revenueGrowth.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Profit Growth" value={`${profitGrowth.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Revenue CAGR" value={`${revenueCAGR.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Gross Profit CAGR" value={`${calculateCAGR(financialData, 'grossProfit').toFixed(2)}%`} darkTheme={darkTheme} />
                </div>
            )}

            {metric === 'efficiency' && (
                <div style={styles.comparisonMetrics}>
                    <ComparisonMetric label="OpEx Ratio" value={`${opexRatio.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="R&D Ratio" value={`${rdRatio.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Operating Margin" value={`${operatingMargin.toFixed(2)}%`} darkTheme={darkTheme} />
                    <ComparisonMetric label="Gross Margin" value={`${grossMargin.toFixed(2)}%`} darkTheme={darkTheme} />
                </div>
            )}

            <div style={darkTheme ? styles.comparisonDateDark : styles.comparisonDate}>
                As of {formatDate(latest.fiscalDateEnding)}
            </div>
        </div>
    );
}

function ComparisonMetric({ label, value, darkTheme }) {
    return (
        <div style={darkTheme ? styles.comparisonMetricDark : styles.comparisonMetric}>
            <span style={darkTheme ? styles.comparisonLabelDark : styles.comparisonLabel}>{label}</span>
            <span style={darkTheme ? styles.comparisonValueDark : styles.comparisonValue}>{value}</span>
        </div>
    );
}

// Helper component to fetch data for a single company
function CompanyDataFetcher({ company, period, limit, onDataLoaded }) {
    const tableName = `income_statement_${company}_${period}`;
    const columns = [
        "fiscalDateEnding", "totalRevenue", "grossProfit", "operatingIncome",
        "netIncome", "ebitda", "operatingExpenses", "researchAndDevelopment"
    ];

    const { loading, error, data } = useQuery(GET_FINANCIAL_DATA, {
        variables: { tableName, columns, limit },
        errorPolicy: 'all'
    });

    useEffect(() => {
        if (!loading && data) {
            const financialData = data?.customQuery?.map(item => item.data) || [];
            onDataLoaded(company, financialData);
        } else if (error) {
            onDataLoaded(company, []);
        }
    }, [loading, data, error, company, onDataLoaded]);

    return null;
}

function RelativePerformance({ companies, period, darkTheme, metric, limit }) {
    const [allData, setAllData] = useState({});
    const [loadedCount, setLoadedCount] = useState(0);

    const handleDataLoaded = (company, data) => {
        setAllData(prev => {
            const newData = { ...prev, [company]: data };
            const loaded = Object.keys(newData).length;
            setLoadedCount(loaded);
            return newData;
        });
    };

    // Wait until all companies have loaded
    if (loadedCount < companies.length) {
        return (
            <div>
                {companies.map(company => (
                    <CompanyDataFetcher
                        key={company}
                        company={company}
                        period={period}
                        limit={limit}
                        onDataLoaded={handleDataLoaded}
                    />
                ))}
            </div>
        );
    }

    // Calculate rankings
    const rankings = companies.map(company => {
        const data = allData[company] || [];
        if (data.length === 0) return { company, score: 0 };

        const latest = data[0];
        let score = 0;

        if (metric === 'revenue') {
            score = parseFloat(latest.totalRevenue) || 0;
        } else if (metric === 'profitability') {
            score = parseFloat(latest.netIncome) || 0;
        } else if (metric === 'margins') {
            score = calculateMargin(latest.netIncome, latest.totalRevenue);
        } else if (metric === 'growth') {
            score = calculateTrend(data, 'totalRevenue');
        } else if (metric === 'efficiency') {
            score = 100 - calculateMargin(latest.operatingExpenses, latest.totalRevenue);
        }

        return { company, score };
    }).sort((a, b) => b.score - a.score);

    return (
        <>
            {/* Hidden data fetchers */}
            {companies.map(company => (
                <CompanyDataFetcher
                    key={company}
                    company={company}
                    period={period}
                    limit={limit}
                    onDataLoaded={handleDataLoaded}
                />
            ))}

            {/* Rankings display */}
            <div style={{
                marginTop: '30px',
                padding: '24px',
                background: darkTheme ? '#1e293b' : '#f9fafb',
                borderRadius: '12px',
                border: `2px solid ${darkTheme ? '#334155' : '#e5e7eb'}`
            }}>
                <h3 style={darkTheme ? styles.chartTitleDark : styles.chartTitle}>
                    🏆 Relative Performance Rankings
                </h3>
                <div style={{ marginTop: '20px' }}>
                    {rankings.map((item, index) => (
                        <div key={item.company} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            marginBottom: '12px',
                            background: darkTheme ? '#0f172a' : 'white',
                            borderRadius: '8px',
                            border: `2px solid ${index === 0 ? '#10b981' : (darkTheme ? '#334155' : '#e5e7eb')}`
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginRight: '16px',
                                color: index === 0 ? '#10b981' : (darkTheme ? '#64748b' : '#9ca3af'),
                                minWidth: '40px'
                            }}>
                                #{index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: darkTheme ? '#f1f5f9' : '#1f2937',
                                    marginBottom: '4px'
                                }}>
                                    {getCompanyName(item.company)}
                                </div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: darkTheme ? '#94a3b8' : '#6b7280'
                                }}>
                                    Score: {metric === 'revenue' || metric === 'profitability' 
                                        ? formatCurrency(item.score) 
                                        : `${item.score.toFixed(2)}%`}
                                </div>
                            </div>
                            {index === 0 && <div style={{ fontSize: '2rem' }}>🏆</div>}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

// ===== LOADING & ERROR SCREENS =====

function LoadingScreen({ darkTheme }) {
    return (
        <div style={darkTheme ? styles.loadingContainerDark : styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>Loading Financial Data...</div>
        </div>
    );
}

function ErrorScreen({ error, tableName, columns, darkTheme }) {
    return (
        <div style={darkTheme ? styles.errorContainerDark : styles.errorContainer}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Unable to Load Data</h2>
            <p style={styles.errorMessage}>
                There was an error loading financial data.
            </p>
            <div style={styles.errorDetails}>
                <strong>Error:</strong> {error.message}<br />
                <strong>Table:</strong> {tableName}<br />
                <strong>Columns:</strong> {columns.join(', ')}
            </div>
            <button 
                style={styles.errorButton}
                onClick={() => window.location.reload()}
            >
                Reload Page
            </button>
        </div>
    );
}

function NoDataScreen({ tableName, darkTheme }) {
    return (
        <div style={darkTheme ? styles.errorContainerDark : styles.errorContainer}>
            <div style={styles.errorIcon}>📊</div>
            <h2 style={styles.errorTitle}>No Data Available</h2>
            <p style={styles.errorMessage}>
                No financial data found for this selection.
            </p>
            <div style={styles.errorDetails}>
                <strong>Table:</strong> {tableName}
            </div>
        </div>
    );
}

// ===== STYLES =====

const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     padding: '20px',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//   },
  containerDark: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  unifiedToolbar: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '16px 24px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  unifiedToolbarDark: {
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '16px 24px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  toolbarLeft: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  toolbarRight: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  viewTab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: '#6b7280',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewTabActive: {
    background: '#667eea',
    color: 'white',
    fontWeight: '600'
  },
  viewTabDark: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewTabActiveDark: {
    background: '#3b82f6',
    color: 'white',
    fontWeight: '600'
  },
  toolbarSelect: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  toolbarSelectDark: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid #334155',
    background: '#0f172a',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  customInput: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    fontSize: '0.9rem',
    width: '100px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.2s'
  },
  customInputDark: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #334155',
    background: '#0f172a',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    width: '100px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.2s'
  },
  darkModeToggle: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    color: '#374151',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    height: '38px'
  },
  darkModeToggleDark: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid #334155',
    background: '#0f172a',
    color: '#f1f5f9',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    height: '38px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  metricCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  metricCardDark: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    border: '1px solid #334155'
  },
  metricTitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricTitleDark: {
    fontSize: '0.875rem',
    color: '#cbd5e1',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  metricValueDark: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '8px'
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  chartCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  chartCardDark: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #334155'
  },
  chartTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  chartTitleDark: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  chartContent: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '250px',
    paddingBottom: '40px'
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '30px'
  },
  bar: {
    width: '100%',
    borderRadius: '4px 4px 0 0',
    transition: 'all 0.3s',
    cursor: 'pointer'
  },
  viewSelector: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(0,0,0,0.05)',
    padding: '4px',
    borderRadius: '8px'
  },
  viewButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewButtonActive: {
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  viewButtonDark: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  viewButtonActiveDark: {
    background: '#334155',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  profitMetric: {
    transition: 'all 0.2s'
  },
  quickStatsContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  quickStatsContainerDark: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    marginBottom: '20px',
    border: '1px solid #334155'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  sectionTitleDark: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  statItem: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  statItemDark: {
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '8px'
  },
  statLabelDark: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  statValueDark: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#f1f5f9'
  },
  detailedContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  detailedContainerDark: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #334155'
  },
  tableWrapper: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '600px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem'
  },
  tableHeaderRow: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  tableHeaderRowDark: {
    background: '#0f172a',
    borderBottom: '2px solid #334155'
  },
  tableHeader: {
    padding: '14px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    position: 'sticky',
    top: 0,
    background: '#f9fafb',
    whiteSpace: 'nowrap'
  },
  tableHeaderDark: {
    padding: '14px 12px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#cbd5e1',
    position: 'sticky',
    top: 0,
    background: '#0f172a',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  tableRowDark: {
    borderBottom: '1px solid #334155',
    transition: 'background-color 0.2s'
  },
  tableCell: {
    padding: '14px 12px',
    color: '#1f2937',
    whiteSpace: 'nowrap'
  },
  tableCellDark: {
    padding: '14px 12px',
    color: '#f1f5f9',
    whiteSpace: 'nowrap'
  },
  comparisonContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  comparisonContainerDark: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    border: '1px solid #334155'
  },
  companyButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  companyButton: {
    padding: '10px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  companyButtonActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea',
    fontWeight: '600'
  },
  companyButtonDark: {
    padding: '10px 20px',
    border: '2px solid #475569',
    borderRadius: '8px',
    background: '#0f172a',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500'
  },
  companyButtonActiveDark: {
    background: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
    fontWeight: '600'
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  },
  comparisonCard: {
    padding: '24px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fafafa'
  },
  comparisonCardDark: {
    padding: '24px',
    border: '2px solid #334155',
    borderRadius: '12px',
    background: '#0f172a'
  },
  comparisonCardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  comparisonCardTitleDark: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '20px',
    margin: '0 0 20px 0'
  },
  comparisonMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  comparisonMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: 'white',
    borderRadius: '8px'
  },
  comparisonMetricDark: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#1e293b',
    borderRadius: '8px',
    border: '1px solid #334155'
  },
  comparisonLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  comparisonLabelDark: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    fontWeight: '500'
  },
  comparisonValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  comparisonValueDark: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#f1f5f9'
  },
  comparisonDate: {
    marginTop: '16px',
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center'
  },
  comparisonDateDark: {
    marginTop: '16px',
    fontSize: '0.875rem',
    color: '#94a3b8',
    textAlign: 'center'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white'
  },
  loadingContainerDark: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '1.2rem'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  },
  errorContainerDark: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '10px'
  },
  errorMessage: {
    fontSize: '1.1rem',
    marginBottom: '20px',
    opacity: 0.9
  },
  errorDetails: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '600px',
    backdropFilter: 'blur(10px)',
    textAlign: 'left'
  },
  errorButton: {
    padding: '12px 24px',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  }
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
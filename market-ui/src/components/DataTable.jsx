import React, { useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";

const GET_TABLE_DATA = gql`
  query GetTableData($tableName: String!) {
    getAllData(tableName: $tableName) {
      data
    }
  }
`;

// how much vertical space is taken above the table (toolbar + margins)
// adjust once if needed
const HEADER_OFFSET = 220;

const DataTable = ({ tableName }) => {
  const [expandedMetrics, setExpandedMetrics] = useState({});

  const { data, loading, error } = useQuery(GET_TABLE_DATA, {
    variables: { tableName },
    skip: !tableName,
  });

  const { quarters, metrics, transposedData } = useMemo(() => {
    if (!data?.getAllData?.length) {
      return { quarters: [], metrics: [], transposedData: {} };
    }

    const quarters = data.getAllData
      .map(item => item.data.quarter)
      .filter(Boolean)
      .sort()
      .reverse();

    const sampleItem = data.getAllData[0].data;
    const metrics = Object.keys(sampleItem).filter(
      key => key !== "quarter" && key !== "__typename"
    );

    const transposedData = {};
    metrics.forEach(metric => {
      transposedData[metric] = {};
      data.getAllData.forEach(item => {
        const q = item.data.quarter;
        if (q) transposedData[metric][q] = item.data[metric];
      });
    });

    return { quarters, metrics, transposedData };
  }, [data]);

  const toggleMetric = (metric) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  // Format metric name: remove underscores, capitalize first letter
  const formatMetricName = (metric) => {
    return metric
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) return <div className="p-3">Loading...</div>;
  if (error) return <div className="p-3">Error! {error.message}</div>;

  return (
    // 🔑 this makes the table match screen height
    <div
      className="w-full"
      style={{ height: `calc(100vh - ${HEADER_OFFSET}px)` }}
    >
      {/* header (keeps original colors) */}
      <div className="p-3">
        <h3 className="text-xl font-semibold dark:text-gray-400">
          {tableName.toUpperCase()} DATA:
        </h3>
      </div>

      {/* 🔑 scrolling happens HERE, not on the page */}
      <div className="h-full overflow-auto relative">
        <table className="table-auto w-full min-w-max border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th
                className="
                  p-2 text-left border border-gray-300 dark:border-gray-700
                  bg-gray-200 dark:bg-gray-800
                  text-gray-800 dark:text-white
                  shadow-md sticky left-0 z-20
                "
                style={{ width: "180px", maxWidth: "180px", minWidth: "180px" }}
              >
                Metric
              </th>

              {quarters.map((quarter, index) => (
                <th
                  key={index}
                  className="
                    p-2 text-center border border-gray-300 dark:border-gray-700
                    bg-gray-200 dark:bg-gray-800
                    text-gray-800 dark:text-white
                    shadow-md
                  "
                >
                  {quarter}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {metrics.map((metric, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-300 dark:border-gray-700">
                <td
                  className="
                    p-2 border border-gray-300 dark:border-gray-700
                    bg-gray-100 dark:bg-gray-800
                    text-gray-800 dark:text-white
                    font-semibold sticky left-0 z-10 cursor-pointer
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition-all
                  "
                  style={{
                    width: expandedMetrics[metric] ? "auto" : "200px",
                    maxWidth: expandedMetrics[metric] ? "none" : "220px",
                    minWidth: "200px",
                    overflow: expandedMetrics[metric] ? "visible" : "hidden",
                    whiteSpace: expandedMetrics[metric] ? "normal" : "nowrap",
                    textOverflow: expandedMetrics[metric] ? "clip" : "ellipsis",
                  }}
                  onClick={() => toggleMetric(metric)}
                >
                  {formatMetricName(metric)}
                </td>

                {quarters.map((quarter, colIndex) => (
                  <td
                    key={colIndex}
                    className="
                      p-2 border border-gray-300 dark:border-gray-700
                      bg-white dark:bg-gray-900
                      text-gray-800 dark:text-white
                      text-center
                    "
                  >
                    {transposedData[metric][quarter] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
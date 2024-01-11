import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const LineChart = ({ data }) => {
  // Check if data is defined
  if (!data || data.length === 0) {
    return <p>No data available for the chart.</p>;
  }

  const options = {
    animationEnabled: true,
    title: {
      text: "Revenue Line Chart"
    },
    axisY: {
      title: "Total Revenues (in millions)",
      valueFormatString: "#,##0M", // Format the y-axis labels with commas and M for millions
    },
    toolTip: {
      shared: true,
      contentFormatter: function (e) {
        return `${e.entries[0].dataPoint.label}: $${CanvasJSReact.CanvasJS.formatNumber(e.entries[0].dataPoint.revValue, "#,##0.##")}M`;
      }
    },
    data: [{
      type: "spline",
      showInLegend: true,
      name: "Revenue",
      dataPoints: data.map(rev => ({
        y: parseFloat(rev.total_revenues), // Convert total_revenues to a number
        label: rev.quarter,
        revValue: rev.total_revenues // Include the revenue value in the data point
      }))
    }]
  };

  return (
    <div>
      <CanvasJSChart options={options} />
    </div>
  );
};

export default LineChart;

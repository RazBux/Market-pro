import React from 'react';
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const LineChart = ({ data }) => {
  // Check if data is defined
  if (!data || data.length === 0) {
    return <p>No data available for the chart.</p>;
  }

  // Group data by category
  const groupedData = data.reduce((acc, val) => {
    Object.keys(val).forEach((category) => {
      if (category !== 'quarter' && category !== '__typename') {
        var rawValue = val[category];
        // Check if the rawValue is not null before further processing
        if (rawValue !== null) {
          // Declare yValue without initializing
          let yValue;

          // Check if the value has parentheses
          if (typeof rawValue === 'string' && rawValue.includes('(') && rawValue.includes(')')) {
            // Use replace and assign the result back to rawValue
            rawValue = rawValue.replace('(', '').replace(')', '');

            // Parse the modified rawValue as a float and make it negative
            yValue = -parseFloat(rawValue.replace(',', ''));
          } else {
            // Parse the rawValue as a float
            yValue = parseFloat(rawValue.replace(',', ''));
          }


          // Check if yValue is not null before pushing it into dataPoints array 
          if (!isNaN(yValue)) {
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              y: yValue,
              label: val.quarter,
            });
          }
        }
      }
    });
    return acc;
  }, {});


  const options = {
    animationEnabled: true,
    title: {
      text: 'Market-pro',
    },
    axisY: {
      title: 'Values (in millions)',
      valueFormatString: '#,##0M', // Format the y-axis labels with commas and M for millions
    },
    toolTip: {
      shared: false, // Set to false to display values only for the hovered data point
      contentFormatter: function (e) {
        return `$${CanvasJSReact.CanvasJS.formatNumber(e.entries[0].dataPoint.y, '#,##0.##')}M`;
      },
    },
    data: Object.keys(groupedData).map((category, index) => ({
      type: 'spline',
      showInLegend: true,
      name: category,
      dataPoints: groupedData[category],
    })),
  };


  return (
    <div>
      <CanvasJSChart options={options} />
    </div>
  );
};

export default LineChart;

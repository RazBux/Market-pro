// import React from 'react';
// import { ResponsiveLine } from '@nivo/line';

// const LineChart = ({ data, textToDisplay }) => {
//     const transformData = (data) => {
//         if (!data || data.length === 0) return [];

//         const groupedData = data.reduce((acc, item) => {
//           const { data: val } = item;
//           Object.keys(val).forEach(category => {
//             if (category !== 'quarter' && category !== '__typename') {
//               const rawValue = val[category];
//               if (rawValue !== null) {
//                 let yValue;
//                 if (typeof rawValue === 'string' && rawValue.includes('(') && rawValue.includes(')')) {
//                   // Handling negative values enclosed in parentheses
//                   yValue = -parseFloat(rawValue.replace(/[(),]/g, ''));
//                 } else {
//                   yValue = parseFloat(rawValue.replace(/,/g, ''));
//                 }
//                 if (!isNaN(yValue)) {
//                   if (!acc[category]) {
//                     acc[category] = { id: category, data: [] };
//                   }
//                   acc[category].data.push({ x: `Q${val.quarter}`, y: yValue });
//                 }
//               }
//             }
//           });
//           return acc;
//         }, {});

//         // Convert the grouped data object into an array suitable for Nivo
//         return Object.values(groupedData);
//       };

//       const nivoData = transformData(data);

//   return (
//     <div style={{ height: 400 }}>
//       <ResponsiveLine
//         data={nivoData}
//         margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
//         xScale={{ type: 'point' }}
//         yScale={{
//           type: 'linear',
//           min: 'auto',
//           max: 'auto',
//           stacked: true,
//           reverse: false
//         }}
//         axisTop={null}
//         axisRight={null}
//         axisBottom={{
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: 0,
//           legend: 'Quarter',
//           legendOffset: 36,
//           legendPosition: 'middle'
//         }}
//         axisLeft={{
//           tickSize: 5,
//           tickPadding: 5,
//           tickRotation: 0,
//           legend: 'Value',
//           legendOffset: -40,
//           legendPosition: 'middle'
//         }}
//         pointSize={10}
//         pointColor={{ theme: 'background' }}
//         pointBorderWidth={2}
//         pointBorderColor={{ from: 'serieColor' }}
//         pointLabelYOffset={-12}
//         areaOpacity={0.1}
//         useMesh={true}
//         enableSlices="x"
//         legends={[
//           {
//             anchor: 'bottom-right',
//             direction: 'column',
//             justify: false,
//             translateX: 100,
//             translateY: 0,
//             itemsSpacing: 0,
//             itemDirection: 'left-to-right',
//             itemWidth: 80,
//             itemHeight: 20,
//             itemOpacity: 0.75,
//             symbolSize: 12,
//             symbolShape: 'circle',
//             symbolBorderColor: 'rgba(0, 0, 0, .5)',
//             effects: [
//               {
//                 on: 'hover',
//                 style: {
//                   itemBackground: 'rgba(0, 0, 0, .03)',
//                   itemOpacity: 1
//                 }
//               }
//             ]
//           }
//         ]}
//       />
//     </div>
//   );
// };

// export default LineChart;



//////canvasjs//////
// import React from 'react';
// import CanvasJSReact from '@canvasjs/react-charts';

// const CanvasJSChart = CanvasJSReact.CanvasJSChart;

// const LineChart = ({ data, textToDisplay }) => {

//   let groupedData = {};

//   // Check if data is defined and not empty
//   if (data && data.length > 0) {
//     groupedData = data.reduce((acc, item) => {
//       const val = item.data;
//       Object.keys(val).forEach((category) => {
//         if (category !== 'quarter' && category !== '__typename') {
//           var rawValue = val[category];
//           if (rawValue !== null) {
//             let yValue;
//             if (typeof rawValue === 'string' && rawValue.includes('(') && rawValue.includes(')')) {
//               rawValue = rawValue.replace('(', '').replace(')', '');
//               yValue = -parseFloat(rawValue.replace(',', ''));
//             } else {
//               yValue = parseFloat(rawValue.replace(',', ''));
//             }
//             if (!isNaN(yValue)) {
//               if (!acc[category]) {
//                 acc[category] = [];
//               }
//               acc[category].push({ y: yValue, label: val.quarter });
//             }
//           }
//         }
//       });
//       return acc;
//     }, {});
//   }

//   const options = {
//     animationEnabled: true,
//     title: { text: textToDisplay },
//     axisY: {
//       // title: 'Values (in millions)',
//       // >> need to change the sing base on the company M and T...
//       valueFormatString: '#,##0M',
//     },
//     toolTip: {
//       shared: false,
//       contentFormatter: function (e) {
//         return `$${CanvasJSReact.CanvasJS.formatNumber(e.entries[0].dataPoint.y, '#,##0.##')}M`;
//       },
//     },
//     data: Object.keys(groupedData).map((category, index) => ({
//       type: 'spline',
//       showInLegend: true,
//       name: category,
//       dataPoints: groupedData[category],
//     })),
//   };

//   return (
//     <div>
//       <CanvasJSChart options={options} key={textToDisplay} />
//     </div>
//   );
// };

// export default LineChart;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Predefined colors array
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#387908', '#ff0000', '#0088fe', '#00c49f', '#ffbb28'];

// Process the data to group by category and remove duplicate quarters
const processData = (data) => {
  let groupedData = {};
  let uniqueQuarters = new Set();

  if (data && data.length > 0) {
    groupedData = data.reduce((acc, item) => {
      const val = item.data;
      Object.keys(val).forEach((category) => {
        if (category !== 'quarter' && category !== '__typename') {
          let rawValue = val[category];
          if (rawValue !== null) {
            let yValue;
            if (typeof rawValue === 'string' && rawValue.includes('(') && rawValue.includes(')')) {
              rawValue = rawValue.replace('(', '').replace(')', '');
              yValue = -parseFloat(rawValue.replace(',', ''));
            } else {
              yValue = parseFloat(rawValue.replace(',', ''));
            }
            if (!isNaN(yValue)) {
              const quarter = val.quarter;
              if (!acc[quarter]) {
                acc[quarter] = { name: quarter };
              }
              acc[quarter][category] = yValue;
              uniqueQuarters.add(quarter);
            }
          }
        }
      });
      return acc;
    }, {});
  }

  // Convert grouped data into an array
  const formattedData = Array.from(uniqueQuarters)
    .sort()
    .map((quarter) => groupedData[quarter]);

  return formattedData;
};

const LineChartComponent = ({ data, textToDisplay }) => {
  const processedData = processData(data);

  // Extract unique categories for Legend and Lines
  const categories = Object.keys(processedData[0] || {}).filter((key) => key !== 'name');

  return (
    <div className="m-6 p-0.5">
      <h2 className="text-center mb-4">{textToDisplay}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {/* <XAxis dataKey="name" /> */}
          <XAxis
            dataKey="name"
            tickMargin={10}
          />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`}
            tickMargin={10}
          />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Legend />
          {categories.map((category, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={category}
              name={category}
              stroke={colors[index % colors.length]} // Use the assigned color
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;

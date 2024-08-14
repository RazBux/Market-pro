import React from 'react';
import { ResponsiveLine } from '@nivo/line';

const LineChart = ({ data, textToDisplay }) => {
    const transformData = (data) => {
        if (!data || data.length === 0) return [];
      
        const groupedData = data.reduce((acc, item) => {
          const { data: val } = item;
          Object.keys(val).forEach(category => {
            if (category !== 'quarter' && category !== '__typename') {
              const rawValue = val[category];
              if (rawValue !== null) {
                let yValue;
                if (typeof rawValue === 'string' && rawValue.includes('(') && rawValue.includes(')')) {
                  // Handling negative values enclosed in parentheses
                  yValue = -parseFloat(rawValue.replace(/[(),]/g, ''));
                } else {
                  yValue = parseFloat(rawValue.replace(/,/g, ''));
                }
                if (!isNaN(yValue)) {
                  if (!acc[category]) {
                    acc[category] = { id: category, data: [] };
                  }
                  acc[category].data.push({ x: `Q${val.quarter}`, y: yValue });
                }
              }
            }
          });
          return acc;
        }, {});
      
        // Convert the grouped data object into an array suitable for Nivo
        return Object.values(groupedData);
      };
      
      const nivoData = transformData(data);

  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={nivoData}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Quarter',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendOffset: -40,
          legendPosition: 'middle'
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        areaOpacity={0.1}
        useMesh={true}
        enableSlices="x"
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1
                }
              }
            ]
          }
        ]}
      />
    </div>
  );
};

export default LineChart;




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
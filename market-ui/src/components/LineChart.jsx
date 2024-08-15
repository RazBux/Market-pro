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

const LineChartComponent = ({ data, selectedTable }) => {
  const processedData = processData(data);

  // Extract unique categories for Legend and Lines
  const categories = Object.keys(processedData[0] || {}).filter((key) => key !== 'name');

  return (
    <div className="m-6 p-0.5">
      <div className="flex items-center justify-center space-x-10">
        <h2 className="text-center uppercase text-3xl font-extrabold mb-4">{selectedTable}</h2>
        <img
          src={`/assets/logo/${selectedTable}.svg`}
          alt={`${selectedTable} logo`}
          className="w-20 h-20"
        />
      </div>
      <ResponsiveContainer width="100%" height={400} className='dark:text-gray-600'>
        <LineChart
          data={processedData}
          margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickMargin={10}
          />
          <YAxis
            width={80}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
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
              strokeWidth={2.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;


import React from 'react';
import LineChart from './LineChart';
import { useQuery } from '@apollo/client';

//A function that use query and pass the data to the LineChart component
//and render the chart on the screen.
function GetQueryData(props) {
  const {loading, error, data} = useQuery(props.query);
  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('GraphQL Error:', error);
    return <p>Error: {error.message}</p>;
  }

  // Check if data and data.revenue are defined
  if (!data || !data.getFreeStyleData) {
    return <p>No revenue data available.</p>;
  }

  return (
    <div>
      <LineChart data={data.getFreeStyleData} />
    </div>
  );
}

export default (GetQueryData);

// QueryData.jsx

import React, { useState } from 'react';
import LineChart from './LineChart';
import { useQuery, gql } from '@apollo/client';
import CategoryMenu from './CategoryMenu';

const START_QUERY = gql`
  query {
    getFreeStyleData (columnList: ["quarter,total_revenues,operating_expenses,total_gross_profit "]) {
      quarter
      total_revenues
      operating_expenses
      total_gross_profit
    }
  }
`;

function generateGraphQLQuery(categories) {
  const query = gql`
    query {
      getFreeStyleData(columnList: ["quarter", ${categories.map(category => `"${category}"`).join(',')}]) {
        quarter
        ${categories.join(' ')}
      }
    }
  `;


  console.log('Generated Query:', query);

  return query;
}

function QueryData() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [query, setQuery] = useState(START_QUERY);

  const updateCategories = (categories) => {
    setSelectedCategories(categories);
    const newQuery = generateGraphQLQuery(categories);
    setQuery(newQuery);
  };

  const { loading, error, data } = useQuery(query);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('GraphQL Error:', error);
    return <p>Error: {error.message}</p>;
  }

  if (!data || !data.getFreeStyleData) {
    return <p>No revenue data available.</p>;
  }

  return (
    <div>
      <LineChart data={data.getFreeStyleData} />
      <CategoryMenu updateCategories={updateCategories} />
      {/* Optionally, you can display the selected categories */}
      <h3>Selected Categories:</h3>
      <ul>
          {selectedCategories.map(category => (
            <li key={category}>{category}</li>
          ))}
        </ul>
    </div>
  );
}

export default QueryData;
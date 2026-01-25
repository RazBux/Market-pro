import React, { useState } from 'react';
import LineChart from './LineChart';
import { useQuery, gql } from '@apollo/client';
import CategoryMenu from './CategoryMenu';
import ToolBar from './ToolBar';
import DataTable from './DataTable';

const DEFAULT_QUERY = gql`
  query GetFreeStyleData($tableName: String!) {
    getFreeStyleData(tableName: $tableName, columnList: ["quarter,total_revenues"]) {
      data
    }
  }
`;

function generateGraphQLQuery(selectedTable, categories) {
  const query = gql`
    query {
      getFreeStyleData(tableName: "${selectedTable}",columnList: ["quarter", ${categories.map(category => `"${category}"`).join(',')}]) {
        data
      }
    }
  `;
  return query;
}

function QueryData() {
  const [selectedTable, setSelectedTable] = useState('monday');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [query, setQuery] = useState(DEFAULT_QUERY); // Define setQuery here

  const { loading, error, data } = useQuery(query, {
    variables: { tableName: selectedTable },
    skip: !selectedTable
  });

  const updateCategories = (categories) => {
    setSelectedCategories(categories);
    const newQuery = generateGraphQLQuery(selectedTable, categories);
    setQuery(newQuery);
  };

  const updateSelectedTable = (tableName) => {
    // alert("choose categories now");
    setSelectedTable(tableName);
    setSelectedCategories([]);
    setQuery(DEFAULT_QUERY);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    // <div className='bg-neutral-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200'>
    <div>
      <ToolBar updateSelectedTable={updateSelectedTable} selectedTable={selectedTable} />
      <LineChart data={data.getFreeStyleData} selectedTable={selectedTable} />
      <div className='m-2'>
        <CategoryMenu
          selectedTable={selectedTable}
          updateCategories={updateCategories} />
        <h3 className='pl-2 font-bold'>Selected Categories:</h3>
        <ul className='pb-1 pl-4 font-serif'>
          {selectedCategories.map(category => (
            <li key={category}>{category}</li>
          ))}
        </ul>

      </div>
        <DataTable tableName={selectedTable} />
    </div>
  );
}

export default QueryData;
// CategoryMenu.jsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
// import Select from 'react-select';
import MySelect from './MySelect';
import { useDarkModeContext } from '../contexts/DarkModeContext';

const GET_CATEGORIES = gql`
  query GetCategories($tableName: String!) {
    tableColumns(tableName: $tableName) {
      columns
    }
  }
`;

const CategoryMenu = ({ selectedTable, updateCategories }) => {
  const { darkTheme } = useDarkModeContext();
  const { loading, error, data } = useQuery(GET_CATEGORIES, {
    variables: { tableName: selectedTable },
    skip: !selectedTable,
  });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [, setSubmittedCategories] = useState([]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const options = data.tableColumns.columns
    .filter(category => category !== 'quarter')
    .map(category => ({
      label: category,
      value: category,
    }));

  const handleCategoryChange = selectedOptions => {
    setSelectedOptions(selectedOptions);
  };

  const handleButtonClick = () => {
    const selectedCategories = selectedOptions.map(option => option.value);
    if (selectedCategories.length === 0) {
      // If there are no selected categories, show an alert
      alert('Please select at least one category.');
    } else {
      // If there are selected categories, update and pass them to the parent
      setSubmittedCategories(selectedCategories);
      updateCategories(selectedCategories);
    }
  };

  return (
    <div>
      <h1 className='font-extrabold text-xl mb-1'>Categories</h1>
      <MySelect isMulti={true} options={options} handleChange={handleCategoryChange} darkMode={darkTheme} />

      <button
        className="bg-blue-500 text-white font-semibold mt-2 mb-2 py-2 px-4 rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:hover:bg-gray-800"
        onClick={handleButtonClick}
      >
        Submit
      </button>

    </div>
  );
};

export default CategoryMenu;
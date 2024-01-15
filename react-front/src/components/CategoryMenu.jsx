// CategoryMenu.jsx

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import Select from 'react-select';

const GET_CATEGORIES = gql`
  {
    tableColumns {
      columns
    }
  }
`;

const CategoryMenu = ({ updateCategories }) => {
  const { loading, error, data } = useQuery(GET_CATEGORIES);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submittedCategories, setSubmittedCategories] = useState([]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const options = data.tableColumns.columns
  .filter(category => category !== 'quarter')
    .map(category => ({
      label: category,
      value: category,
    }));

  const customStyles = {
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: 'lightblue',
    })
  };

  const handleCategoryChange = selectedOptions => {
    setSelectedOptions(selectedOptions);
  };

  const handleButtonClick = () => {
    const selectedCategories = selectedOptions.map(option => option.value);
    setSubmittedCategories(selectedCategories);
    // Pass the selected categories back to the parent
    updateCategories(selectedCategories);
  };

  return (
    <div>
      <h2>Categories</h2>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleCategoryChange}
        styles={customStyles}
      />
      <button onClick={handleButtonClick}>Submit</button>
      <div>
        <h3>Submitted Categories:</h3>
        <ul>
          {submittedCategories.map(category => (
            <li key={category}>{category}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryMenu;
// CategoryMenu.jsx

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import Select from 'react-select';
import "../App.css";

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
  const [, setSubmittedCategories] = useState([]);

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
      <h2>Categories</h2>
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={handleCategoryChange}
        styles={customStyles}
      />
      <button className="custom-button" onClick={handleButtonClick}>Submit</button>
    </div>
  );
};

export default CategoryMenu;
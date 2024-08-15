import React, { useState } from 'react';
import Select from 'react-select';

const darkModeColors = {
  background: '#333333',
  border: '#424242',
  optionBackground: '#424242',
  optionSelected: '#007bff',
  placeholder: '#a0a0a0',
  singleValue: '#ffffff',
  inputText: '#ffffff',
};

const lightModeColors = {
  background: '#ffffff',
  border: '#e0e0e0',
  optionBackground: '#ffffff',
  optionSelected: '#007bff',
  placeholder: '#6c757d',
  singleValue: '#000000',
  inputText: '#000000',
};

const customStyles = (darkMode) => ({
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: darkMode ? darkModeColors.background : lightModeColors.background,
    borderColor: state.isFocused ? '#007bff' : darkMode ? darkModeColors.border : lightModeColors.border,
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38, 143, 255, 0.25)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#007bff' : darkMode ? darkModeColors.border : lightModeColors.border,
    },
    minHeight: '40px', // Set a fixed minimum height
  }),
  input: (provided) => ({
    ...provided,
    color: darkMode ? darkModeColors.inputText : lightModeColors.inputText, // Input text color
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: darkMode ? darkModeColors.background : lightModeColors.background,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? darkModeColors.optionSelected : (darkMode ? darkModeColors.optionBackground : lightModeColors.optionBackground),
    color: state.isSelected ? '#ffffff' : (darkMode ? darkModeColors.singleValue : lightModeColors.singleValue),
    '&:hover': {
      backgroundColor: state.isFocused ? darkModeColors.optionSelected : (darkMode ? '#555555' : '#e9ecef'),
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: darkMode ? darkModeColors.placeholder : lightModeColors.placeholder,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: darkMode ? darkModeColors.optionBackground : lightModeColors.optionBackground,
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
    '&:hover': {
      backgroundColor: darkMode ? '#555555' : '#e9ecef',
      color: '#ffffff',
    },
  }),
});

const MySelect = ({ isMulti = false, options, handleChange, darkMode }) => {
  const [selectedOptions, setSelectedOptions] = useState(null);

  const handleSelectChange = (selectedOption) => {
    setSelectedOptions(selectedOption);
    handleChange(selectedOption); // Pass selected options back to the parent component
  };

  return (
    <Select
      options={options}
      onChange={handleSelectChange}
      value={selectedOptions}
      placeholder="Search company…"
      classNamePrefix="select"
      styles={customStyles(darkMode)}
      isMulti={isMulti}
    />
  );
};

export default MySelect;

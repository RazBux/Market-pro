// import React, { useState } from 'react';
// import Select from 'react-select';

// const darkModeColors = {
//   background: '#333333',
//   border: '#424242',
//   optionBackground: '#424242',
//   optionSelected: '#007bff',
//   placeholder: '#a0a0a0',
//   singleValue: '#ffffff',
//   inputText: '#ffffff',
// };

// const lightModeColors = {
//   background: '#ffffff',
//   border: '#e0e0e0',
//   optionBackground: '#ffffff',
//   optionSelected: '#007bff',
//   placeholder: '#6c757d',
//   singleValue: '#000000',
//   inputText: '#000000',
// };

// const customStyles = (darkMode) => ({
//   container: (provided) => ({
//     ...provided,
//     width: '100%',
//   }),
//   control: (provided, state) => ({
//     ...provided,
//     backgroundColor: darkMode ? darkModeColors.background : lightModeColors.background,
//     borderColor: state.isFocused ? '#007bff' : darkMode ? darkModeColors.border : lightModeColors.border,
//     boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38, 143, 255, 0.25)' : 'none',
//     '&:hover': {
//       borderColor: state.isFocused ? '#007bff' : darkMode ? darkModeColors.border : lightModeColors.border,
//     },
//     minHeight: '40px', // Set a fixed minimum height
//   }),
//   input: (provided) => ({
//     ...provided,
//     color: darkMode ? darkModeColors.inputText : lightModeColors.inputText, // Input text color
//   }),
//   menu: (provided) => ({
//     ...provided,
//     backgroundColor: darkMode ? darkModeColors.background : lightModeColors.background,
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected ? darkModeColors.optionSelected : (darkMode ? darkModeColors.optionBackground : lightModeColors.optionBackground),
//     color: state.isSelected ? '#ffffff' : (darkMode ? darkModeColors.singleValue : lightModeColors.singleValue),
//     '&:hover': {
//       backgroundColor: state.isFocused ? darkModeColors.optionSelected : (darkMode ? '#555555' : '#e9ecef'),
//     },
//   }),
//   placeholder: (provided) => ({
//     ...provided,
//     color: darkMode ? darkModeColors.placeholder : lightModeColors.placeholder,
//   }),
//   singleValue: (provided) => ({
//     ...provided,
//     color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: darkMode ? darkModeColors.optionBackground : lightModeColors.optionBackground,
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
//   }),
//   multiValueRemove: (provided) => ({
//     ...provided,
//     color: darkMode ? darkModeColors.singleValue : lightModeColors.singleValue,
//     '&:hover': {
//       backgroundColor: darkMode ? '#555555' : '#e9ecef',
//       color: '#ffffff',
//     },
//   }),
// });

// const MySelect = ({ isMulti = false, options, handleChange, darkMode }) => {
//   const [selectedOptions, setSelectedOptions] = useState(null);

//   const handleSelectChange = (selectedOption) => {
//     setSelectedOptions(selectedOption);
//     handleChange(selectedOption); // Pass selected options back to the parent component
//   };

//   return (
//     <Select
//       options={options}
//       onChange={handleSelectChange}
//       value={selectedOptions}
//       placeholder="Search company…"
//       classNamePrefix="select"
//       styles={customStyles(darkMode)}
//       isMulti={isMulti}
//     />
//   );
// };

// export default MySelect;



import React from "react";
import Select from "react-select";

export default function MySelect({
  isMulti,
  options,
  value,
  handleChange,
  darkMode,
  closeMenuOnSelect = true,
}) {
  const styles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 14,
      minHeight: 44,
      borderColor: darkMode ? "#374151" : "#e5e7eb",
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      boxShadow: state.isFocused ? (darkMode ? "0 0 0 1px #60a5fa" : "0 0 0 1px #3b82f6") : "none",
      ":hover": {
        borderColor: darkMode ? "#4b5563" : "#d1d5db",
      },
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 14,
      backgroundColor: darkMode ? "#111827" : "#ffffff",
      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
      overflow: "hidden",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? (darkMode ? "#1f2937" : "#e5e7eb")
        : state.isFocused
          ? (darkMode ? "#1f2937" : "#f3f4f6")
          : (darkMode ? "#111827" : "#ffffff"),
      color: darkMode ? "#e5e7eb" : "#111827",
      cursor: "pointer",
      // ✅ removes the "checkbox/radio" vibe by making it look like simple list rows
      display: "flex",
      alignItems: "center",
    }),
    multiValue: (base) => ({
      ...base,
      borderRadius: 999,
      backgroundColor: darkMode ? "#1f2937" : "#f3f4f6",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: darkMode ? "#e5e7eb" : "#111827",
      fontWeight: 600,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: darkMode ? "#e5e7eb" : "#111827",
      ":hover": {
        backgroundColor: darkMode ? "#374151" : "#e5e7eb",
        color: darkMode ? "#ffffff" : "#000000",
        borderRadius: 999,
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: darkMode ? "#e5e7eb" : "#111827",
    }),
    input: (base) => ({
      ...base,
      color: darkMode ? "#e5e7eb" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: darkMode ? "#9ca3af" : "#6b7280",
    }),
  };

  return (
    <Select
      isMulti={isMulti}
      options={options}
      value={value}
      onChange={handleChange}
      closeMenuOnSelect={closeMenuOnSelect}  // ✅ closes each click
      hideSelectedOptions={false}
      isSearchable={true}
      styles={styles}
    />
  );
}

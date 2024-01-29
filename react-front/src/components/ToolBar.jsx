import React from 'react';
import { useQuery, gql } from '@apollo/client';
import Select from 'react-select';
import "../App.css";

const GET_TABLES_QUERY = gql`
  query GetTables {
    dbTables {
      tables
    }
  }
`;

const ToolBar = ({ updateSelectedTable, selectedTable }) => {
    const { data, loading, error } = useQuery(GET_TABLES_QUERY);

    // Function to handle the change in select input
    const handleChange = (selectedOption) => {
        updateSelectedTable(selectedOption.value);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    // Preparing options for the select input
    const options = data && data.dbTables && data.dbTables.tables
        ? data.dbTables.tables.map(table => ({ value: table, label: table }))
        : [];

    // // If want to show in the search the company name... 
    // // Determine the current value for the select
    // const selectedValue = options.find(option => option.value === selectedTable);

    const customStyles = {
        multiValue: (styles) => ({
            ...styles,
            backgroundColor: 'lightblue',
        })
    };

    return (
        <div className="toolbar">
            <div className="market">Market-pro</div>
            <div className="search-container">
                <Select
                    options={options}
                    onChange={handleChange}
                    value={null}
                    // value={selectedValue}
                    placeholder="Search company…"
                    // className="select-component" // Add your custom styling class if needed
                    styles={customStyles}
                />
            </div>
            <img src={`/assets/logo/${selectedTable}.svg`} alt={`${selectedTable} logo`} style={{ width: '50px', marginLeft: '30px' }} />
        </div>
    );
};

export default ToolBar;

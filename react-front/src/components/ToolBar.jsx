// import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Select from 'react-select';
import "../App.css";
import "../index.css"
import useDarkMode from '../hooks/useDarkMode';
import {
    FaMoon,
    FaSun,
} from 'react-icons/fa';
import { IoIosMail } from "react-icons/io";

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


    return (
        <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-sky-500 text-gray-800 dark:bg-gray-900 dark:text-white">
            <div className="flex items-center">
                <div className="font-bold text-xl text-black dark:text-white mr-4">Market-pro</div>
                <div className="flex-grow">
                    <Select
                        options={options}
                        onChange={handleChange}
                        value={null}
                        placeholder="Search company…"
                        className="basic-single"
                        classNamePrefix="select"
                    />
                </div>
                <img src={`/assets/logo/${selectedTable}.svg`} alt={`${selectedTable} logo`} style={{ width: '50px', marginLeft: '30px' }} />
            </div>
            <div className="flex items-center">
                <DarkModeIcon className="mr-4" />
                <MailIcon />
            </div>
        </div>
    );
};


const DarkModeIcon = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    return (
        <span onClick={handleMode}>
            {darkTheme ? (
                <FaSun size='30' className='top-navigation-icon' />
            ) : (
                <FaMoon size='30' className='top-navigation-icon' />
            )}
        </span>
    );
};

const MailIcon = () => {
    return (
        <IoIosMail size='35' className='top-navigation-icon'/>
    );
};

export default ToolBar;

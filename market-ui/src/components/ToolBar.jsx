import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import MySelect from './MySelect';
import { useDarkModeContext } from '../contexts/DarkModeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import { IoIosMail } from "react-icons/io";

const GET_TABLES_QUERY = gql`
  query GetTables {
    dbTables {
      tables
    }
  }
`;

const ToolBar = ({ updateSelectedTable, selectedTable }) => {
    const { darkTheme, setDarkTheme } = useDarkModeContext();

    const { data, loading, error } = useQuery(GET_TABLES_QUERY);

    const handleChange = (selectedOption) => {
        updateSelectedTable(selectedOption.value);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const options = data && data.dbTables && data.dbTables.tables
        ? data.dbTables.tables.map(table => ({ value: table, label: table }))
        : [];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-b-2xl px-4 py-4 bg-sky-100 dark:text-black dark:bg-gray-900">
            <div className="flex items-center">
                <div className="font-bold text-xl text-black dark:text-white mr-4">Market-pro</div>
                <div className='m-2'>
                    <MySelect options={options} handleChange={handleChange} darkMode={darkTheme} />
                </div>
            </div>
            <div className="flex space-x-2 items-center m-1">
                <DarkModeIcon darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
                <MailIcon className='' />
            </div>
        </div>
    );
};

// const DarkModeIcon = ({ darkTheme, setDarkTheme }) => {
//     const handleMode = () => setDarkTheme(prevMode => !prevMode); // Toggle dark mode

//     return (
//         <span onClick={handleMode}>
//             {darkTheme ? (
//                 <FaSun size='30' className='text-invert-negative-1'/>
//             ) : (
//                 <FaMoon size='30'/>
//             )}
//         </span>
//     );
// };
const DarkModeIcon = ({ darkTheme, setDarkTheme }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMode = () => setDarkTheme(prevMode => !prevMode); // Toggle dark mode

    return (
        <div className="relative inline-block">
            <span
                onClick={handleMode}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="cursor-pointer"
            >
                {darkTheme ? (
                    <FaSun size='30' className='text-invert-negative-1' />
                ) : (
                    <FaMoon size='30' />
                )}
            </span>
            {showTooltip && (
                <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-600 rounded-lg shadow-sm opacity-100 transition-opacity duration-300">
                    {darkTheme ? " Light Mode " : " Dark Mode "}
                </div>
            )}
        </div>
    );
};


const MailIcon = () => {
    return (
        <IoIosMail size='40' className='dark:text-invert-negative-1' />

    );
};

export default ToolBar;

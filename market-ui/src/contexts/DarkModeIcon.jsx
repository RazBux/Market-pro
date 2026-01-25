import React, { useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
// import { useDarkModeContext } from './DarkModeContext';

const DarkModeIcon = ({ darkTheme, setDarkTheme }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    // const { darkTheme, setDarkTheme } = useDarkModeContext();
    
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
export default DarkModeIcon;
import React, { createContext, useContext } from 'react';
import useDarkMode from '../hooks/useDarkMode'; 

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [darkTheme, setDarkTheme] = useDarkMode();

  return (
    <DarkModeContext.Provider value={{ darkTheme, setDarkTheme }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkModeContext = () => useContext(DarkModeContext);

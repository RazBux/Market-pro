import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import "../App.css";

const GET_TABLES_QUERY = gql`
  query GetTables {
    dbTables {
      tables
    }
  }
`;

const ToolBar = ({updateSelectedTable}) => {
    const [showTables, setShowTables] = useState(false);
    const { data, loading, error } = useQuery(GET_TABLES_QUERY);

    const handleSearchClick = () => {
        setShowTables(!showTables);
    };

    const handleTableClick = (tableName) => {
        console.log(`Table selected in ToolBar: ${tableName}`);
        setShowTables(false);
        updateSelectedTable(tableName); // Update the selected table in the parent component
      };
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const tableNames = data && data.dbTables && data.dbTables.tables ? data.dbTables.tables : [];

    return (
        <div className="toolbar">
            <div className="market">Market-pro</div>
            <div className="search-container">
                <input type="text" placeholder="Search company…" onClick={handleSearchClick}/>
                {showTables && (
                    <div className="dropdown">
                        {tableNames.map((table, index) => (
                            <div key={index} onClick={() => handleTableClick(table)} className="dropdown-item">
                                {table}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolBar;
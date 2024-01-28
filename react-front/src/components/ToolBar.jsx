import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import "../App.css";

const GET_TABLES_QUERY = gql`
  query GetTables {
    dbTables {
      tables
    }
  }
`;

const ToolBar = ({ updateSelectedTable }) => {
    //logo
    const [logo, setLogo] = useState('tesla');

    useEffect(() => {
        // Dynamically import the logo based on the selectedTable
        import(`../logo/${logo}.svg`)
            .then((logoModule) => {
                setLogo(logoModule.default);
            })
            .catch((error) => {
                console.error(`Error loading logo: ${error}`);
            });
    }, [logo]);


    const [showTables, setShowTables] = useState(false);
    const { data, loading, error } = useQuery(GET_TABLES_QUERY);

    const handleSearchClick = () => {
        setShowTables(!showTables);
    };

    const handleTableClick = (tableName) => {
        console.log(`Table selected in ToolBar: ${tableName}`);
        setShowTables(false);
        updateSelectedTable(tableName); // Update the selected table in the parent component
        setLogo(tableName);
    };




    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const tableNames = data && data.dbTables && data.dbTables.tables ? data.dbTables.tables : [];


    return (
        <div className="toolbar">
            <div className="market">Market-pro</div>
            <div className="search-container">
                <input type="text" placeholder="Search company…" onClick={handleSearchClick} />
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

            {/* Use the dynamically generated logo URL */}
            {logo && <img src={logo} alt={updateSelectedTable} style={{ width: '50px', marginLeft: '10px' }} />}


        </div>
    );
};

export default ToolBar;
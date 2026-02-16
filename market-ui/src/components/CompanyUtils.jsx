// // ===== BACKEND-DRIVEN UTILITY FUNCTIONS =====
// // All API calls go through the backend GraphQL server

// import React from 'react';
// import { useQuery, gql, useLazyQuery } from '@apollo/client';

// // Query to get all companies from database
// const GET_COMPANY_METADATA = gql`
//   query GetCompanyMetadata {
//     tables {
//       tables
//     }
//   }
// `;

// // Query to get company name from backend
// const GET_COMPANY_NAME = gql`
//   query GetCompanyName($symbol: String!) {
//     getCompanyName(symbol: $symbol) {
//       success
//       symbol
//       name
//       message
//     }
//   }
// `;

// // Query to get multiple company names from backend
// const GET_COMPANY_NAMES_BATCH = gql`
//   query GetCompanyNamesBatch($symbols: [String!]!) {
//     getCompanyNamesBatch(symbols: $symbols) {
//       success
//       companies {
//         symbol
//         name
//         success
//       }
//     }
//   }
// `;

// /**
//  * Custom hook to get all available companies from database
//  */
// export function useAvailableCompanies() {
//     const { data, loading, error, refetch } = useQuery(GET_COMPANY_METADATA, {
//         fetchPolicy: 'cache-and-network'
//     });

//     const companies = React.useMemo(() => {
//         if (!data?.tables?.tables) return [];

//         const symbolsSet = new Set();
//         data.tables.tables.forEach(tableName => {
//             const match = tableName.match(/income_statement_([A-Z]+)_(quarterly|annual)/);
//             if (match) {
//                 symbolsSet.add(match[1]);
//             }
//         });

//         return Array.from(symbolsSet)
//             .sort()
//             .map(symbol => ({
//                 value: symbol,
//                 label: symbol,
//                 symbol: symbol
//             }));
//     }, [data]);

//     return { companies, loading, error, refetch };
// }

// /**
//  * React hook to get company name with loading state
//  * Fetches from backend GraphQL
//  */
// export function useCompanyName(symbol) {
//     // eslint-disable-next-line no-unused-vars
//     const [getCompanyName, { data, loading }] = useLazyQuery(GET_COMPANY_NAME, {
//         fetchPolicy: 'cache-first' // Cache results to avoid repeated API calls
//     });

//     const [name, setName] = React.useState(symbol);
//     const [isLoading, setIsLoading] = React.useState(false);

//     React.useEffect(() => {
//         if (!symbol) return;

//         setIsLoading(true);
        
//         getCompanyName({ variables: { symbol } })
//             .then(result => {
//                 if (result.data?.getCompanyName?.success) {
//                     setName(result.data.getCompanyName.name);
//                 } else {
//                     setName(symbol);
//                 }
//                 setIsLoading(false);
//             })
//             .catch(error => {
//                 console.error('Error fetching company name:', error);
//                 setName(symbol);
//                 setIsLoading(false);
//             });
//     }, [symbol, getCompanyName]);

//     return { name, loading: isLoading };
// }

// /**
//  * React hook to prefetch company names for multiple symbols
//  * Useful for loading the dropdown
//  */
// export function usePrefetchCompanyNames(symbols) {
//     // eslint-disable-next-line no-unused-vars
//     const [getNames, { data, loading }] = useLazyQuery(GET_COMPANY_NAMES_BATCH, {
//         fetchPolicy: 'cache-first'
//     });

//     const [companyNames, setCompanyNames] = React.useState({});

//     React.useEffect(() => {
//         if (!symbols || symbols.length === 0) return;

//         getNames({ variables: { symbols } })
//             .then(result => {
//                 if (result.data?.getCompanyNamesBatch?.success) {
//                     const namesMap = {};
//                     result.data.getCompanyNamesBatch.companies.forEach(company => {
//                         if (company.success) {
//                             namesMap[company.symbol] = company.name;
//                         }
//                     });
//                     setCompanyNames(namesMap);
//                 }
//             })
//             .catch(error => {
//                 console.error('Error prefetching company names:', error);
//             });
//     }, [symbols, getNames]);

//     return { companyNames, loading };
// }

// /**
//  * Format company display with ticker and name
//  */
// export const formatCompanyDisplay = (symbol, name = null, options = {}) => {
//     const {
//         showSymbol = true,
//         showName = true,
//         separator = ' • ',
//         uppercase = true
//     } = options;

//     const displaySymbol = uppercase ? symbol.toUpperCase() : symbol;
//     const companyName = name || symbol;

//     if (showSymbol && showName && companyName !== symbol) {
//         return `${displaySymbol}${separator}${companyName}`;
//     } else if (showSymbol) {
//         return displaySymbol;
//     } else if (showName) {
//         return companyName;
//     }
    
//     return displaySymbol;
// };

// /**
//  * Get abbreviated company name for compact displays
//  */
// export const getCompanyNameShort = (symbol, name = null) => {
//     const fullName = name || symbol;
    
//     if (fullName === symbol) {
//         return symbol;
//     }
    
//     const cleaned = fullName
//         .replace(/\s+(Inc\.|Corporation|Ltd\.|Company|Co\.|Incorporated|plc|Class [A-C])$/i, '')
//         .trim();
    
//     if (cleaned.length > 25) {
//         return cleaned.substring(0, 22) + '...';
//     }
    
//     return cleaned;
// };

// // Export all utilities as named export object
// const CompanyUtils = {
//     useAvailableCompanies,
//     useCompanyName,
//     usePrefetchCompanyNames,
//     formatCompanyDisplay,
//     getCompanyNameShort
// };

// export default CompanyUtils;

// ===== BACKEND-DRIVEN UTILITY FUNCTIONS =====
// All API calls go through the backend GraphQL server

import React from 'react';
import { useQuery, gql, useLazyQuery } from '@apollo/client';

// Query to get all companies from database
const GET_COMPANY_METADATA = gql`
  query GetCompanyMetadata {
    tables {
      tables
    }
  }
`;

// Query to get company name from backend
const GET_COMPANY_NAME = gql`
  query GetCompanyName($symbol: String!) {
    getCompanyName(symbol: $symbol) {
      success
      symbol
      name
      message
    }
  }
`;

// Query to get multiple company names from backend
const GET_COMPANY_NAMES_BATCH = gql`
  query GetCompanyNamesBatch($symbols: [String!]!) {
    getCompanyNamesBatch(symbols: $symbols) {
      success
      companies {
        symbol
        name
        success
      }
    }
  }
`;

/**
 * Custom hook to get all available companies from database
 */
export function useAvailableCompanies() {
    const { data, loading, error, refetch } = useQuery(GET_COMPANY_METADATA, {
        fetchPolicy: 'cache-and-network'
    });

    const companies = React.useMemo(() => {
        if (!data?.tables?.tables) return [];

        const symbolsSet = new Set();
        data.tables.tables.forEach(tableName => {
            const match = tableName.match(/income_statement_([A-Z]+)_(quarterly|annual)/);
            if (match) {
                symbolsSet.add(match[1]);
            }
        });

        return Array.from(symbolsSet)
            .sort()
            .map(symbol => ({
                value: symbol,
                label: symbol,
                symbol: symbol
            }));
    }, [data]);

    return { companies, loading, error, refetch };
}

/**
 * React hook to get company name with loading state
 * Fetches from backend GraphQL
 */
export function useCompanyName(symbol) {
    // eslint-disable-next-line no-unused-vars
    const [getCompanyName, { data, loading }] = useLazyQuery(GET_COMPANY_NAME, {
        fetchPolicy: 'cache-first' // Cache results to avoid repeated API calls
    });

    const [name, setName] = React.useState(symbol);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        if (!symbol) return;

        setIsLoading(true);
        
        getCompanyName({ variables: { symbol } })
            .then(result => {
                if (result.data?.getCompanyName?.success) {
                    setName(result.data.getCompanyName.name);
                } else {
                    setName(symbol);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching company name:', error);
                setName(symbol);
                setIsLoading(false);
            });
    }, [symbol, getCompanyName]);

    return { name, loading: isLoading };
}

/**
 * React hook to prefetch company names for multiple symbols
 * Useful for loading the dropdown
 */
export function usePrefetchCompanyNames(symbols) {
    // eslint-disable-next-line no-unused-vars
    const [getNames, { data, loading }] = useLazyQuery(GET_COMPANY_NAMES_BATCH, {
        fetchPolicy: 'cache-first'
    });

    const [companyNames, setCompanyNames] = React.useState({});
    
    // Stabilize symbols array to prevent infinite loops
    const symbolsKey = React.useMemo(() => 
        JSON.stringify(symbols?.sort() || []), 
        [symbols]
    );

    React.useEffect(() => {
        const symbolsArray = JSON.parse(symbolsKey);
        if (!symbolsArray || symbolsArray.length === 0) return;

        getNames({ variables: { symbols: symbolsArray } })
            .then(result => {
                if (result.data?.getCompanyNamesBatch?.success) {
                    const namesMap = {};
                    result.data.getCompanyNamesBatch.companies.forEach(company => {
                        if (company.success) {
                            namesMap[company.symbol] = company.name;
                        }
                    });
                    setCompanyNames(namesMap);
                }
            })
            .catch(error => {
                console.error('Error prefetching company names:', error);
            });
    }, [symbolsKey, getNames]);

    return { companyNames, loading };
}

/**
 * Format company display with ticker and name
 */
export const formatCompanyDisplay = (symbol, name = null, options = {}) => {
    const {
        showSymbol = true,
        showName = true,
        separator = ' • ',
        uppercase = true
    } = options;

    const displaySymbol = uppercase ? symbol.toUpperCase() : symbol;
    const companyName = name || symbol;

    if (showSymbol && showName && companyName !== symbol) {
        return `${displaySymbol}${separator}${companyName}`;
    } else if (showSymbol) {
        return displaySymbol;
    } else if (showName) {
        return companyName;
    }
    
    return displaySymbol;
};

/**
 * Get abbreviated company name for compact displays
 */
export const getCompanyNameShort = (symbol, name = null) => {
    const fullName = name || symbol;
    
    if (fullName === symbol) {
        return symbol;
    }
    
    const cleaned = fullName
        .replace(/\s+(Inc\.|Corporation|Ltd\.|Company|Co\.|Incorporated|plc|Class [A-C])$/i, '')
        .trim();
    
    if (cleaned.length > 25) {
        return cleaned.substring(0, 22) + '...';
    }
    
    return cleaned;
};

// Export all utilities as named export object
const CompanyUtils = {
    useAvailableCompanies,
    useCompanyName,
    usePrefetchCompanyNames,
    formatCompanyDisplay,
    getCompanyNameShort
};

export default CompanyUtils;
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useMutation, useLazyQuery, gql } from '@apollo/client';
import { useAvailableCompanies, usePrefetchCompanyNames } from './CompanyUtils';

// GraphQL mutation to add a new company
const ADD_COMPANY = gql`
  mutation AddCompany($symbol: String!) {
    addCompany(symbol: $symbol) {
      success
      message
      symbol
      annualCount
      quarterlyCount
    }
  }
`;

// GraphQL query for live stock search
const SEARCH_COMPANIES = gql`
  query SearchCompanies($keywords: String!) {
    searchCompanies(keywords: $keywords) {
      success
      results {
        symbol
        name
        type
        region
        currency
      }
      message
    }
  }
`;

export default function CompanySearch({ darkTheme, onCompanyAdded }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loadingSymbol, setLoadingSymbol] = useState(null); // Track which symbol is being added
    const [message, setMessage] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // Get already added companies from database
    const { companies: addedCompanies, loading: loadingCompanies, refetch: refetchCompanies } = useAvailableCompanies();
    
    // Memoize symbols array to prevent infinite loops
    const symbolsToFetch = React.useMemo(() => 
        addedCompanies.map(c => c.symbol), 
        [addedCompanies]
    );
    
    const { companyNames } = usePrefetchCompanyNames(symbolsToFetch);

    const [addCompany] = useMutation(ADD_COMPANY);
    const [searchCompanies] = useLazyQuery(SEARCH_COMPANIES);

    // Log for debugging
    React.useEffect(() => {
        console.log('CompanySearch mounted');
        console.log('Added companies:', addedCompanies.length);
    }, [addedCompanies]);

    // Convert added companies to array of symbols for stable reference
    const addedSymbols = React.useMemo(() => 
        addedCompanies.map(c => c.symbol), 
        [addedCompanies]
    );

    // Live search with debouncing
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            setSearching(true);
            setSearchError(null);

            try {
                const result = await searchCompanies({
                    variables: { keywords: searchTerm }
                });

                if (result.data?.searchCompanies?.success) {
                    const results = result.data.searchCompanies.results || [];
                    // Filter out already added companies
                    const addedSet = new Set(addedSymbols);
                    const filteredResults = results.filter(r => !addedSet.has(r.symbol));
                    setSearchResults(filteredResults);
                } else {
                    setSearchError(result.data?.searchCompanies?.message || 'Search failed');
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchError('Failed to search. Please try again.');
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchCompanies, addedSymbols]);

    const handleAddCompany = async (symbol) => {
        console.log('🔄 Attempting to add company:', symbol);
        setLoadingSymbol(symbol);
        setMessage(null);

        try {
            console.log('📤 Sending mutation to backend...');
            const result = await addCompany({
                variables: { symbol: symbol.toUpperCase() }
            });

            console.log('📥 Received response:', result);
            const response = result.data?.addCompany;

            if (!response) {
                console.error('❌ No response data received');
                setMessage({
                    type: 'error',
                    text: 'No response from server. Please try again.'
                });
                setLoadingSymbol(null);
                return;
            }

            if (response.success) {
                console.log('✅ Company added successfully:', response);
                
                if (response.message && response.message.includes('fresh')) {
                    setMessage({
                        type: 'info',
                        text: `${symbol} data is already up to date!`
                    });
                } else {
                    setMessage({
                        type: 'success',
                        text: `✓ ${symbol} added successfully! (${response.annualCount} annual, ${response.quarterlyCount} quarterly reports)`
                    });
                }
                
                // Refresh the companies list
                console.log('🔄 Refetching companies list...');
                await refetchCompanies();
                
                // Notify parent component
                if (onCompanyAdded) {
                    onCompanyAdded(symbol.toUpperCase());
                }

                // Auto-close success message after 4 seconds
                setTimeout(() => {
                    setMessage(null);
                    setSearchTerm('');
                }, 4000);

            } else {
                console.error('❌ Failed to add company:', response.message);
                setMessage({
                    type: 'error',
                    text: response.message || 'Failed to add company'
                });
            }
        } catch (error) {
            console.error('❌ Error adding company:', error);
            console.error('Error details:', {
                message: error.message,
                graphQLErrors: error.graphQLErrors,
                networkError: error.networkError
            });
            
            setMessage({
                type: 'error',
                text: `Failed to add ${symbol}: ${error.message || 'Unknown error'}`
            });
        } finally {
            setLoadingSymbol(null);
        }
    };

    const handleClose = () => {
        console.log('🔴 Closing modal');
        setIsOpen(false);
        setSearchTerm('');
        setSearchResults([]);
        setMessage(null);
        setSearchError(null);
    };

    const handleBackdropClick = (e) => {
        console.log('🔴 Backdrop clicked');
        e.stopPropagation();
        handleClose();
    };

    const handleModalClick = (e) => {
        // Prevent closing when clicking inside modal
        e.stopPropagation();
    };

    return (
        <>
            {/* Search Button - Integrated in toolbar */}
            <button
                onClick={() => setIsOpen(true)}
                style={darkTheme ? styles.searchButtonDark : styles.searchButton}
                title="Add Company"
            >
                <span style={styles.searchIcon}>+</span>
                <span style={styles.searchButtonText}>Add Company</span>
            </button>

            {/* Full Screen Overlay Modal - Rendered via Portal */}
            {isOpen && ReactDOM.createPortal(
                <>
                    {/* Backdrop */}
                    <div 
                        style={styles.backdrop} 
                        onClick={handleBackdropClick}
                    />

                    {/* Modal - Centered on screen */}
                    <div 
                        style={darkTheme ? styles.modalDark : styles.modal}
                        onClick={handleModalClick}
                    >
                        {/* Header */}
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={darkTheme ? styles.modalTitleDark : styles.modalTitle}>
                                    Search & Add Company
                                </h2>
                                <p style={darkTheme ? styles.modalSubtitleDark : styles.modalSubtitle}>
                                    Search for companies and add them to your dashboard
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                style={darkTheme ? styles.closeButtonDark : styles.closeButton}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Success/Error Message */}
                        {message && (
                            <div style={{
                                ...styles.message,
                                ...(message.type === 'success' ? styles.messageSuccess : {}),
                                ...(message.type === 'error' ? styles.messageError : {}),
                                ...(message.type === 'info' ? styles.messageInfo : {})
                            }}>
                                {message.text}
                            </div>
                        )}

                        {/* Search Section - Made Primary */}
                        <div style={styles.searchSection}>
                            {/* Search Input */}
                            <div style={styles.searchInputWrapper}>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by company name or ticker symbol..."
                                    style={darkTheme ? styles.searchInputDark : styles.searchInput}
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSearchResults([]);
                                            setSearchError(null);
                                        }}
                                        style={darkTheme ? styles.clearButtonDark : styles.clearButton}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                                {searching && (
                                    <div style={styles.searchingIndicator}>
                                        <div style={styles.miniSpinner} />
                                    </div>
                                )}
                            </div>

                            {/* Search Error */}
                            {searchError && (
                                <div style={darkTheme ? styles.errorBoxDark : styles.errorBox}>
                                    {searchError}
                                </div>
                            )}

                            {/* Search Results */}
                            {searchTerm.length >= 2 && !searching && searchResults.length > 0 && (
                                <div style={styles.resultsContainer}>
                                    {searchResults.map((stock) => {
                                        const isAlreadyAdded = addedSymbols.includes(stock.symbol);
                                        const isLoading = loadingSymbol === stock.symbol;
                                        return (
                                            <button
                                                key={stock.symbol}
                                                onClick={() => !isAlreadyAdded && !isLoading && handleAddCompany(stock.symbol)}
                                                disabled={isAlreadyAdded || isLoading}
                                                style={{
                                                    ...(darkTheme ? styles.resultItemDark : styles.resultItem),
                                                    ...(isAlreadyAdded ? (darkTheme ? styles.resultItemAddedDark : styles.resultItemAdded) : {})
                                                }}
                                            >
                                                <div style={styles.resultContent}>
                                                    <div style={darkTheme ? styles.resultSymbolDark : styles.resultSymbol}>
                                                        {stock.symbol}
                                                    </div>
                                                    <div style={darkTheme ? styles.resultNameDark : styles.resultName}>
                                                        {stock.name}
                                                    </div>
                                                    {stock.currency && stock.currency !== 'USD' && (
                                                        <div style={styles.currencyBadge}>
                                                            {stock.currency}
                                                        </div>
                                                    )}
                                                </div>
                                                {isLoading ? (
                                                    <div style={styles.addingSpinner} />
                                                ) : isAlreadyAdded ? (
                                                    <span style={styles.addedBadge}>✓ Added</span>
                                                ) : (
                                                    <span style={darkTheme ? styles.addButtonBadgeDark : styles.addButtonBadge}>
                                                        + Add
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* No Results */}
                            {searchTerm.length >= 2 && !searching && searchResults.length === 0 && !searchError && (
                                <div style={darkTheme ? styles.noResultsDark : styles.noResults}>
                                    No companies found matching "{searchTerm}"
                                </div>
                            )}

                            {/* Instructions */}
                            {searchTerm.length === 0 && (
                                <div style={darkTheme ? styles.instructionsDark : styles.instructions}>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>🔍</span>
                                        <span>Type a company name (e.g., "Apple", "Microsoft")</span>
                                    </div>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>📊</span>
                                        <span>Or enter a stock ticker (e.g., "AAPL", "MSFT")</span>
                                    </div>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>✨</span>
                                        <span>Select from live results and click "+ Add"</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Already Added Companies Section - Made Secondary */}
                        <div style={styles.divider}></div>
                        
                        <div style={styles.section}>
                            <div style={styles.collapsibleHeader}>
                                <div style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
                                    Your Companies ({addedCompanies.length}) - Click to View
                                </div>
                            </div>
                            {loadingCompanies ? (
                                <div style={darkTheme ? styles.companiesContainerDark : styles.companiesContainer}>
                                    <span style={darkTheme ? styles.loadingTextDark : styles.loadingText}>
                                        Loading companies...
                                    </span>
                                </div>
                            ) : addedCompanies.length === 0 ? (
                                <div style={darkTheme ? styles.emptyStateDark : styles.emptyState}>
                                    <div style={styles.emptyStateIcon}>📊</div>
                                    <div style={darkTheme ? styles.emptyStateTitleDark : styles.emptyStateTitle}>
                                        No companies yet
                                    </div>
                                    <div style={darkTheme ? styles.emptyStateTextDark : styles.emptyStateText}>
                                        Search and add your first company to get started
                                    </div>
                                </div>
                            ) : (
                                <div style={darkTheme ? styles.companiesContainerDark : styles.companiesContainer}>
                                    {addedCompanies.map(company => (
                                        <button
                                            key={company.symbol}
                                            onClick={() => {
                                                console.log('🎯 Company clicked:', company.symbol);
                                                // Close modal
                                                handleClose();
                                                // Notify parent to select this company
                                                if (onCompanyAdded) {
                                                    onCompanyAdded(company.symbol);
                                                }
                                            }}
                                            style={darkTheme ? styles.companyBadgeButtonDark : styles.companyBadgeButton}
                                            title={`Switch to ${companyNames[company.symbol] || company.symbol}`}
                                        >
                                            <span style={styles.badgeSymbol}>{company.symbol}</span>
                                            {companyNames[company.symbol] && (
                                                <span style={darkTheme ? styles.badgeNameDark : styles.badgeName}>
                                                    {companyNames[company.symbol].length > 18 
                                                        ? companyNames[company.symbol].substring(0, 18) + '...'
                                                        : companyNames[company.symbol]
                                                    }
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

// Styles
const styles = {
    // Button in toolbar
    searchButton: {
        padding: '10px 18px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        whiteSpace: 'nowrap'
    },
    searchButtonDark: {
        padding: '10px 18px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        whiteSpace: 'nowrap'
    },
    searchIcon: {
        fontSize: '1.2rem',
        fontWeight: '700',
        lineHeight: '1'
    },
    searchButtonText: {
        display: 'inline'
    },

    // Full screen overlay
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        animation: 'fadeIn 0.2s ease'
    },

    // Centered modal
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 1000000,
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
        pointerEvents: 'auto'
    },
    modalDark: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
        zIndex: 1000000,
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s ease',
        pointerEvents: 'auto'
    },

    // Modal header
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
    },
    modalTitle: {
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#1f2937',
        margin: '0 0 8px 0',
        lineHeight: '1.2'
    },
    modalTitleDark: {
        fontSize: '1.875rem',
        fontWeight: '700',
        color: '#f1f5f9',
        margin: '0 0 8px 0',
        lineHeight: '1.2'
    },
    modalSubtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
        margin: 0,
        fontWeight: '400'
    },
    modalSubtitleDark: {
        fontSize: '0.95rem',
        color: '#94a3b8',
        margin: 0,
        fontWeight: '400'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        color: '#6b7280',
        cursor: 'pointer',
        padding: '0',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1'
    },
    closeButtonDark: {
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        color: '#94a3b8',
        cursor: 'pointer',
        padding: '0',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1'
    },

    // Sections
    section: {
        marginBottom: '20px'
    },
    searchSection: {
        marginBottom: '32px'
    },
    sectionTitle: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    sectionTitleDark: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    
    // Divider
    divider: {
        height: '1px',
        background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)',
        margin: '32px 0'
    },
    
    // Collapsible header
    collapsibleHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    // Added companies display
    companiesContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '10px',
        maxHeight: '140px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        minHeight: '60px'
    },
    companiesContainerDark: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '16px',
        background: '#0f172a',
        borderRadius: '10px',
        maxHeight: '140px',
        overflowY: 'auto',
        border: '1px solid #334155',
        minHeight: '60px'
    },
    companyBadge: {
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '10px 14px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '0.8rem',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s'
    },
    companyBadgeDark: {
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '10px 14px',
        background: '#0f172a',
        border: '2px solid #334155',
        borderRadius: '10px',
        fontSize: '0.8rem',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s'
    },
    companyBadgeButton: {
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '10px 14px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '0.8rem',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
        cursor: 'pointer',
        outline: 'none'
    },
    companyBadgeButtonDark: {
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '10px 14px',
        background: '#0f172a',
        border: '2px solid #334155',
        borderRadius: '10px',
        fontSize: '0.8rem',
        alignItems: 'center',
        gap: '4px',
        transition: 'all 0.2s',
        cursor: 'pointer',
        outline: 'none'
    },
    badgeSymbol: {
        fontSize: '1rem',
        fontWeight: '700',
        color: '#3b82f6'
    },
    badgeName: {
        fontSize: '0.7rem',
        color: '#6b7280',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: '1.2'
    },
    badgeNameDark: {
        fontSize: '0.7rem',
        color: '#94a3b8',
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: '1.2'
    },
    loadingText: {
        color: '#6b7280',
        fontSize: '0.9rem'
    },
    loadingTextDark: {
        color: '#94a3b8',
        fontSize: '0.9rem'
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    emptyTextDark: {
        color: '#64748b',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },

    // Search input
    searchInputWrapper: {
        position: 'relative',
        marginBottom: '20px'
    },
    searchInput: {
        width: '100%',
        padding: '16px 45px 16px 18px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        fontSize: '1rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    searchInputDark: {
        width: '100%',
        padding: '16px 45px 16px 18px',
        borderRadius: '12px',
        border: '2px solid #334155',
        background: '#0f172a',
        color: '#f1f5f9',
        fontSize: '1rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    clearButton: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '1.5rem',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.2s',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    clearButtonDark: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '1.5rem',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.2s',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchingIndicator: {
        position: 'absolute',
        right: '45px',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    miniSpinner: {
        width: '18px',
        height: '18px',
        border: '2px solid #e5e7eb',
        borderTop: '2px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },

    // Messages
    message: {
        padding: '14px 18px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontSize: '0.95rem',
        fontWeight: '500',
        animation: 'slideDown 0.3s ease'
    },
    messageSuccess: {
        background: '#d1fae5',
        color: '#065f46',
        border: '2px solid #10b981'
    },
    messageError: {
        background: '#fee2e2',
        color: '#991b1b',
        border: '2px solid #ef4444'
    },
    messageInfo: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '2px solid #3b82f6'
    },

    // Error box
    errorBox: {
        padding: '12px 16px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b',
        fontSize: '0.875rem',
        marginBottom: '12px'
    },
    errorBoxDark: {
        padding: '12px 16px',
        background: '#1e293b',
        border: '1px solid #475569',
        borderRadius: '8px',
        color: '#fca5a5',
        fontSize: '0.875rem',
        marginBottom: '12px'
    },

    // Search results
    resultsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '4px'
    },
    resultItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 18px',
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    resultItemDark: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 18px',
        background: '#0f172a',
        border: '2px solid #334155',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    resultItemAdded: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: '#f3f4f6'
    },
    resultItemAddedDark: {
        opacity: 0.5,
        cursor: 'not-allowed',
        background: '#1e293b'
    },
    resultContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    resultSymbol: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#1f2937'
    },
    resultSymbolDark: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#f1f5f9'
    },
    resultName: {
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: '500',
        lineHeight: '1.3'
    },
    resultNameDark: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        fontWeight: '500',
        lineHeight: '1.3'
    },
    currencyBadge: {
        display: 'inline-block',
        padding: '3px 8px',
        background: '#fef3c7',
        color: '#92400e',
        fontSize: '0.7rem',
        fontWeight: '600',
        borderRadius: '4px',
        marginTop: '4px',
        width: 'fit-content'
    },

    // Action badges
    addedBadge: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#10b981',
        padding: '8px 16px',
        background: '#d1fae5',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    addButtonBadge: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#667eea',
        padding: '8px 16px',
        background: '#ede9fe',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    addButtonBadgeDark: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#60a5fa',
        padding: '8px 16px',
        background: '#1e3a8a',
        borderRadius: '8px',
        transition: 'all 0.2s'
    },
    addingSpinner: {
        width: '16px',
        height: '16px',
        border: '2px solid #e5e7eb',
        borderTop: '2px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
    },

    // No results
    noResults: {
        padding: '20px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.95rem',
        background: '#f9fafb',
        borderRadius: '10px',
        border: '1px solid #e5e7eb'
    },
    noResultsDark: {
        padding: '20px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.95rem',
        background: '#0f172a',
        borderRadius: '10px',
        border: '1px solid #334155'
    },

    // Instructions
    instructions: {
        background: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#374151',
        lineHeight: '1.6',
        border: '1px solid #e5e7eb'
    },
    instructionsDark: {
        background: '#0f172a',
        padding: '20px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        color: '#cbd5e1',
        lineHeight: '1.6',
        border: '1px solid #334155'
    },
    instructionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
        fontSize: '0.9rem'
    },
    instructionIcon: {
        fontSize: '1.25rem',
        minWidth: '24px'
    },
    
    // Empty states
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '2px dashed #e5e7eb'
    },
    emptyStateDark: {
        textAlign: 'center',
        padding: '40px 20px',
        background: '#0f172a',
        borderRadius: '12px',
        border: '2px dashed #334155'
    },
    emptyStateIcon: {
        fontSize: '3rem',
        marginBottom: '16px',
        opacity: 0.5
    },
    emptyStateTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    emptyStateTitleDark: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: '8px'
    },
    emptyStateText: {
        fontSize: '0.9rem',
        color: '#6b7280'
    },
    emptyStateTextDark: {
        fontSize: '0.9rem',
        color: '#94a3b8'
    },
};

// Add animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, -48%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Hover effects for result items */
    button[style*="resultItem"]:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        border-color: #3b82f6 !important;
    }
    
    /* Hover effect for company badge buttons */
    button[style*="companyBadgeButton"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
        border-color: #3b82f6 !important;
        background: #f0f9ff !important;
    }
    
    button[style*="companyBadgeButtonDark"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        border-color: #3b82f6 !important;
        background: #1e3a8a !important;
    }
    
    /* Hover effect for company badges (non-button) */
    div[style*="companyBadge"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }
    
    /* Search input focus */
    input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    /* Hover effect for add button badge */
    span[style*="addButtonBadge"]:hover {
        transform: scale(1.05);
    }
    
    /* Mobile responsive styles */
    @media (max-width: 640px) {
        /* Modal adjustments for mobile */
        div[style*="modal"] {
            padding: 24px !important;
            width: 95% !important;
        }
    }
`;
document.head.appendChild(styleSheet);
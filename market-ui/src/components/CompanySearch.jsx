// import React, { useState, useRef, useCallback } from 'react';
// import ReactDOM from 'react-dom';
// import { useMutation, useLazyQuery, gql } from '@apollo/client';
// import { useAvailableCompanies } from './CompanyUtils';

// // ─── GraphQL ─────────────────────────────────────────────────────────────────

// const ADD_COMPANY = gql`
//   mutation AddCompany($symbol: String!) {
//     addCompany(symbol: $symbol) {
//       success
//       message
//       symbol
//       annualCount
//       quarterlyCount
//     }
//   }
// `;

// const SEARCH_COMPANIES = gql`
//   query SearchCompanies($keywords: String!) {
//     searchCompanies(keywords: $keywords) {
//       success
//       results {
//         symbol
//         name
//         type
//         region
//         currency
//       }
//       message
//     }
//   }
// `;

// // Single batch query — replaces N individual getCompanyName calls
// const GET_COMPANY_NAMES_BATCH = gql`
//   query GetCompanyNamesBatch($symbols: [String]) {
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

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function CompanySearch({ darkTheme, onCompanyAdded }) {
//     const [searchTerm, setSearchTerm]       = useState('');
//     const [isOpen, setIsOpen]               = useState(false);
//     const [loadingSymbol, setLoadingSymbol] = useState(null);
//     const [message, setMessage]             = useState(null);
//     const [searchResults, setSearchResults] = useState([]);
//     const [searching, setSearching]         = useState(false);
//     const [searchError, setSearchError]     = useState(null);
//     const inputRef = useRef(null);

//     // ── Companies list ──
//     const { companies: addedCompanies, loading: loadingCompanies, refetch: refetchCompanies } = useAvailableCompanies();

//     const symbolsToFetch = React.useMemo(
//         () => addedCompanies.map(c => c.symbol),
//         [addedCompanies]
//     );

//     // One batch query for all company names (DB-cached on backend)
//     const [fetchNamesBatch, { data: batchNamesData }] = useLazyQuery(GET_COMPANY_NAMES_BATCH);

//     React.useEffect(() => {
//         if (symbolsToFetch.length > 0) {
//             fetchNamesBatch({ variables: { symbols: symbolsToFetch } });
//         }
//     }, [symbolsToFetch, fetchNamesBatch]);

//     const companyNames = React.useMemo(() => {
//         const map = {};
//         batchNamesData?.getCompanyNamesBatch?.companies?.forEach(c => {
//             if (c.name) map[c.symbol] = c.name;
//         });
//         return map;
//     }, [batchNamesData]);

//     const addedSymbols = React.useMemo(
//         () => addedCompanies.map(c => c.symbol),
//         [addedCompanies]
//     );

//     const [addCompany]      = useMutation(ADD_COMPANY);
//     const [searchCompanies] = useLazyQuery(SEARCH_COMPANIES);

//     // ── Search — only fires on Enter or button click ──
//     const handleSearch = useCallback(async () => {
//         const q = searchTerm.trim();
//         if (q.length < 2) return;

//         setSearching(true);
//         setSearchError(null);
//         setSearchResults([]);

//         try {
//             const result = await searchCompanies({ variables: { keywords: q } });

//             if (result.data?.searchCompanies?.success) {
//                 const results = result.data.searchCompanies.results || [];
//                 const addedSet = new Set(addedSymbols);
//                 const filtered = results.filter(r => !addedSet.has(r.symbol));
//                 setSearchResults(filtered);
//                 if (filtered.length === 0) setSearchError(`No companies found matching "${q}"`);
//             } else {
//                 setSearchError(result.data?.searchCompanies?.message || 'Search failed');
//             }
//         } catch (error) {
//             console.error('Search error:', error);
//             setSearchError('Failed to search. Please try again.');
//         } finally {
//             setSearching(false);
//         }
//     }, [searchTerm, searchCompanies, addedSymbols]);

//     const handleKeyDown = (e) => {
//         if (e.key === 'Enter') handleSearch();
//     };

//     // ── Add company ──
//     const handleAddCompany = async (symbol) => {
//         setLoadingSymbol(symbol);
//         setMessage(null);

//         try {
//             const result = await addCompany({ variables: { symbol: symbol.toUpperCase() } });
//             const response = result.data?.addCompany;

//             if (!response) {
//                 setMessage({ type: 'error', text: 'No response from server. Please try again.' });
//                 setLoadingSymbol(null);
//                 return;
//             }

//             if (response.success) {
//                 if (response.message && response.message.includes('fresh')) {
//                     setMessage({ type: 'info', text: `${symbol} data is already up to date!` });
//                 } else {
//                     setMessage({
//                         type: 'success',
//                         text: `✓ ${symbol} added successfully! (${response.annualCount} annual, ${response.quarterlyCount} quarterly reports)`
//                     });
//                 }

//                 await refetchCompanies();
//                 // Refresh names batch after adding
//                 fetchNamesBatch({ variables: { symbols: [...addedSymbols, symbol.toUpperCase()] } });

//                 if (onCompanyAdded) onCompanyAdded(symbol.toUpperCase());

//                 // Remove from results so user sees it's been added
//                 setSearchResults(prev => prev.filter(r => r.symbol !== symbol));

//                 setTimeout(() => {
//                     setMessage(null);
//                     setSearchTerm('');
//                 }, 4000);
//             } else {
//                 setMessage({ type: 'error', text: response.message || 'Failed to add company' });
//             }
//         } catch (error) {
//             setMessage({ type: 'error', text: `Failed to add ${symbol}: ${error.message || 'Unknown error'}` });
//         } finally {
//             setLoadingSymbol(null);
//         }
//     };

//     const handleClose = () => {
//         setIsOpen(false);
//         setSearchTerm('');
//         setSearchResults([]);
//         setMessage(null);
//         setSearchError(null);
//     };

//     return (
//         <>
//             {/* ── Trigger Button ── */}
//             <button
//                 onClick={() => setIsOpen(true)}
//                 style={darkTheme ? styles.searchButtonDark : styles.searchButton}
//                 title="Add Company"
//             >
//                 <span style={styles.searchIcon}>+</span>
//                 <span style={styles.searchButtonText}>Add Company</span>
//             </button>

//             {/* ── Modal Portal ── */}
//             {isOpen && ReactDOM.createPortal(
//                 <>
//                     <div style={styles.backdrop} onClick={handleClose} />

//                     <div style={darkTheme ? styles.modalDark : styles.modal} onClick={e => e.stopPropagation()}>

//                         {/* Header */}
//                         <div style={styles.modalHeader}>
//                             <div>
//                                 <h2 style={darkTheme ? styles.modalTitleDark : styles.modalTitle}>
//                                     Search & Add Company
//                                 </h2>
//                                 <p style={darkTheme ? styles.modalSubtitleDark : styles.modalSubtitle}>
//                                     Search for companies and add them to your dashboard
//                                 </p>
//                             </div>
//                             <button onClick={handleClose} style={darkTheme ? styles.closeButtonDark : styles.closeButton} aria-label="Close">
//                                 ×
//                             </button>
//                         </div>

//                         {/* Message banner */}
//                         {message && (
//                             <div style={{
//                                 ...styles.message,
//                                 ...(message.type === 'success' ? styles.messageSuccess : {}),
//                                 ...(message.type === 'error'   ? styles.messageError   : {}),
//                                 ...(message.type === 'info'    ? styles.messageInfo    : {})
//                             }}>
//                                 {message.text}
//                             </div>
//                         )}

//                         {/* ── Search Section ── */}
//                         <div style={styles.searchSection}>

//                             {/* Input + button row */}
//                             <div style={styles.searchRow}>
//                                 <div style={styles.searchInputWrapper}>
//                                     <input
//                                         ref={inputRef}
//                                         type="text"
//                                         value={searchTerm}
//                                         onChange={e => {
//                                             setSearchTerm(e.target.value);
//                                             if (!e.target.value) {
//                                                 setSearchResults([]);
//                                                 setSearchError(null);
//                                             }
//                                         }}
//                                         onKeyDown={handleKeyDown}
//                                         placeholder="Search by company name or ticker symbol..."
//                                         style={darkTheme ? styles.searchInputDark : styles.searchInput}
//                                         autoFocus
//                                     />
//                                     {searchTerm && (
//                                         <button
//                                             onClick={() => { setSearchTerm(''); setSearchResults([]); setSearchError(null); }}
//                                             style={darkTheme ? styles.clearButtonDark : styles.clearButton}
//                                             aria-label="Clear"
//                                         >
//                                             ×
//                                         </button>
//                                     )}
//                                     {searching && (
//                                         <div style={styles.searchingIndicator}>
//                                             <div style={styles.miniSpinner} />
//                                         </div>
//                                     )}
//                                 </div>

//                                 <button
//                                     onClick={handleSearch}
//                                     disabled={searchTerm.length < 2 || searching}
//                                     style={{
//                                         ...(darkTheme ? styles.searchTriggerDark : styles.searchTrigger),
//                                         ...(searchTerm.length < 2 || searching ? styles.searchTriggerDisabled : {})
//                                     }}
//                                 >
//                                     {searching ? '…' : '🔍 Search'}
//                                 </button>
//                             </div>

//                             {/* Hint */}
//                             {searchTerm.length > 0 && searchTerm.length < 2 && (
//                                 <p style={darkTheme ? styles.hintDark : styles.hint}>Type at least 2 characters</p>
//                             )}

//                             {/* Instructions when empty */}
//                             {searchTerm.length === 0 && (
//                                 <div style={darkTheme ? styles.instructionsDark : styles.instructions}>
//                                     <div style={styles.instructionItem}>
//                                         <span style={styles.instructionIcon}>🔍</span>
//                                         <span>Type a company name (e.g., "Apple", "Microsoft")</span>
//                                     </div>
//                                     <div style={styles.instructionItem}>
//                                         <span style={styles.instructionIcon}>📊</span>
//                                         <span>Or enter a stock ticker (e.g., "AAPL", "MSFT")</span>
//                                     </div>
//                                     <div style={styles.instructionItem}>
//                                         <span style={styles.instructionIcon}>↵</span>
//                                         <span>Press <strong>Enter</strong> or click <strong>Search</strong> to find results</span>
//                                     </div>
//                                     <div style={styles.instructionItem}>
//                                         <span style={styles.instructionIcon}>✨</span>
//                                         <span>Click "+ Add" to add a company to your dashboard</span>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Search error */}
//                             {searchError && (
//                                 <div style={darkTheme ? styles.errorBoxDark : styles.errorBox}>
//                                     {searchError}
//                                 </div>
//                             )}

//                             {/* Results */}
//                             {!searching && searchResults.length > 0 && (
//                                 <div style={styles.resultsContainer}>
//                                     <div style={darkTheme ? styles.resultsLabelDark : styles.resultsLabel}>
//                                         {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
//                                     </div>
//                                     {searchResults.map(stock => {
//                                         const isLoading = loadingSymbol === stock.symbol;
//                                         return (
//                                             <button
//                                                 key={stock.symbol}
//                                                 onClick={() => !isLoading && handleAddCompany(stock.symbol)}
//                                                 disabled={isLoading}
//                                                 style={darkTheme ? styles.resultItemDark : styles.resultItem}
//                                             >
//                                                 <div style={styles.resultContent}>
//                                                     <div style={styles.resultTopRow}>
//                                                         <span style={darkTheme ? styles.resultSymbolDark : styles.resultSymbol}>
//                                                             {stock.symbol}
//                                                         </span>
//                                                         {stock.currency && stock.currency !== 'USD' && (
//                                                             <span style={styles.currencyBadge}>{stock.currency}</span>
//                                                         )}
//                                                     </div>
//                                                     <div style={darkTheme ? styles.resultNameDark : styles.resultName}>
//                                                         {stock.name}
//                                                     </div>
//                                                     {stock.region && (
//                                                         <div style={darkTheme ? styles.resultRegionDark : styles.resultRegion}>
//                                                             {stock.type} · {stock.region}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                                 {isLoading ? (
//                                                     <div style={styles.addingSpinner} />
//                                                 ) : (
//                                                     <span style={darkTheme ? styles.addButtonBadgeDark : styles.addButtonBadge}>
//                                                         + Add
//                                                     </span>
//                                                 )}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>
//                             )}
//                         </div>

//                         {/* ── Divider ── */}
//                         <div style={styles.divider} />

//                         {/* ── Your Companies ── */}
//                         <div style={styles.section}>
//                             <div style={darkTheme ? styles.sectionTitleDark : styles.sectionTitle}>
//                                 Your Companies ({addedCompanies.length}) — Click to View
//                             </div>
//                             {loadingCompanies ? (
//                                 <div style={darkTheme ? styles.companiesContainerDark : styles.companiesContainer}>
//                                     <span style={darkTheme ? styles.loadingTextDark : styles.loadingText}>
//                                         Loading companies...
//                                     </span>
//                                 </div>
//                             ) : addedCompanies.length === 0 ? (
//                                 <div style={darkTheme ? styles.emptyStateDark : styles.emptyState}>
//                                     <div style={styles.emptyStateIcon}>📊</div>
//                                     <div style={darkTheme ? styles.emptyStateTitleDark : styles.emptyStateTitle}>
//                                         No companies yet
//                                     </div>
//                                     <div style={darkTheme ? styles.emptyStateTextDark : styles.emptyStateText}>
//                                         Search and add your first company to get started
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div style={darkTheme ? styles.companiesContainerDark : styles.companiesContainer}>
//                                     {addedCompanies.map(company => (
//                                         <button
//                                             key={company.symbol}
//                                             onClick={() => { handleClose(); if (onCompanyAdded) onCompanyAdded(company.symbol); }}
//                                             style={darkTheme ? styles.companyBadgeButtonDark : styles.companyBadgeButton}
//                                             title={`Switch to ${companyNames[company.symbol] || company.symbol}`}
//                                         >
//                                             <span style={styles.badgeSymbol}>{company.symbol}</span>
//                                             {companyNames[company.symbol] && (
//                                                 <span style={darkTheme ? styles.badgeNameDark : styles.badgeName}>
//                                                     {companyNames[company.symbol].length > 18
//                                                         ? companyNames[company.symbol].substring(0, 18) + '...'
//                                                         : companyNames[company.symbol]
//                                                     }
//                                                 </span>
//                                             )}
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>,
//                 document.body
//             )}
//         </>
//     );
// }

// // ─── Styles (original UI — purple/blue gradients) ─────────────────────────────

// const styles = {
//     searchButton: {
//         padding: '10px 18px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white', border: 'none', borderRadius: '8px',
//         fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
//         transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
//         boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)', whiteSpace: 'nowrap'
//     },
//     searchButtonDark: {
//         padding: '10px 18px',
//         background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
//         color: 'white', border: 'none', borderRadius: '8px',
//         fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
//         transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
//         boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap'
//     },
//     searchIcon: { fontSize: '1.2rem', fontWeight: '700', lineHeight: '1' },
//     searchButtonText: { display: 'inline' },

//     backdrop: {
//         position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//         background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
//         zIndex: 999999, animation: 'fadeIn 0.2s ease'
//     },

//     modal: {
//         position: 'fixed', top: '50%', left: '50%',
//         transform: 'translate(-50%, -50%)',
//         background: 'white', borderRadius: '16px', padding: '32px',
//         boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
//         zIndex: 1000000, width: '90%', maxWidth: '700px',
//         maxHeight: '80vh', overflowY: 'auto',
//         animation: 'slideUp 0.3s ease', pointerEvents: 'auto'
//     },
//     modalDark: {
//         position: 'fixed', top: '50%', left: '50%',
//         transform: 'translate(-50%, -50%)',
//         background: '#1e293b', borderRadius: '16px', padding: '32px',
//         boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
//         border: '1px solid #334155',
//         zIndex: 1000000, width: '90%', maxWidth: '700px',
//         maxHeight: '80vh', overflowY: 'auto',
//         animation: 'slideUp 0.3s ease', pointerEvents: 'auto'
//     },

//     modalHeader: {
//         display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
//         marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb'
//     },
//     modalTitle:    { fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0', lineHeight: '1.2' },
//     modalTitleDark:{ fontSize: '1.875rem', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px 0', lineHeight: '1.2' },
//     modalSubtitle:    { fontSize: '0.95rem', color: '#6b7280', margin: 0, fontWeight: '400' },
//     modalSubtitleDark:{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, fontWeight: '400' },
//     closeButton: {
//         background: 'none', border: 'none', fontSize: '2rem', color: '#6b7280',
//         cursor: 'pointer', padding: '0', width: '32px', height: '32px',
//         borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1'
//     },
//     closeButtonDark: {
//         background: 'none', border: 'none', fontSize: '2rem', color: '#94a3b8',
//         cursor: 'pointer', padding: '0', width: '32px', height: '32px',
//         borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1'
//     },

//     section:       { marginBottom: '20px' },
//     searchSection: { marginBottom: '32px' },
//     sectionTitle: {
//         fontSize: '0.875rem', fontWeight: '600', color: '#374151',
//         marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'
//     },
//     sectionTitleDark: {
//         fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1',
//         marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'
//     },
//     divider: {
//         height: '1px',
//         background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)',
//         margin: '32px 0'
//     },

//     // Search row
//     searchRow: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' },
//     searchInputWrapper: { position: 'relative', flex: 1 },
//     searchInput: {
//         width: '100%', padding: '16px 70px 16px 18px',
//         borderRadius: '12px', border: '2px solid #e5e7eb',
//         fontSize: '1rem', fontWeight: '500', outline: 'none',
//         transition: 'all 0.2s', boxSizing: 'border-box',
//         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
//     },
//     searchInputDark: {
//         width: '100%', padding: '16px 70px 16px 18px',
//         borderRadius: '12px', border: '2px solid #334155',
//         background: '#0f172a', color: '#f1f5f9',
//         fontSize: '1rem', fontWeight: '500', outline: 'none',
//         transition: 'all 0.2s', boxSizing: 'border-box',
//         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
//     },
//     clearButton: {
//         position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
//         background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
//         fontSize: '1.5rem', padding: '4px', borderRadius: '4px',
//         width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
//     },
//     clearButtonDark: {
//         position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
//         background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
//         fontSize: '1.5rem', padding: '4px', borderRadius: '4px',
//         width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
//     },
//     searchingIndicator: { position: 'absolute', right: '44px', top: '50%', transform: 'translateY(-50%)' },
//     miniSpinner: {
//         width: '18px', height: '18px',
//         border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6',
//         borderRadius: '50%', animation: 'spin 0.8s linear infinite'
//     },

//     // Search trigger button (gradient, matches the toolbar button style)
//     searchTrigger: {
//         padding: '14px 20px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         color: 'white', border: 'none', borderRadius: '12px',
//         fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
//         whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
//         transition: 'all 0.2s'
//     },
//     searchTriggerDark: {
//         padding: '14px 20px',
//         background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
//         color: 'white', border: 'none', borderRadius: '12px',
//         fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
//         whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
//         transition: 'all 0.2s'
//     },
//     searchTriggerDisabled: {
//         opacity: 0.45, cursor: 'not-allowed',
//         background: '#9ca3af', boxShadow: 'none'
//     },

//     hint:     { fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 12px', fontStyle: 'italic' },
//     hintDark: { fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px', fontStyle: 'italic' },

//     message: {
//         padding: '14px 18px', borderRadius: '10px',
//         marginBottom: '20px', fontSize: '0.95rem', fontWeight: '500',
//         animation: 'slideDown 0.3s ease'
//     },
//     messageSuccess: { background: '#d1fae5', color: '#065f46', border: '2px solid #10b981' },
//     messageError:   { background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444' },
//     messageInfo:    { background: '#dbeafe', color: '#1e40af', border: '2px solid #3b82f6' },

//     errorBox: {
//         padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
//         borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', marginBottom: '12px'
//     },
//     errorBoxDark: {
//         padding: '12px 16px', background: '#1e293b', border: '1px solid #475569',
//         borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '12px'
//     },

//     resultsLabel: {
//         fontSize: '0.8rem', fontWeight: '600', color: '#6b7280',
//         marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
//     },
//     resultsLabelDark: {
//         fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8',
//         marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
//     },
//     resultsContainer: {
//         display: 'flex', flexDirection: 'column', gap: '10px',
//         maxHeight: '400px', overflowY: 'auto', padding: '4px'
//     },
//     resultItem: {
//         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         padding: '16px 18px', background: 'white', border: '2px solid #e5e7eb',
//         borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
//         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
//     },
//     resultItemDark: {
//         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//         padding: '16px 18px', background: '#0f172a', border: '2px solid #334155',
//         borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
//         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
//     },
//     resultContent:  { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
//     resultTopRow:   { display: 'flex', alignItems: 'center', gap: '8px' },
//     resultSymbol:   { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' },
//     resultSymbolDark: { fontSize: '1.1rem', fontWeight: '700', color: '#f1f5f9' },
//     resultName:     { fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', lineHeight: '1.3' },
//     resultNameDark: { fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500', lineHeight: '1.3' },
//     resultRegion:   { fontSize: '0.75rem', color: '#9ca3af' },
//     resultRegionDark: { fontSize: '0.75rem', color: '#64748b' },
//     currencyBadge: {
//         display: 'inline-block', padding: '3px 8px',
//         background: '#fef3c7', color: '#92400e',
//         fontSize: '0.7rem', fontWeight: '600', borderRadius: '4px', width: 'fit-content'
//     },
//     addButtonBadge: {
//         fontSize: '0.85rem', fontWeight: '600', color: '#667eea',
//         padding: '8px 16px', background: '#ede9fe', borderRadius: '8px', transition: 'all 0.2s'
//     },
//     addButtonBadgeDark: {
//         fontSize: '0.85rem', fontWeight: '600', color: '#60a5fa',
//         padding: '8px 16px', background: '#1e3a8a', borderRadius: '8px', transition: 'all 0.2s'
//     },
//     addingSpinner: {
//         width: '16px', height: '16px',
//         border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6',
//         borderRadius: '50%', animation: 'spin 0.8s linear infinite'
//     },

//     instructions: {
//         background: '#f9fafb', padding: '20px', borderRadius: '12px',
//         fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', border: '1px solid #e5e7eb'
//     },
//     instructionsDark: {
//         background: '#0f172a', padding: '20px', borderRadius: '12px',
//         fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', border: '1px solid #334155'
//     },
//     instructionItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.9rem' },
//     instructionIcon: { fontSize: '1.25rem', minWidth: '24px' },

//     companiesContainer: {
//         display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px',
//         background: '#f9fafb', borderRadius: '10px', maxHeight: '140px',
//         overflowY: 'auto', border: '1px solid #e5e7eb', minHeight: '60px'
//     },
//     companiesContainerDark: {
//         display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px',
//         background: '#0f172a', borderRadius: '10px', maxHeight: '140px',
//         overflowY: 'auto', border: '1px solid #334155', minHeight: '60px'
//     },
//     companyBadgeButton: {
//         display: 'inline-flex', flexDirection: 'column', padding: '10px 14px',
//         background: 'white', border: '2px solid #e5e7eb', borderRadius: '10px',
//         fontSize: '0.8rem', alignItems: 'center', gap: '4px',
//         transition: 'all 0.2s', cursor: 'pointer', outline: 'none'
//     },
//     companyBadgeButtonDark: {
//         display: 'inline-flex', flexDirection: 'column', padding: '10px 14px',
//         background: '#0f172a', border: '2px solid #334155', borderRadius: '10px',
//         fontSize: '0.8rem', alignItems: 'center', gap: '4px',
//         transition: 'all 0.2s', cursor: 'pointer', outline: 'none'
//     },
//     badgeSymbol:  { fontSize: '1rem', fontWeight: '700', color: '#3b82f6' },
//     badgeName:    { fontSize: '0.7rem', color: '#6b7280', fontWeight: '500', textAlign: 'center', lineHeight: '1.2' },
//     badgeNameDark:{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500', textAlign: 'center', lineHeight: '1.2' },
//     loadingText:    { color: '#6b7280', fontSize: '0.9rem' },
//     loadingTextDark:{ color: '#94a3b8', fontSize: '0.9rem' },

//     emptyState: {
//         textAlign: 'center', padding: '40px 20px',
//         background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb'
//     },
//     emptyStateDark: {
//         textAlign: 'center', padding: '40px 20px',
//         background: '#0f172a', borderRadius: '12px', border: '2px dashed #334155'
//     },
//     emptyStateIcon:     { fontSize: '3rem', marginBottom: '16px', opacity: 0.5 },
//     emptyStateTitle:    { fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '8px' },
//     emptyStateTitleDark:{ fontSize: '1.1rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' },
//     emptyStateText:     { fontSize: '0.9rem', color: '#6b7280' },
//     emptyStateTextDark: { fontSize: '0.9rem', color: '#94a3b8' },
// };

// // ─── Inject animations ────────────────────────────────────────────────────────
// const styleSheet = document.createElement('style');
// styleSheet.textContent = `
//     @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
//     @keyframes slideUp {
//         from { opacity: 0; transform: translate(-50%, -48%); }
//         to   { opacity: 1; transform: translate(-50%, -50%); }
//     }
//     @keyframes slideDown {
//         from { opacity: 0; transform: translateY(-10px); }
//         to   { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes spin {
//         0%   { transform: rotate(0deg); }
//         100% { transform: rotate(360deg); }
//     }
//     input:focus {
//         border-color: #3b82f6 !important;
//         box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
//     }
// `;
// document.head.appendChild(styleSheet);




import React, { useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useMutation, useLazyQuery, gql } from '@apollo/client';
import { useAvailableCompanies } from './CompanyUtils';

// ─── GraphQL ──────────────────────────────────────────────────────────────────

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

const SEARCH_COMPANIES = gql`
  query SearchCompanies($keywords: String!) {
    searchCompanies(keywords: $keywords) {
      success
      results { symbol name type region currency }
      message
    }
  }
`;

// One batch query replaces N individual name calls.
// Backend checks DB cache first — only hits Alpha Vantage for unknown symbols.
const GET_COMPANY_NAMES_BATCH = gql`
  query GetCompanyNamesBatch($symbols: [String]) {
    getCompanyNamesBatch(symbols: $symbols) {
      success
      companies { symbol name success }
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompanySearch({ darkTheme, onCompanyAdded }) {
    const [searchTerm, setSearchTerm]       = useState('');
    const [isOpen, setIsOpen]               = useState(false);
    const [loadingSymbol, setLoadingSymbol] = useState(null);
    const [message, setMessage]             = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching]         = useState(false);
    const [searchError, setSearchError]     = useState(null);
    const inputRef = useRef(null);

    // ── Company list from DB ──
    const {
        companies: addedCompanies,
        loading: loadingCompanies,
        refetch: refetchCompanies
    } = useAvailableCompanies();

    // Stable symbol list — used as dependency so the batch query only re-fires
    // when the actual list changes, not on every render.
    const symbolsKey = addedCompanies.map(c => c.symbol).join(',');
    const symbolsToFetch = React.useMemo(
        () => addedCompanies.map(c => c.symbol),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [symbolsKey]
    );

    const [fetchNamesBatch, { data: batchNamesData }] = useLazyQuery(
        GET_COMPANY_NAMES_BATCH,
        { fetchPolicy: 'cache-first' }  // Apollo cache — won't even hit the backend if already fetched
    );

    // Fire batch query once when the modal opens OR when companies list changes.
    // NOT on every render. The backend does DB lookup (free), API only for unknowns.
    const hasFetchedRef = React.useRef(false);
    React.useEffect(() => {
        if (isOpen && symbolsToFetch.length > 0) {
            fetchNamesBatch({ variables: { symbols: symbolsToFetch } });
            hasFetchedRef.current = true;
        }
    }, [isOpen, symbolsToFetch, fetchNamesBatch]);

    // Build symbol → name map from batch result
    const companyNames = React.useMemo(() => {
        const map = {};
        batchNamesData?.getCompanyNamesBatch?.companies?.forEach(c => {
            if (c.name) map[c.symbol] = c.name;
        });
        return map;
    }, [batchNamesData]);

    const addedSymbolsSet = React.useMemo(
        () => new Set(addedCompanies.map(c => c.symbol)),
        [addedCompanies]
    );

    const [addCompany]      = useMutation(ADD_COMPANY);
    const [searchCompanies] = useLazyQuery(SEARCH_COMPANIES, { fetchPolicy: 'no-cache' });

    // ── Search — fires ONLY on Enter or button click ──
    const handleSearch = useCallback(async () => {
        const q = searchTerm.trim();
        if (q.length < 2) return;

        setSearching(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const result = await searchCompanies({ variables: { keywords: q } });

            if (result.data?.searchCompanies?.success) {
                const results  = result.data.searchCompanies.results || [];
                const filtered = results.filter(r => !addedSymbolsSet.has(r.symbol));
                setSearchResults(filtered);
                if (filtered.length === 0) setSearchError(`No companies found matching "${q}"`);
            } else {
                setSearchError(result.data?.searchCompanies?.message || 'Search failed');
            }
        } catch (err) {
            console.error('Search error:', err);
            setSearchError('Failed to search. Please try again.');
        } finally {
            setSearching(false);
        }
    }, [searchTerm, searchCompanies, addedSymbolsSet]);

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    // ── Add company to DB ──
    const handleAddCompany = async (symbol) => {
        setLoadingSymbol(symbol);
        setMessage(null);

        try {
            const result   = await addCompany({ variables: { symbol: symbol.toUpperCase() } });
            const response = result.data?.addCompany;

            if (!response) {
                setMessage({ type: 'error', text: 'No response from server. Please try again.' });
                return;
            }

            if (response.success) {
                setMessage({
                    type: response.message?.includes('fresh') ? 'info' : 'success',
                    text: response.message?.includes('fresh')
                        ? `${symbol} data is already up to date!`
                        : `✓ ${symbol} added! (${response.annualCount} annual, ${response.quarterlyCount} quarterly reports)`
                });

                await refetchCompanies();

                // Refresh name batch to include the newly added symbol
                const newSymbols = [...Array.from(addedSymbolsSet), symbol.toUpperCase()];
                fetchNamesBatch({ variables: { symbols: newSymbols } });

                if (onCompanyAdded) onCompanyAdded(symbol.toUpperCase());

                // Remove from search results (it's now added)
                setSearchResults(prev => prev.filter(r => r.symbol !== symbol));

                setTimeout(() => { setMessage(null); setSearchTerm(''); }, 4000);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to add company' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: `Failed to add ${symbol}: ${err.message || 'Unknown error'}` });
        } finally {
            setLoadingSymbol(null);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchTerm('');
        setSearchResults([]);
        setMessage(null);
        setSearchError(null);
    };

    const d = darkTheme;

    return (
        <>
            {/* ── Trigger Button ── */}
            <button
                onClick={() => setIsOpen(true)}
                style={d ? styles.searchButtonDark : styles.searchButton}
                title="Add Company"
            >
                <span style={styles.searchIcon}>+</span>
                <span style={styles.searchButtonText}>Add Company</span>
            </button>

            {/* ── Modal Portal ── */}
            {isOpen && ReactDOM.createPortal(
                <>
                    <div style={styles.backdrop} onClick={handleClose} />

                    <div style={d ? styles.modalDark : styles.modal} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={d ? styles.modalTitleDark : styles.modalTitle}>
                                    Search & Add Company
                                </h2>
                                <p style={d ? styles.modalSubtitleDark : styles.modalSubtitle}>
                                    Search for companies and add them to your dashboard
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                style={d ? styles.closeButtonDark : styles.closeButton}
                                aria-label="Close"
                            >×</button>
                        </div>

                        {/* Message banner */}
                        {message && (
                            <div style={{
                                ...styles.message,
                                ...(message.type === 'success' ? styles.messageSuccess : {}),
                                ...(message.type === 'error'   ? styles.messageError   : {}),
                                ...(message.type === 'info'    ? styles.messageInfo    : {})
                            }}>
                                {message.text}
                            </div>
                        )}

                        {/* ── Search Section ── */}
                        <div style={styles.searchSection}>

                            {/* Input + Search button row */}
                            <div style={styles.searchRow}>
                                <div style={styles.searchInputWrapper}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            if (!e.target.value) { setSearchResults([]); setSearchError(null); }
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Search by company name or ticker symbol..."
                                        style={d ? styles.searchInputDark : styles.searchInput}
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => { setSearchTerm(''); setSearchResults([]); setSearchError(null); }}
                                            style={d ? styles.clearButtonDark : styles.clearButton}
                                            aria-label="Clear"
                                        >×</button>
                                    )}
                                    {searching && (
                                        <div style={styles.searchingIndicator}>
                                            <div style={styles.miniSpinner} />
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSearch}
                                    disabled={searchTerm.length < 2 || searching}
                                    style={{
                                        ...(d ? styles.searchTriggerDark : styles.searchTrigger),
                                        ...(searchTerm.length < 2 || searching ? styles.searchTriggerDisabled : {})
                                    }}
                                >
                                    {searching ? '…' : '🔍 Search'}
                                </button>
                            </div>

                            {/* Hint */}
                            {searchTerm.length === 1 && (
                                <p style={d ? styles.hintDark : styles.hint}>Type at least 2 characters</p>
                            )}

                            {/* Instructions (shown when input is empty) */}
                            {searchTerm.length === 0 && (
                                <div style={d ? styles.instructionsDark : styles.instructions}>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>🔍</span>
                                        <span>Type a company name (e.g., "Apple", "Microsoft")</span>
                                    </div>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>📊</span>
                                        <span>Or enter a stock ticker (e.g., "AAPL", "MSFT")</span>
                                    </div>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>↵</span>
                                        <span>Press <strong>Enter</strong> or click <strong>Search</strong> to find results</span>
                                    </div>
                                    <div style={styles.instructionItem}>
                                        <span style={styles.instructionIcon}>✨</span>
                                        <span>Click "+ Add" to add a company to your dashboard</span>
                                    </div>
                                </div>
                            )}

                            {/* Search error */}
                            {searchError && (
                                <div style={d ? styles.errorBoxDark : styles.errorBox}>
                                    {searchError}
                                </div>
                            )}

                            {/* Results list */}
                            {!searching && searchResults.length > 0 && (
                                <div style={styles.resultsContainer}>
                                    <div style={d ? styles.resultsLabelDark : styles.resultsLabel}>
                                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                    </div>
                                    {searchResults.map(stock => {
                                        const isLoading = loadingSymbol === stock.symbol;
                                        return (
                                            <button
                                                key={stock.symbol}
                                                onClick={() => !isLoading && handleAddCompany(stock.symbol)}
                                                disabled={isLoading}
                                                style={d ? styles.resultItemDark : styles.resultItem}
                                            >
                                                <div style={styles.resultContent}>
                                                    <div style={styles.resultTopRow}>
                                                        <span style={d ? styles.resultSymbolDark : styles.resultSymbol}>
                                                            {stock.symbol}
                                                        </span>
                                                        {stock.currency && stock.currency !== 'USD' && (
                                                            <span style={styles.currencyBadge}>{stock.currency}</span>
                                                        )}
                                                    </div>
                                                    <div style={d ? styles.resultNameDark : styles.resultName}>
                                                        {stock.name}
                                                    </div>
                                                    {stock.region && (
                                                        <div style={d ? styles.resultRegionDark : styles.resultRegion}>
                                                            {stock.type} · {stock.region}
                                                        </div>
                                                    )}
                                                </div>
                                                {isLoading
                                                    ? <div style={styles.addingSpinner} />
                                                    : <span style={d ? styles.addButtonBadgeDark : styles.addButtonBadge}>+ Add</span>
                                                }
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── Divider ── */}
                        <div style={styles.divider} />

                        {/* ── Your Companies ── */}
                        <div style={styles.section}>
                            <div style={d ? styles.sectionTitleDark : styles.sectionTitle}>
                                Your Companies ({addedCompanies.length}) — Click to View
                            </div>

                            {loadingCompanies ? (
                                <div style={d ? styles.companiesContainerDark : styles.companiesContainer}>
                                    <span style={d ? styles.loadingTextDark : styles.loadingText}>
                                        Loading companies...
                                    </span>
                                </div>
                            ) : addedCompanies.length === 0 ? (
                                <div style={d ? styles.emptyStateDark : styles.emptyState}>
                                    <div style={styles.emptyStateIcon}>📊</div>
                                    <div style={d ? styles.emptyStateTitleDark : styles.emptyStateTitle}>No companies yet</div>
                                    <div style={d ? styles.emptyStateTextDark : styles.emptyStateText}>
                                        Search and add your first company to get started
                                    </div>
                                </div>
                            ) : (
                                <div style={d ? styles.companiesContainerDark : styles.companiesContainer}>
                                    {addedCompanies.map(company => (
                                        <button
                                            key={company.symbol}
                                            onClick={() => {
                                                handleClose();
                                                if (onCompanyAdded) onCompanyAdded(company.symbol);
                                            }}
                                            style={d ? styles.companyBadgeButtonDark : styles.companyBadgeButton}
                                            title={`Switch to ${companyNames[company.symbol] || company.symbol}`}
                                        >
                                            <span style={styles.badgeSymbol}>{company.symbol}</span>
                                            {companyNames[company.symbol] && (
                                                <span style={d ? styles.badgeNameDark : styles.badgeName}>
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

// ─── Styles (original UI — purple/blue gradients) ─────────────────────────────

const styles = {
    searchButton: {
        padding: '10px 18px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)', whiteSpace: 'nowrap'
    },
    searchButtonDark: {
        padding: '10px 18px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)', whiteSpace: 'nowrap'
    },
    searchIcon:       { fontSize: '1.2rem', fontWeight: '700', lineHeight: '1' },
    searchButtonText: { display: 'inline' },

    backdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
        zIndex: 999999, animation: 'fadeIn 0.2s ease'
    },

    modal: {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: '16px', padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        zIndex: 1000000, width: '90%', maxWidth: '700px',
        maxHeight: '80vh', overflowY: 'auto',
        animation: 'slideUp 0.3s ease', pointerEvents: 'auto'
    },
    modalDark: {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: '#1e293b', borderRadius: '16px', padding: '32px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid #334155',
        zIndex: 1000000, width: '90%', maxWidth: '700px',
        maxHeight: '80vh', overflowY: 'auto',
        animation: 'slideUp 0.3s ease', pointerEvents: 'auto'
    },

    modalHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb'
    },
    modalTitle:       { fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0', lineHeight: '1.2' },
    modalTitleDark:   { fontSize: '1.875rem', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px 0', lineHeight: '1.2' },
    modalSubtitle:    { fontSize: '0.95rem', color: '#6b7280', margin: 0, fontWeight: '400' },
    modalSubtitleDark:{ fontSize: '0.95rem', color: '#94a3b8', margin: 0, fontWeight: '400' },
    closeButton: {
        background: 'none', border: 'none', fontSize: '2rem', color: '#6b7280',
        cursor: 'pointer', padding: '0', width: '32px', height: '32px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1'
    },
    closeButtonDark: {
        background: 'none', border: 'none', fontSize: '2rem', color: '#94a3b8',
        cursor: 'pointer', padding: '0', width: '32px', height: '32px',
        borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1'
    },

    section:       { marginBottom: '20px' },
    searchSection: { marginBottom: '32px' },
    sectionTitle: {
        fontSize: '0.875rem', fontWeight: '600', color: '#374151',
        marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    sectionTitleDark: {
        fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1',
        marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    divider: {
        height: '1px',
        background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)',
        margin: '32px 0'
    },

    searchRow:          { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' },
    searchInputWrapper: { position: 'relative', flex: 1 },
    searchInput: {
        width: '100%', padding: '16px 70px 16px 18px',
        borderRadius: '12px', border: '2px solid #e5e7eb',
        fontSize: '1rem', fontWeight: '500', outline: 'none',
        transition: 'all 0.2s', boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    searchInputDark: {
        width: '100%', padding: '16px 70px 16px 18px',
        borderRadius: '12px', border: '2px solid #334155',
        background: '#0f172a', color: '#f1f5f9',
        fontSize: '1rem', fontWeight: '500', outline: 'none',
        transition: 'all 0.2s', boxSizing: 'border-box',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    clearButton: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
        fontSize: '1.5rem', padding: '4px', borderRadius: '4px',
        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    clearButtonDark: {
        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
        fontSize: '1.5rem', padding: '4px', borderRadius: '4px',
        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    searchingIndicator: { position: 'absolute', right: '44px', top: '50%', transform: 'translateY(-50%)' },
    miniSpinner: {
        width: '18px', height: '18px',
        border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite'
    },

    searchTrigger: {
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
        whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)', transition: 'all 0.2s'
    },
    searchTriggerDark: {
        padding: '14px 20px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
        whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'
    },
    searchTriggerDisabled: { opacity: 0.45, cursor: 'not-allowed', background: '#9ca3af', boxShadow: 'none' },

    hint:     { fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 12px', fontStyle: 'italic' },
    hintDark: { fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px', fontStyle: 'italic' },

    message: {
        padding: '14px 18px', borderRadius: '10px',
        marginBottom: '20px', fontSize: '0.95rem', fontWeight: '500',
        animation: 'slideDown 0.3s ease'
    },
    messageSuccess: { background: '#d1fae5', color: '#065f46', border: '2px solid #10b981' },
    messageError:   { background: '#fee2e2', color: '#991b1b', border: '2px solid #ef4444' },
    messageInfo:    { background: '#dbeafe', color: '#1e40af', border: '2px solid #3b82f6' },

    errorBox: {
        padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
        borderRadius: '8px', color: '#991b1b', fontSize: '0.875rem', marginBottom: '12px'
    },
    errorBoxDark: {
        padding: '12px 16px', background: '#1e293b', border: '1px solid #475569',
        borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem', marginBottom: '12px'
    },

    resultsLabel: {
        fontSize: '0.8rem', fontWeight: '600', color: '#6b7280',
        marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    resultsLabelDark: {
        fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8',
        marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    resultsContainer: {
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxHeight: '400px', overflowY: 'auto', padding: '4px'
    },
    resultItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 18px', background: 'white', border: '2px solid #e5e7eb',
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    resultItemDark: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 18px', background: '#0f172a', border: '2px solid #334155',
        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    },
    resultContent:    { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
    resultTopRow:     { display: 'flex', alignItems: 'center', gap: '8px' },
    resultSymbol:     { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937' },
    resultSymbolDark: { fontSize: '1.1rem', fontWeight: '700', color: '#f1f5f9' },
    resultName:       { fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', lineHeight: '1.3' },
    resultNameDark:   { fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500', lineHeight: '1.3' },
    resultRegion:     { fontSize: '0.75rem', color: '#9ca3af' },
    resultRegionDark: { fontSize: '0.75rem', color: '#64748b' },
    currencyBadge: {
        display: 'inline-block', padding: '3px 8px',
        background: '#fef3c7', color: '#92400e',
        fontSize: '0.7rem', fontWeight: '600', borderRadius: '4px', width: 'fit-content'
    },
    addButtonBadge: {
        fontSize: '0.85rem', fontWeight: '600', color: '#667eea',
        padding: '8px 16px', background: '#ede9fe', borderRadius: '8px', transition: 'all 0.2s'
    },
    addButtonBadgeDark: {
        fontSize: '0.85rem', fontWeight: '600', color: '#60a5fa',
        padding: '8px 16px', background: '#1e3a8a', borderRadius: '8px', transition: 'all 0.2s'
    },
    addingSpinner: {
        width: '16px', height: '16px',
        border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite'
    },

    instructions: {
        background: '#f9fafb', padding: '20px', borderRadius: '12px',
        fontSize: '0.9rem', color: '#374151', lineHeight: '1.6', border: '1px solid #e5e7eb'
    },
    instructionsDark: {
        background: '#0f172a', padding: '20px', borderRadius: '12px',
        fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', border: '1px solid #334155'
    },
    instructionItem: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '0.9rem' },
    instructionIcon: { fontSize: '1.25rem', minWidth: '24px' },

    companiesContainer: {
        display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px',
        background: '#f9fafb', borderRadius: '10px', maxHeight: '140px',
        overflowY: 'auto', border: '1px solid #e5e7eb', minHeight: '60px'
    },
    companiesContainerDark: {
        display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px',
        background: '#0f172a', borderRadius: '10px', maxHeight: '140px',
        overflowY: 'auto', border: '1px solid #334155', minHeight: '60px'
    },
    companyBadgeButton: {
        display: 'inline-flex', flexDirection: 'column', padding: '10px 14px',
        background: 'white', border: '2px solid #e5e7eb', borderRadius: '10px',
        fontSize: '0.8rem', alignItems: 'center', gap: '4px',
        transition: 'all 0.2s', cursor: 'pointer', outline: 'none'
    },
    companyBadgeButtonDark: {
        display: 'inline-flex', flexDirection: 'column', padding: '10px 14px',
        background: '#0f172a', border: '2px solid #334155', borderRadius: '10px',
        fontSize: '0.8rem', alignItems: 'center', gap: '4px',
        transition: 'all 0.2s', cursor: 'pointer', outline: 'none'
    },
    badgeSymbol:   { fontSize: '1rem', fontWeight: '700', color: '#3b82f6' },
    badgeName:     { fontSize: '0.7rem', color: '#6b7280', fontWeight: '500', textAlign: 'center', lineHeight: '1.2' },
    badgeNameDark: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '500', textAlign: 'center', lineHeight: '1.2' },
    loadingText:     { color: '#6b7280', fontSize: '0.9rem' },
    loadingTextDark: { color: '#94a3b8', fontSize: '0.9rem' },

    emptyState: {
        textAlign: 'center', padding: '40px 20px',
        background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb'
    },
    emptyStateDark: {
        textAlign: 'center', padding: '40px 20px',
        background: '#0f172a', borderRadius: '12px', border: '2px dashed #334155'
    },
    emptyStateIcon:      { fontSize: '3rem', marginBottom: '16px', opacity: 0.5 },
    emptyStateTitle:     { fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '8px' },
    emptyStateTitleDark: { fontSize: '1.1rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' },
    emptyStateText:      { fontSize: '0.9rem', color: '#6b7280' },
    emptyStateTextDark:  { fontSize: '0.9rem', color: '#94a3b8' },
};

// ─── Animations ───────────────────────────────────────────────────────────────
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp {
        from { opacity: 0; transform: translate(-50%, -48%); }
        to   { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
`;
document.head.appendChild(styleSheet);
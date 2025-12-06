import { useState, useEffect, useMemo } from 'react';
import { Search, X, Filter, Calendar, Clock, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const FilterPanel = ({ 
  allInterviewers, 
  onFilterChange, 
  initialFilters = {},
  isMobile = false 
}) => {
  // State for all filter options
  const [showFilters, setShowFilters] = useState(!isMobile); // Show filters by default on desktop
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [roles, setRoles] = useState(initialFilters.roles || []);
  const [interviewer, setInterviewer] = useState(initialFilters.interviewer || '');
  const [dateRange, setDateRange] = useState({
    from: initialFilters.dateFrom || '',
    to: initialFilters.dateTo || ''
  });
  const [syncStatus, setSyncStatus] = useState(initialFilters.syncStatus || 'all');
  const [sortOption, setSortOption] = useState(initialFilters.sort || 'newest');
  
  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (roles.length > 0) count++;
    if (interviewer) count++;
    if (dateRange.from || dateRange.to) count++;
    if (syncStatus !== 'all') count++;
    if (debouncedSearchTerm) count++;
    if (sortOption !== 'newest') count++;
    return count;
  }, [roles, interviewer, dateRange, syncStatus, debouncedSearchTerm, sortOption]);

  // Update parent when filters change
  useEffect(() => {
    const newFilters = {
      search: debouncedSearchTerm,
      roles,
      interviewer,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      syncStatus,
      sort: sortOption
    };
    
    onFilterChange(newFilters);
  }, [debouncedSearchTerm, roles, interviewer, dateRange, syncStatus, sortOption, onFilterChange]);

  // Toggle role selection
  const toggleRole = (role) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setRoles([]);
    setInterviewer('');
    setDateRange({ from: '', to: '' });
    setSyncStatus('all');
    setSortOption('newest');
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    const preferences = {
      roles,
      interviewer,
      dateRange,
      syncStatus,
      sortOption
    };
    localStorage.setItem('interviewFilterPreferences', JSON.stringify(preferences));
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('interviewFilterPreferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        setRoles(preferences.roles || []);
        setInterviewer(preferences.interviewer || '');
        setDateRange(preferences.dateRange || { from: '', to: '' });
        setSyncStatus(preferences.syncStatus || 'all');
        setSortOption(preferences.sortOption || 'newest');
      } catch (e) {
        console.error('Error loading filter preferences:', e);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [roles, interviewer, dateRange, syncStatus, sortOption]);

  // Apply filters handler
  const handleApplyFilters = () => {
    // In this component, filters are applied automatically via useEffect
    // This function exists for UI consistency
  };

  // Reset to initial state
  const handleReset = () => {
    clearAllFilters();
  };

  // Toggle filter panel visibility on mobile
  const toggleFilterPanel = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${isMobile ? 'mb-4' : ''}`}>
      {/* Mobile toggle button */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={toggleFilterPanel}
            className="text-gray-600 hover:text-gray-800"
          >
            {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filter content - visible on desktop or when expanded on mobile */}
      {(!isMobile || showFilters) && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by interviewee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Role Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
            <div className="grid grid-cols-3 gap-2">
              {['Student', 'Class Rep', 'Lecturer'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interviewer Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interviewer</label>
            <select
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Interviewers</option>
              <option value="my">My Interviews</option>
              {allInterviewers && allInterviewers.map((interviewer) => (
                <option key={interviewer.matricNumber} value={interviewer.matricNumber}>
                  {interviewer.fullName} ({interviewer.matricNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sync Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'synced', label: 'Synced' },
                { value: 'pending', label: 'Pending' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="syncStatus"
                    value={option.value}
                    checked={syncStatus === option.value}
                    onChange={(e) => setSyncStatus(e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={clearAllFilters}
              disabled={activeFilterCount === 0}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
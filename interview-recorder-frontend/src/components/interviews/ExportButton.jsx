import { useState, useEffect, useRef } from 'react';
import { Download, FileText, FileJson, FileXls, FilePdf, CheckCircle, AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV, exportToJSON, exportToPDF, generateSummaryReport } from '../../utils/exportUtils';

const ExportButton = ({ interviews, className = '' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  };

  const handleExport = async (type) => {
    if (!interviews || interviews.length === 0) {
      showToast('error', 'No interviews to export');
      setIsDropdownOpen(false);
      return;
    }

    setIsExporting(true);
    setExportType(type);

    try {
      switch (type) {
        case 'csv':
          exportToCSV(interviews);
          showToast('success', 'CSV export completed successfully');
          break;
        case 'json':
          exportToJSON(interviews);
          showToast('success', 'JSON export completed successfully');
          break;
        case 'pdf':
          await exportToPDF(interviews);
          showToast('success', 'PDF export completed successfully');
          break;
        case 'summary':
          const summary = generateSummaryReport(interviews);
          const summaryBlob = new Blob([summary], { type: 'text/plain' });
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          const filename = `interview_summary_${dateStr}.txt`;
          
          const link = document.createElement('a');
          link.href = URL.createObjectURL(summaryBlob);
          link.download = filename;
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showToast('success', 'Summary report exported successfully');
          break;
        default:
          throw new Error('Invalid export type');
      }
    } catch (error) {
      console.error(`Export failed:`, error);
      showToast('error', `Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportType('');
      setIsDropdownOpen(false);
    }
  };

  const ExportOption = ({ type, label, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      disabled={isExporting}
      className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
    >
      <Icon className="w-4 h-4 mr-2 text-gray-600" />
      {label}
      {isExporting && exportType === type && (
        <div className="ml-auto">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </button>
  );

  return (
    <div className={`relative inline-block ${className}`} ref={buttonRef}>
      {/* Export button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting || !interviews || interviews.length === 0}
        className={`flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isExporting ? 'bg-blue-700' : ''}`}
      >
        <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <ExportOption
              type="csv"
              label="Export as CSV"
              icon={FileXls}
              onClick={() => handleExport('csv')}
            />
            <ExportOption
              type="json"
              label="Export as JSON"
              icon={FileJson}
              onClick={() => handleExport('json')}
            />
            <ExportOption
              type="pdf"
              label="Export as PDF"
              icon={FilePdf}
              onClick={() => handleExport('pdf')}
            />
            <div className="border-t border-gray-200 my-1"></div>
            <ExportOption
              type="summary"
              label="Export Summary Report"
              icon={FileText}
              onClick={() => handleExport('summary')}
            />
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, type: '', message: '' })}
            className="ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
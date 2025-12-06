import { format } from 'date-fns';

// Helper function to get all unique response keys across all interviews
const getAllResponseKeys = (interviews) => {
  const allKeys = new Set();
  interviews.forEach(interview => {
    if (interview.responses) {
      Object.keys(interview.responses).forEach(key => allKeys.add(key));
    }
  });
  return Array.from(allKeys);
};

// Export to CSV format
export const exportToCSV = (interviews) => {
  if (!interviews || interviews.length === 0) {
    throw new Error('No interviews to export');
  }

  // Get all unique response keys for column headers
  const responseKeys = getAllResponseKeys(interviews);
  
  // Create header row
  const headers = ['Interviewee Name', 'Role', 'Interviewer', 'Timestamp', ...responseKeys];
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  interviews.forEach(interview => {
    const row = [
      `"${(interview.intervieweeName || '').replace(/"/g, '""')}"`,
      `"${(interview.intervieweeRole || '').replace(/"/g, '""')}"`,
      `"${(interview.interviewerMatricNumber || '').replace(/"/g, '""')}"`,
      `"${(interview.timestamp || '').replace(/"/g, '""')}"`,
      ...responseKeys.map(key => `"${(interview.responses && interview.responses[key] ? interview.responses[key] : '').toString().replace(/"/g, '""')}"`)
    ];
    
    csvContent += row.join(',') + '\n';
  });

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `interviews_${dateStr}.csv`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to JSON format
export const exportToJSON = (interviews) => {
  if (!interviews || interviews.length === 0) {
    throw new Error('No interviews to export');
  }

  // Create a nicely formatted JSON string
  const jsonData = JSON.stringify(interviews, null, 2);
  
  // Create and download file
  const blob = new Blob([jsonData], { type: 'application/json' });
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = `interviews_${dateStr}.json`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to PDF format (using jsPDF if available, otherwise just download JSON)
export const exportToPDF = async (interviews) => {
  if (!interviews || interviews.length === 0) {
    throw new Error('No interviews to export');
  }

  // Try to dynamically import jsPDF
  try {
    const jsPDF = await import('jspdf');
    const { jsPDF: JsPDF } = jsPDF;
    
    const doc = new JsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Interview Report', 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 30);
    
    // Generate summary statistics
    const roleCounts = {};
    interviews.forEach(int => {
      roleCounts[int.intervieweeRole] = (roleCounts[int.intervieweeRole] || 0) + 1;
    });
    
    let yPos = 40;
    
    // Add summary statistics
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    Object.entries(roleCounts).forEach(([role, count]) => {
      doc.text(`${role}: ${count} interviews`, 14, yPos);
      yPos += 8;
    });
    
    // Add spacing before interview details
    yPos += 10;
    
    // Add interview details
    doc.setFontSize(14);
    doc.text('Interview Details', 14, yPos);
    yPos += 10;
    
    // Add each interview as a separate section
    interviews.forEach(interview => {
      if (yPos > 250) { // Check if we need a new page
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`Name: ${interview.intervieweeName}`, 14, yPos);
      yPos += 6;
      doc.text(`Role: ${interview.intervieweeRole}`, 14, yPos);
      yPos += 6;
      doc.text(`Interviewer: ${interview.interviewerMatricNumber}`, 14, yPos);
      yPos += 6;
      doc.text(`Date: ${format(new Date(interview.timestamp), 'yyyy-MM-dd')}`, 14, yPos);
      yPos += 6;
      
      // Add responses
      if (interview.responses) {
        doc.setFontSize(10);
        Object.entries(interview.responses).forEach(([key, value]) => {
          if (yPos > 250) { // Check if we need a new page
            doc.addPage();
            yPos = 20;
          }
          doc.text(`${key}: ${value}`, 18, yPos);
          yPos += 5;
        });
      }
      
      yPos += 8; // Spacing between interviews
    });
    
    // Save the PDF
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    doc.save(`interviews_${dateStr}.pdf`);
  } catch (error) {
    console.error('PDF export failed (jsPDF not available), falling back to text format:', error);
    
    // Fallback to text export if jsPDF is not available
    const textReport = generateSummaryReport(interviews);
    const textBlob = new Blob([textReport], { type: 'text/plain' });
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filename = `interviews_${dateStr}.txt`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(textBlob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Generate a summary report
export const generateSummaryReport = (interviews) => {
  if (!interviews || interviews.length === 0) {
    return 'No interviews to summarize';
  }

  // Count by role
  const roleCounts = {};
  interviews.forEach(interview => {
    roleCounts[interview.intervieweeRole] = (roleCounts[interview.intervieweeRole] || 0) + 1;
  });

  // Analyze common pain points and issues (basic text analysis)
  const painPoints = {};
  const frequencyAnalysis = {};
  const allTextResponses = [];

  interviews.forEach(interview => {
    if (interview.responses) {
      Object.entries(interview.responses).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
          allTextResponses.push(value.toLowerCase());
          
          // Look for common pain point keywords
          const painKeywords = ['problem', 'issue', 'frustration', 'difficulty', 'trouble', 'annoying', 'hard', 'challenging', 'waste', 'missed', 'late', 'confused'];
          painKeywords.forEach(keyword => {
            if (value.toLowerCase().includes(keyword)) {
              painPoints[keyword] = (painPoints[keyword] || 0) + 1;
            }
          });
          
          // Count specific values for frequency analysis
          frequencyAnalysis[`${key}:${value}`] = (frequencyAnalysis[`${key}:${value}`] || 0) + 1;
        }
      });
    }
  });

  // Build summary report
  let report = `Interview Summary Report\n`;
  report += `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
  report += `Total Interviews: ${interviews.length}\n\n`;

  // Add role breakdown
  report += `Role Distribution:\n`;
  Object.entries(roleCounts).forEach(([role, count]) => {
    const percentage = ((count / interviews.length) * 100).toFixed(1);
    report += `- ${role}: ${count} (${percentage}%)\n`;
  });
  report += '\n';

  // Add most common pain points
  if (Object.keys(painPoints).length > 0) {
    report += `Common Pain Points Identified:\n`;
    Object.entries(painPoints)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 pain points
      .forEach(([keyword, count]) => {
        report += `- "${keyword}": mentioned ${count} times\n`;
      });
    report += '\n';
  }

  // Add frequency analysis for specific questions
  report += `Response Frequency Analysis:\n`;
  Object.entries(frequencyAnalysis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15) // Top 15 response patterns
    .forEach(([keyValue, count]) => {
      const [key, value] = keyValue.split(':');
      report += `- ${key}: "${value}" (${count} times)\n`;
    });
  report += '\n';

  // Add some statistics
  report += `Additional Statistics:\n`;
  report += `- Average responses per interview: ${(interviews.reduce((sum, i) => sum + (i.responses ? Object.keys(i.responses).length : 0), 0) / interviews.length).toFixed(1)}\n`;
  report += `- Interviews with text responses: ${allTextResponses.length}\n`;

  return report;
};

// Export all functions as named exports
export default {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  generateSummaryReport
};
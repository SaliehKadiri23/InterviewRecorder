const InterviewList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Interviews</h2>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded">
          New Interview
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-md px-3 py-2">
                <option>All Roles</option>
                <option>Student</option>
                <option>Class Rep</option>
                <option>Lecturer</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2">
                <option>All Interviewers</option>
                <option>My Interviews</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search interviews..." 
                className="border border-gray-300 rounded-md px-3 py-2"
              />
              <button className="bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded">
                Sync Now
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Loading...</td>
                <td className="px-6 py-4 whitespace-nowrap">Loading...</td>
                <td className="px-6 py-4 whitespace-nowrap">Loading...</td>
                <td className="px-6 py-4 whitespace-nowrap">Loading...</td>
                <td className="px-6 py-4 whitespace-nowrap">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { InterviewList };
const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Interview Recorder</h2>
        <p className="text-gray-600">
          This is the CSC4301 Requirements Gathering Tool for collecting interview data about timetable problems.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total Interviews</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">Pending Sync</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">Offline Mode</h3>
          <p className="text-3xl font-bold text-gray-800">No</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded">
            New Interview
          </button>
          <button className="bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export { Dashboard };
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import InterviewList from './pages/interviews/InterviewList';
import InterviewForm from './components/interviews/InterviewForm';
import InterviewDetailPage from './pages/interviews/InterviewDetailPage';
import Statistics from './pages/Statistics';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/interviews" element={
          <ProtectedRoute>
            <Layout>
              <InterviewList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/interviews/new" element={
          <ProtectedRoute>
            <Layout>
              <InterviewForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/interviews/:id" element={
          <ProtectedRoute>
            <Layout>
              <InterviewDetailPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={
          <ProtectedRoute>
            <Layout>
              <Statistics />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
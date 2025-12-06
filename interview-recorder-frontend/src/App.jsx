import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import InterviewList from './pages/interviews/InterviewList';
import InterviewForm from './components/interviews/InterviewForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/interviews" element={
          <Layout>
            <InterviewList />
          </Layout>
        } />
        <Route path="/interviews/new" element={
          <Layout>
            <InterviewForm />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
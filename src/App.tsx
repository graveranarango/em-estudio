import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIContentStudio } from './components/AIContentStudio';
import { DebugMessagesPage } from './views/DebugMessagesPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/debug/messages" element={<DebugMessagesPage />} />
          <Route path="/*" element={<AIContentStudio />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

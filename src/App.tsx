import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AIContentStudio } from './components/AIContentStudio';
import { LoginPage } from './views/LoginPage';
import { DebugMessagesPage } from './views/DebugMessagesPage';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 mx-auto border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/debug/messages"
            element={
              <ProtectedRoute>
                <DebugMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/*" // Protect all other routes
            element={
              <ProtectedRoute>
                <AIContentStudio />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';

const CreateTest = lazy(() => import('./pages/CreateTest/CreateTest'));
const AddQuestions = lazy(() => import('./pages/AddQuestions/AddQuestions'));
const Preview = lazy(() => import('./pages/Preview/Preview'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-creation"
              element={
                <ProtectedRoute>
                  <CreateTest />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test-creation/:testId"
              element={
                <ProtectedRoute>
                  <CreateTest />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-questions/:testId"
              element={
                <ProtectedRoute>
                  <AddQuestions />
                </ProtectedRoute>
              }
            />

            <Route
              path="/preview/:testId"
              element={
                <ProtectedRoute>
                  <Preview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preview"
              element={
                <ProtectedRoute>
                  <Preview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking/"
              element={
                <ProtectedRoute>
                  <Preview />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';


// Case pages
import AddCase from './pages/case/add-case';
import CaseDetail from './pages/case/case-detail';
import CaseList from './pages/case/case-list';
import CaseWorkflowPage from './pages/case/case-workflow';
import DeleteCase from './pages/case/delete-case';
import UpdateCase from './pages/case/update-case';

// Correction pages
import AddCorrection from './pages/correction/add-correction';
import CorrectionDetail from './pages/correction/correction-detail';
import CorrectionList from './pages/correction/correction-list';
import UpdateCorrection from './pages/correction/update-correction';

// Material pages
import AddDefenseMaterial from './pages/defense-material/add-defense-material';
import DefenseMaterialDetail from './pages/defense-material/defense-material-detail';
import DefenseMaterialList from './pages/defense-material/defense-material-list';


// Evidence pages
import AddEvidence from './pages/evidence/add-evidence';
import EvidenceDetail from './pages/evidence/evidence-detail';
import EvidenceList from './pages/evidence/evidence-list';
import UpdateEvidence from './pages/evidence/update-evidence';

// Notification pages
import AddNotification from './pages/notification/add-notification';
import NotificationDetail from './pages/notification/notification-detail';




// Objection pages
import AddObjection from './pages/objection/add-objection';
import HandleObjection from './pages/objection/handle-objection';
import ObjectionDetail from './pages/objection/objection-detail';
import ObjectionList from './pages/objection/objectionList';





// UserRole type
type UserRole = 'police' | 'judge' | 'prosecutor' | 'lawyer' | 'admin';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Role-based Route Component
function RoleRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Case Routes */}
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CaseList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/create"
        element={
          <ProtectedRoute>
            <AddCase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/edit"
        element={
          <ProtectedRoute>
            <UpdateCase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id/workflow"
        element={
          <ProtectedRoute>
            <CaseWorkflowPage />
          </ProtectedRoute>
        }
      />
      
      {/* Evidence Routes */}
      <Route
        path="/cases/:caseId/evidence"
        element={
          <ProtectedRoute>
            <EvidenceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId/evidence/create"
        element={
          <ProtectedRoute>
            <AddEvidence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:id"
        element={
          <ProtectedRoute>
            <EvidenceDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:id/edit"
        element={
          <ProtectedRoute>
            <UpdateEvidence />
          </ProtectedRoute>
        }
      />
      
      {/* Correction Routes */}
      <Route
        path="/evidence/:evidenceId/corrections"
        element={
          <ProtectedRoute>
            <CorrectionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:evidenceId/corrections/create"
        element={
          <ProtectedRoute>
            <AddCorrection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/corrections/:id"
        element={
          <ProtectedRoute>
            <CorrectionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/corrections/:id/edit"
        element={
          <ProtectedRoute>
            <UpdateCorrection />
          </ProtectedRoute>
        }
      />
      
      {/* Material Routes */}
      <Route
        path="/cases/:caseId/materials"
        element={
          <ProtectedRoute>
            <DefenseMaterialList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:caseId/materials/create"
        element={
          <ProtectedRoute>
            <AddDefenseMaterial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/materials/:id"
        element={
          <ProtectedRoute>
            <DefenseMaterialDetail />
          </ProtectedRoute>
        }
      />
      
      {/* Objection Routes */}
      <Route
        path="/objections"
        element={
          <ProtectedRoute>
            <ObjectionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:evidenceId/objections"
        element={
          <ProtectedRoute>
            <ObjectionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evidence/:evidenceId/objections/create"
        element={
          <RoleRoute allowedRoles={['lawyer']}>
            <AddObjection />
          </RoleRoute>
        }
      />
      <Route
        path="/objections/:id"
        element={
          <ProtectedRoute>
            <ObjectionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/objections/:id/handle"
        element={
          <RoleRoute allowedRoles={['judge']}>
            <HandleObjection />
          </RoleRoute>
        }
      />
      
      {/* Notification Routes */}
      <Route
        path="/notifications/:id"
        element={
          <ProtectedRoute>
            <NotificationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/create"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AddNotification />
          </RoleRoute>
        }
      />
      
      {/* Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}


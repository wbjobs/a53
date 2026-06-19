import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Spin } from 'antd'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import RelicList from './pages/RelicList.jsx'
import RelicDetail from './pages/RelicDetail.jsx'
import NewRelic from './pages/NewRelic.jsx'
import NewRestoration from './pages/NewRestoration.jsx'
import AllRestorations from './pages/AllRestorations.jsx'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

const RestorerRoute = ({ children }) => {
  const { isRestorer } = useAuth()
  if (!isRestorer()) {
    return <Navigate to="/" replace />
  }
  return children
}

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/relics" replace />} />
        <Route path="relics" element={<RelicList />} />
        <Route path="relics/:id" element={<RelicDetail />} />
        <Route path="relics/new" element={
          <AdminRoute>
            <NewRelic />
          </AdminRoute>
        } />
        <Route path="restorations/new" element={
          <RestorerRoute>
            <NewRestoration />
          </RestorerRoute>
        } />
        <Route path="restorations" element={<AllRestorations />} />
      </Route>
    </Routes>
  )
}

export default App

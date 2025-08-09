import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Alert, Button, Typography } from '@mui/material'
import NavigationBar from './components/Navigation'
import CreatePage from './pages/CreatePage'
import PreviewPage from './pages/PreviewPage'
import MyFormsPage from './pages/MyFormsPage'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
              window.location.reload()
            }}
          >
            Refresh Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/myforms" element={<MyFormsPage />} />
        </Routes>
      </Box>
    </ErrorBoundary>
  )
}

export default App

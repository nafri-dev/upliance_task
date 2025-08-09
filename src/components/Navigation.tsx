import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material'
import { Build, Preview, List } from '@mui/icons-material'

const NavigationBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/create', label: 'Create', icon: Build },
    { path: '/preview', label: 'Preview', icon: Preview },
    { path: '/myforms', label: 'My Forms', icon: List },
  ]

  return (
    <AppBar position="static" sx={{ mb: 0 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Form Builder
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Button
                key={item.path}
                color="inherit"
                startIcon={<IconComponent />}
                onClick={() => navigate(item.path)}
                variant={location.pathname === item.path ? 'outlined' : 'text'}
                sx={{
                  borderColor: location.pathname === item.path ? 'white' : 'transparent',
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavigationBar

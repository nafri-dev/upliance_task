import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import MyForms from '../components/MyForms'

const MyFormsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Forms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your saved forms
        </Typography>
      </Box>
      <MyForms />
    </Container>
  )
}

export default MyFormsPage

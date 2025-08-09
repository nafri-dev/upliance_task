import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import FormBuilder from '../components/FormBuilder'

const CreatePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Form Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create dynamic forms with customizable fields and validations
        </Typography>
      </Box>
      <FormBuilder />
    </Container>
  )
}

export default CreatePage

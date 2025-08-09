import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import FormPreview from '../components/FormPreview'

const PreviewPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Form Preview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your form as an end user would see it
        </Typography>
      </Box>
      <FormPreview />
    </Container>
  )
}

export default PreviewPage

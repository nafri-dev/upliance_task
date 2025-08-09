import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/store'
import { loadSavedForms, loadForm } from '../store/formBuilderSlice'
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
} from '@mui/material'
import { Preview, Edit, DateRange } from '@mui/icons-material'

const MyForms: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { savedForms } = useSelector((state: RootState) => state.formBuilder)

  useEffect(() => {
    dispatch(loadSavedForms())
  }, [dispatch])

  const handlePreviewForm = (formId: string) => {
    dispatch(loadForm(formId))
    navigate('/preview')
  }

  const handleEditForm = (formId: string) => {
    dispatch(loadForm(formId))
    navigate('/create')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (savedForms.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No saved forms yet
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Create and save your first form to see it here
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
          sx={{ mt: 2 }}
        >
          Create New Form
        </Button>
      </Paper>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Saved Forms ({savedForms.length})
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/create')}
        >
          Create New Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {savedForms.map((form) => (
          <Grid item xs={12} md={6} lg={4} key={form.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {form.name}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <DateRange sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(form.createdAt)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Chip
                    label={`${form.fields.length} fields`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Field types: {Array.from(new Set(form.fields.map(f => f.type))).join(', ')}
                </Typography>

                {form.fields.some(f => f.derived?.isDerived) && (
                  <Box mt={1}>
                    <Chip
                      label="Has derived fields"
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Preview />}
                  onClick={() => handlePreviewForm(form.id)}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEditForm(form.id)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default MyForms

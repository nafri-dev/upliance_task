/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/store'
import { addField, loadSavedForms, saveForm, clearCurrentForm, FormField } from '../store/formBuilderSlice'
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2' // ✅ new import for MUI v7

import {
  Add as AddIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Clear as ClearIcon
} from '@mui/icons-material'

import FieldTypeSelector from './FieldTypeSelector'
import FieldList from './FieldList'

const FormBuilder: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentForm } = useSelector((state: RootState) => state.formBuilder)
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [formName, setFormName] = useState('')

  useEffect(() => {
    dispatch(loadSavedForms())
  }, [dispatch])

  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: fieldType as any,
      label: `New ${fieldType} field`,
      required: false,
      defaultValue: fieldType === 'checkbox'
        ? false
        : fieldType === 'select' || fieldType === 'radio'
        ? ''
        : '',
      validationRules: [],
      options: fieldType === 'select' || fieldType === 'radio'
        ? [{ label: 'Option 1', value: 'option1' }]
        : undefined,
      derived: {
        isDerived: false,
        parentFields: [],
        formula: '',
      },
    }
    dispatch(addField(newField))
    setShowFieldSelector(false)
  }

  const handleSaveForm = () => {
    if (formName.trim()) {
      dispatch(saveForm(formName))
      setShowSaveDialog(false)
      setFormName('')
      alert('Form saved successfully!')
    }
  }

  const handlePreview = () => {
    navigate('/preview')
  }

  const handleClearForm = () => {
    if (confirm('Are you sure you want to clear the current form?')) {
      dispatch(clearCurrentForm())
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid xs={12} sm={6}>
            <Typography variant="h6">
              Current Form ({currentForm.fields.length} fields)
            </Typography>
          </Grid>
          <Grid xs={12} sm={6}>
            <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowFieldSelector(true)}
              >
                Add Field
              </Button>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
                disabled={currentForm.fields.length === 0}
              >
                Preview
              </Button>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => setShowSaveDialog(true)}
                disabled={currentForm.fields.length === 0}
              >
                Save Form
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={handleClearForm}
                disabled={currentForm.fields.length === 0}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <FieldList />

      <Dialog open={showFieldSelector} onClose={() => setShowFieldSelector(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Field Type</DialogTitle>
        <DialogContent>
          <FieldTypeSelector onSelect={handleAddField} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFieldSelector(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form Name"
            fullWidth
            variant="outlined"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveForm} variant="contained" disabled={!formName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FormBuilder

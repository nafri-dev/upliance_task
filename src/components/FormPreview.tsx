/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store/store'
import { updatePreviewData } from '../store/formBuilderSlice'
import {
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

const FormPreview: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentForm, previewData } = useSelector((state: RootState) => state.formBuilder)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialize form data with default values
    const initialData: Record<string, any> = {}
    currentForm.fields.forEach(field => {
      if (!field.derived?.isDerived) {
        initialData[field.id] = field.defaultValue
      }
    })
    setFormData(initialData)
  }, [currentForm.fields])

  useEffect(() => {
    // Calculate derived fields
    const newFormData = { ...formData }
    currentForm.fields.forEach(field => {
      if (field.derived?.isDerived && field.derived.parentFields.length > 0) {
        try {
          const derivedValue = calculateDerivedValue(field, formData)
          newFormData[field.id] = derivedValue
        } catch (error) {
          console.error('Error calculating derived field:', error)
          newFormData[field.id] = 'Error in calculation'
        }
      }
    })
    
    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData)
    }
  }, [formData, currentForm.fields])

  const calculateDerivedValue = (field: any, data: Record<string, any>) => {
    if (!field.derived?.formula) return ''

    let formula = field.derived.formula
    
    // Replace field IDs with actual values
    field.derived.parentFields.forEach((parentId: string) => {
      const parentField = currentForm.fields.find(f => f.id === parentId)
      if (parentField) {
        const value = data[parentId]
        formula = formula.replace(new RegExp(parentId, 'g'), JSON.stringify(value))
      }
    })

    // Handle common derived field patterns
    if (formula.includes('age') && formula.includes('birthDate')) {
      const birthDate = data[field.derived.parentFields[0]]
      if (birthDate) {
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
        return age.toString()
      }
    }

    // Try to evaluate the formula safely
    try {
      // Simple arithmetic operations
      if (/^[\d\s+\-*/().]+$/.test(formula)) {
        return eval(formula).toString()
      }
      
      // For more complex formulas, return the formula itself
      return formula
    } catch {
      return 'Invalid formula'
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value }
    setFormData(newFormData)
    dispatch(updatePreviewData(newFormData))

    // Clear error for this field
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' })
    }
  }

  const validateField = (field: any, value: any): string => {
    for (const rule of field.validationRules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            return rule.message
          }
          break
        case 'minLength':
          if (typeof value === 'string' && value.length < (rule.value as number)) {
            return rule.message
          }
          break
        case 'maxLength':
          if (typeof value === 'string' && value.length > (rule.value as number)) {
            return rule.message
          }
          break
        case 'email':
          if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return rule.message
          }
          break
        case 'password':
          if (typeof value === 'string') {
            if (value.length < 8 || !/\d/.test(value)) {
              return rule.message
            }
          }
          break
      }
    }
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    currentForm.fields.forEach(field => {
      if (!field.derived?.isDerived) {
        const error = validateField(field, formData[field.id])
        if (error) {
          newErrors[field.id] = error
        }
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!\n\nData:\n' + JSON.stringify(formData, null, 2))
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    const isReadOnly = field.derived?.isDerived

    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        )

      case 'number':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        )

      case 'textarea':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            multiline
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            InputProps={{ readOnly: isReadOnly }}
            sx={{ mb: 2 }}
          />
        )

      case 'select':
        return (
          <FormControl key={field.id} fullWidth sx={{ mb: 2 }} error={!!error}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              required={field.required}
              readOnly={isReadOnly}
            >
              {field.options?.map((option: any) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <Typography variant="caption" color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </FormControl>
        )

      case 'radio':
        return (
          <FormControl key={field.id} sx={{ mb: 2 }} error={!!error}>
            <FormLabel>{field.label}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option: any) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={isReadOnly}
                />
              ))}
            </RadioGroup>
            {error && <Typography variant="caption" color="error">{error}</Typography>}
          </FormControl>
        )

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                disabled={isReadOnly}
              />
            }
            label={field.label}
            sx={{ mb: 2, display: 'block' }}
          />
        )

      case 'date':
        return (
          <TextField
            key={field.id}
            fullWidth
            label={field.label}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
            InputProps={{ readOnly: isReadOnly }}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
        )

      default:
        return null
    }
  }

  if (currentForm.fields.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No form to preview
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Create a form first to see the preview
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/create')}
        >
          Go to Form Builder
        </Button>
      </Paper>
    )
  }

  return (
    <Box>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/create')}
          sx={{ mb: 2 }}
        >
          Back to Builder
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          {currentForm.name || 'Form Preview'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {currentForm.fields.map(field => (
            <Box key={field.id}>
              {field.derived?.isDerived && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  This is a derived field calculated from: {field.derived.parentFields.map(id => {
                    const parentField = currentForm.fields.find(f => f.id === id)
                    return parentField?.label
                  }).join(', ')}
                </Alert>
              )}
              {renderField(field)}
            </Box>
          ))}
          
          <Box mt={3}>
            <Button type="submit" variant="contained" size="large">
              Submit Form
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}

export default FormPreview

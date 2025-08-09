/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { updateField, deleteField, FormField, ValidationRule, SelectOption } from '../store/formBuilderSlice'
import {
  Paper,
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material'
import {
  DragIndicator,
  Delete,
  Edit,
  Add,
} from '@mui/icons-material'

interface FieldEditorProps {
  field: FormField
  dragHandleProps?: any
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, dragHandleProps }) => {
  const dispatch = useDispatch()
  const { currentForm } = useSelector((state: RootState) => state.formBuilder)
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [showDerivedDialog, setShowDerivedDialog] = useState(false)

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    dispatch(updateField(field.id, updates))
  }

  const handleDeleteField = () => {
    if (confirm('Are you sure you want to delete this field?')) {
      dispatch(deleteField(field.id))
    }
  }

  const addValidationRule = (rule: ValidationRule) => {
    const newRules = [...field.validationRules, rule]
    handleFieldUpdate({ validationRules: newRules })
  }

  const removeValidationRule = (index: number) => {
    const newRules = field.validationRules.filter((_, i) => i !== index)
    handleFieldUpdate({ validationRules: newRules })
  }

  const updateOptions = (options: SelectOption[]) => {
    handleFieldUpdate({ options })
  }

  const getFieldTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      text: '📝',
      number: '🔢',
      textarea: '📄',
      select: '📋',
      radio: '🔘',
      checkbox: '☑️',
      date: '📅',
    }
    return icons[type] || '❓'
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton {...dragHandleProps} sx={{ cursor: 'grab', mr: 1 }}>
          <DragIndicator />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {getFieldTypeIcon(field.type)} {field.label}
        </Typography>
        <Chip label={field.type} size="small" sx={{ mr: 1 }} />
        {field.derived?.isDerived && (
          <Chip label="Derived" color="secondary" size="small" sx={{ mr: 1 }} />
        )}
        <IconButton onClick={handleDeleteField} color="error">
          <Delete />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Field Label"
            value={field.label}
            onChange={(e) => handleFieldUpdate({ label: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => handleFieldUpdate({ required: e.target.checked })}
              />
            }
            label="Required Field"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Default Value"
            value={field.defaultValue as string}
            onChange={(e) => handleFieldUpdate({ defaultValue: e.target.value })}
            multiline={field.type === 'textarea'}
            rows={field.type === 'textarea' ? 3 : 1}
          />
        </Grid>
      </Grid>

      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowValidationDialog(true)}
          startIcon={<Edit />}
        >
          Validation Rules ({field.validationRules.length})
        </Button>
        
        {(field.type === 'select' || field.type === 'radio') && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowOptionsDialog(true)}
            startIcon={<Edit />}
          >
            Options ({field.options?.length || 0})
          </Button>
        )}

        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowDerivedDialog(true)}
          startIcon={<Edit />}
          color={field.derived?.isDerived ? 'secondary' : 'primary'}
        >
          Derived Field
        </Button>
      </Box>

      {field.validationRules.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Active Validation Rules:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {field.validationRules.map((rule, index) => (
              <Chip
                key={index}
                label={`${rule.type}${rule.value ? `: ${rule.value}` : ''}`}
                onDelete={() => removeValidationRule(index)}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      <ValidationDialog
        open={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        onAddRule={addValidationRule}
        fieldType={field.type}
      />

      <OptionsDialog
        open={showOptionsDialog}
        onClose={() => setShowOptionsDialog(false)}
        options={field.options || []}
        onUpdateOptions={updateOptions}
      />

      <DerivedFieldDialog
        open={showDerivedDialog}
        onClose={() => setShowDerivedDialog(false)}
        field={field}
        availableFields={currentForm.fields.filter(f => f.id !== field.id)}
        onUpdate={handleFieldUpdate}
      />
    </Paper>
  )
}

// Validation Dialog Component
const ValidationDialog: React.FC<{
  open: boolean
  onClose: () => void
  onAddRule: (rule: ValidationRule) => void
  fieldType: string
}> = ({ open, onClose, onAddRule, fieldType }) => {
  const [ruleType, setRuleType] = useState<ValidationRule['type']>('required')
  const [ruleValue, setRuleValue] = useState('')
  const [ruleMessage, setRuleMessage] = useState('')

  const handleAddRule = () => {
    if (!ruleMessage.trim()) return

    const rule: ValidationRule = {
      type: ruleType,
      value: ruleValue || undefined,
      message: ruleMessage,
    }

    onAddRule(rule)
    setRuleValue('')
    setRuleMessage('')
    onClose()
  }

  const getAvailableRules = () => {
    const baseRules = ['required']
    if (fieldType === 'text' || fieldType === 'textarea') {
      baseRules.push('minLength', 'maxLength', 'email', 'password')
    }
    return baseRules
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Validation Rule</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Rule Type</InputLabel>
              <Select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as ValidationRule['type'])}
              >
                {getAvailableRules().map((rule) => (
                  <MenuItem key={rule} value={rule}>
                    {rule.charAt(0).toUpperCase() + rule.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {(ruleType === 'minLength' || ruleType === 'maxLength') && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Length"
                type="number"
                value={ruleValue}
                onChange={(e) => setRuleValue(e.target.value)}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Error Message"
              value={ruleMessage}
              onChange={(e) => setRuleMessage(e.target.value)}
              placeholder="Enter the error message to show when validation fails"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddRule} variant="contained" disabled={!ruleMessage.trim()}>
          Add Rule
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Options Dialog Component
const OptionsDialog: React.FC<{
  open: boolean
  onClose: () => void
  options: SelectOption[]
  onUpdateOptions: (options: SelectOption[]) => void
}> = ({ open, onClose, options, onUpdateOptions }) => {
  const [localOptions, setLocalOptions] = useState<SelectOption[]>(options)

  React.useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const addOption = () => {
    setLocalOptions([...localOptions, { label: '', value: '' }])
  }

  const updateOption = (index: number, field: keyof SelectOption, value: string) => {
    const newOptions = [...localOptions]
    newOptions[index][field] = value
    setLocalOptions(newOptions)
  }

  const removeOption = (index: number) => {
    setLocalOptions(localOptions.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    const validOptions = localOptions.filter(opt => opt.label.trim() && opt.value.trim())
    onUpdateOptions(validOptions)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Options</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {localOptions.map((option, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Label"
                  value={option.label}
                  onChange={(e) => updateOption(index, 'label', e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Value"
                  value={option.value}
                  onChange={(e) => updateOption(index, 'value', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => removeOption(index)} color="error">
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<Add />} onClick={addOption}>
            Add Option
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Options
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Derived Field Dialog Component
const DerivedFieldDialog: React.FC<{
  open: boolean
  onClose: () => void
  field: FormField
  availableFields: FormField[]
  onUpdate: (updates: Partial<FormField>) => void
}> = ({ open, onClose, field, availableFields, onUpdate }) => {
  const [isDerived, setIsDerived] = useState(field.derived?.isDerived || false)
  const [parentFields, setParentFields] = useState<string[]>(field.derived?.parentFields || [])
  const [formula, setFormula] = useState(field.derived?.formula || '')

  const handleSave = () => {
    onUpdate({
      derived: {
        isDerived,
        parentFields,
        formula,
      },
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Derived Field</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDerived}
                onChange={(e) => setIsDerived(e.target.checked)}
              />
            }
            label="Make this a derived field"
          />

          {isDerived && (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Parent Fields</InputLabel>
                <Select
                  multiple
                  value={parentFields}
                  onChange={(e) => setParentFields(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const field = availableFields.find(f => f.id === value)
                        return <Chip key={value} label={field?.label || value} size="small" />
                      })}
                    </Box>
                  )}
                >
                  {availableFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.label} ({field.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                multiline
                rows={3}
                sx={{ mt: 2 }}
                placeholder="Enter formula (e.g., field1 + field2, or custom JavaScript expression)"
                helperText="Use field IDs in your formula. Example: age = new Date().getFullYear() - new Date(birthDate).getFullYear()"
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FieldEditor

import React from 'react'
import {  Card, CardContent, Typography, Box } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2' // ✅ new import for MUI v7
import {
  TextFields,
  Numbers,
  Subject,
  ArrowDropDown,
  RadioButtonChecked,
  CheckBox,
  DateRange,
} from '@mui/icons-material'

interface FieldTypeSelectorProps {
  onSelect: (fieldType: string) => void
}

const fieldTypes = [
  { type: 'text', label: 'Text', icon: TextFields, description: 'Single line text input' },
  { type: 'number', label: 'Number', icon: Numbers, description: 'Numeric input field' },
  { type: 'textarea', label: 'Textarea', icon: Subject, description: 'Multi-line text input' },
  { type: 'select', label: 'Select', icon: ArrowDropDown, description: 'Dropdown selection' },
  { type: 'radio', label: 'Radio', icon: RadioButtonChecked, description: 'Single choice from options' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckBox, description: 'Boolean true/false input' },
  { type: 'date', label: 'Date', icon: DateRange, description: 'Date picker input' },
]

const FieldTypeSelector: React.FC<FieldTypeSelectorProps> = ({ onSelect }) => {
  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {fieldTypes.map((fieldType) => {
        const IconComponent = fieldType.icon
        return (
          <Grid item xs={12} sm={6} key={fieldType.type}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => onSelect(fieldType.type)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <IconComponent sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{fieldType.label}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {fieldType.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default FieldTypeSelector

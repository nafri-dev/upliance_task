/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date'

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'email' | 'password'
  value?: number | string
  message: string
}

export interface SelectOption {
  label: string
  value: string
}

export interface DerivedField {
  isDerived: boolean
  parentFields: string[]
  formula: string
}

export interface FormField {
  id: string
  type: FieldType
  label: string
  required: boolean
  defaultValue: string | string[] | boolean
  validationRules: ValidationRule[]
  options?: SelectOption[]
  derived?: DerivedField
}

export interface SavedForm {
  id: string
  name: string
  fields: FormField[]
  createdAt: string
}

interface FormBuilderState {
  currentForm: {
    fields: FormField[]
    name: string
  }
  savedForms: SavedForm[]
  previewData: Record<string, any>
}

const initialState: FormBuilderState = {
  currentForm: {
    fields: [],
    name: '',
  },
  savedForms: [],
  previewData: {},
}

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    addField: {
      reducer: (state, action: PayloadAction<FormField>) => {
        state.currentForm.fields.push(action.payload)
      },
      prepare: (field: FormField) => ({
        payload: field,
      }),
    },
    updateField: {
      reducer: (state, action: PayloadAction<{ id: string; field: Partial<FormField> }>) => {
        const index = state.currentForm.fields.findIndex(f => f.id === action.payload.id)
        if (index !== -1) {
          state.currentForm.fields[index] = { 
            ...state.currentForm.fields[index], 
            ...action.payload.field 
          }
        }
      },
      prepare: (id: string, field: Partial<FormField>) => ({
        payload: { id, field },
      }),
    },
    deleteField: {
      reducer: (state, action: PayloadAction<string>) => {
        state.currentForm.fields = state.currentForm.fields.filter(f => f.id !== action.payload)
      },
      prepare: (id: string) => ({
        payload: id,
      }),
    },
    reorderFields: {
      reducer: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
        const { fromIndex, toIndex } = action.payload
        if (fromIndex >= 0 && fromIndex < state.currentForm.fields.length &&
            toIndex >= 0 && toIndex < state.currentForm.fields.length) {
          const [removed] = state.currentForm.fields.splice(fromIndex, 1)
          state.currentForm.fields.splice(toIndex, 0, removed)
        }
      },
      prepare: (fromIndex: number, toIndex: number) => ({
        payload: { fromIndex, toIndex },
      }),
    },
    setFormName: {
      reducer: (state, action: PayloadAction<string>) => {
        state.currentForm.name = action.payload
      },
      prepare: (name: string) => ({
        payload: name,
      }),
    },
    saveForm: {
      reducer: (state, action: PayloadAction<string>) => {
        const newForm: SavedForm = {
          id: Date.now().toString(),
          name: action.payload,
          fields: [...state.currentForm.fields],
          createdAt: new Date().toISOString(),
        }
        state.savedForms.push(newForm)
        try {
          localStorage.setItem('formBuilder_savedForms', JSON.stringify(state.savedForms))
        } catch (error) {
          console.error('Failed to save to localStorage:', error)
        }
      },
      prepare: (name: string) => ({
        payload: name,
      }),
    },
    loadSavedForms: (state) => {
      try {
        const saved = localStorage.getItem('formBuilder_savedForms')
        if (saved) {
          const parsedForms = JSON.parse(saved)
          if (Array.isArray(parsedForms)) {
            state.savedForms = parsedForms
          }
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error)
        state.savedForms = []
      }
    },
    loadForm: {
      reducer: (state, action: PayloadAction<string>) => {
        const form = state.savedForms.find(f => f.id === action.payload)
        if (form) {
          state.currentForm = {
            fields: [...form.fields],
            name: form.name,
          }
        }
      },
      prepare: (id: string) => ({
        payload: id,
      }),
    },
    updatePreviewData: {
      reducer: (state, action: PayloadAction<Record<string, any>>) => {
        state.previewData = { ...state.previewData, ...action.payload }
      },
      prepare: (data: Record<string, any>) => ({
        payload: data,
      }),
    },
    clearCurrentForm: (state) => {
      state.currentForm = {
        fields: [],
        name: '',
      }
      state.previewData = {}
    },
  },
})

export const {
  addField,
  updateField,
  deleteField,
  reorderFields,
  setFormName,
  saveForm,
  loadSavedForms,
  loadForm,
  updatePreviewData,
  clearCurrentForm,
} = formBuilderSlice.actions

export default formBuilderSlice.reducer

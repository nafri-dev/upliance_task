/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { Box, Typography, Paper } from '@mui/material'
import FieldEditor from './FieldEditor'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useDispatch } from 'react-redux'
import { reorderFields } from '../store/formBuilderSlice'

const FieldList: React.FC = () => {
  const dispatch = useDispatch()
  const { currentForm } = useSelector((state: RootState) => state.formBuilder)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    dispatch(reorderFields(result.source.index, result.destination.index))
  }

  if (currentForm.fields.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No fields added yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click "Add Field" to start building your form
        </Typography>
      </Paper>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="fields">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            {currentForm.fields.map((field, index) => (
              <Draggable key={field.id} draggableId={field.id} index={index}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{
                      mb: 2,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                    }}
                  >
                    <FieldEditor
                      field={field}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default FieldList

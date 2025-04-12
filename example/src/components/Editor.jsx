import { Slate, Editable, withReact } from 'slate-react'
import React from 'react'
import { useCallback } from 'react'
import { createEditor } from 'slate'
import { useMemo } from 'react'
import { withStamps } from 'slate-stamps'

export const Editor = ({ onStampInsert, onStampClick }) => {
  const baseEditor = useMemo(() => withReact(createEditor()), [])

  const editor = useMemo(() => withStamps(onStampInsert, onStampClick)(baseEditor),
    [onStampInsert, onStampClick])

  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]

  const renderElement = useCallback(props => <Element {...props} />, [])

  const Element = (props) => {
    const { children, element, attributes } = props

    switch (element.type) {
      case editor.stampedElementType: {
        const { StampedElementComponent } = editor
        return <StampedElementComponent {...props} />
      }
      default:
        return (
          <p
            {...attributes}
            style={{ margin: '0', padding: '0' }}
          >
            {children}
          </p>
        )
    }
  }

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        style={{
          padding: '0 5px 0 5px',
          textAlign: 'left',
          border: 'solid',
          outline: 'none',
        }}
        renderElement={renderElement}
        placeholder='Write here...'
      />
    </Slate>
  )
}

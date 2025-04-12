import { Slate, Editable, withReact } from 'slate-react'
import React, { useCallback, useState } from 'react'
import { createEditor } from 'slate'
import { withStamps, useStableFn } from 'slate-stamps'

export const Editor = ({ onStampInsert, onStampClick }) => {
  const stableOnStampInsert = useStableFn(onStampInsert, [])
  const stableOnStampClick = useStableFn(onStampClick, [])

  const [baseEditor] = useState(() => withReact(createEditor()))
  const [editor] = useState(() => 
    withStamps(
      baseEditor, 
      stableOnStampInsert, 
      stableOnStampClick
    ))

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

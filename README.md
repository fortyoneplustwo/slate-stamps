# Description

A [Slate plugin](https://docs.slatejs.org/concepts/08-plugins) that adds stamp functionality to the editor.

When text is typed on an empty line, a customizable stamp is automatically inserted at the beginning of that line.

### Key Features:

-   **Fully customizable appearance**: Stamps can be styled as needed.
-   **Stateful**: Stamps can hold arbitrary data.
-   **Interactive**: Stamps can trigger custom behaviors when clicked.

# Why use this?
You're implementing a custom text editor and need a symbol to appear at the start of a line on user input. The symbol may be clickable and rendered conditionally based on context. 

## Install
```
npm install slate-stamps
```

# Usage
## Plugin
#### `withStamps(editor: Editor, onStampInsert: function, onStampClick: function) => Editor`
The function returns an augmented version of the editor object that was passed to it, enabling stamp functionality defined by the callbacks `onStampInsert` and `onStampClick`.

Callbacks:

#### `onStampInsert(requestedAt: Date) => { label: string, value: any } | null`
	
Executes when the user types on an empty line, right before a stamp is inserted. The `requestedAt` argument provides the timestamp of this event.

Returns an object with `{ value, label }` to define the stamp's content. 

- `value` holds the underlying data. 
- `label` is a human-readable string that can be displayed inside the stamp.
	
	**Note** : If `null` is returned or the `value` property evaluates to `null`, then a stamp will not be inserted.

#### `onStampClick(label: string, value: any) => void`

Executes when a stamp is clicked. Receives `label: string` and `value: any` as arguments which represent the data stored by the stamp.


| ***⚠ Stabilization of callbacks*** |
|--|
| *Your callbacks **must** be stabilized in `useStableFn` before passing them to `withStamps`. If you want the function to be replaced when certain dependency values change, include those values in the dependency array of `useStableFn`.* |





```javascript
import { createEditor } from 'slate'
import { withStamps, useStableFn } from 'slate-stamps'

// Define the callbacks
const onStampInsert = (_) => {
  return { label: 'three', value: 3 }
}
const onStampClick = (label, value) => {
  console.log(`${ label, value }`)
} 

// Stabilize the callbacks 
const stableOnStampInsert = useStableFn(onStampInsert, [])
const stableOnStampClick = useStableFn(onStampClick, [])

// Apply the plugin with stable callbacks
const editor = withStamps(
  createEditor(),
  stableOnStampInsert,
  stableOnStampClick
))
```

## Rendering 
Stamped lines are represented internally as *stamped elements*. You’ll need to define how these elements are rendered in your editor.

The plugin augments the `editor` with the following properties for your convenience:

- `StampedElementComponent`: A react component that serves as the default UI for rendering stamped elements.
- `stampedElementType`: The `type` property of a stamped element.

#### Example
```javascript
const Element = (props) => {
  const { children, element, attributes } = props

  switch (element.type) {
    // Render stamped elements using the default UI
    case editor.stampedElementType: {
      const { StampedElementComponent } = editor
      return <StampedElementComponent {...props} />
    }
    default:
      return <p {...attributes}>{children}</p>
  }
}
```
**Note**: If you're using a custom component to render the stamps, the `label` and `value` properties will automatically be passed to your component's `element` prop. For reference, see the default `StampedBlock` implementation in `withStamps.jsx`.

# How it works
### Stamped Elements

Stamped elements are:

-   **Block elements**: They behave like block-level nodes.
-   **Always the lowest-level block in a branch**: They’re positioned at the end of a nested structure. 
-   **Wrapped in a non-editor block**: They are always contained within another block element (not the editor itself).    
-   **The only stamped child of their parent block**: A parent block can only have one stamped child at a time.
    

### Stamping a Line

When an empty line is ready to be stamped:

1.  The plugin locates the lowest-level block at the current selection.
2.  It calls `onStampInsert` to fetch the stamp's data.    
3.  It wraps the block’s children inside a stamped element, passing in the stamp data.
    

### Splitting a Stamped Line

If a stamped line is split, two new stamped lines are created, with the content divided between them. The `onStampInsert` callback is triggered again to fetch the stamp data for the newly created line after the split.

### Pasting Text from Outside

When text is pasted from outside the editor, the plugin normalizes the pasted content by splitting the block at all newline characters. If the split block is a stamped line, the resulting splits will also be stamped and retain the same stamp data.

# Customizing Behavior

As with many plugins, you can customize the behavior of the editor by overriding its methods.

# Assumptions
To ensure proper functionality, all block elements that can contain leaf or inline elements **must** have a `type` property. Without this, the plugin may behave unexpectedly or throw errors.

# Resources 
There is an example project in the `example/` directory. To run it:

1. Clone this repository.
2. Run `pnpm install` and `pnpm build` in the root directory.
3. Navigate to `example/`.
4. Run `pnpm install` and `pnpm run dev`.

# Description
A [plugin for Slate](https://docs.slatejs.org/concepts/08-plugins) that augments the editor with stamp functionality.

When text is input on an empty line, a stamp is inserted at the beginning of the line. 

Stamps are
 - completely customizable in appearence,
 - can hold arbitrary state, and 
 - can execute custom behavior when clicked.

# Why?
You're implementing a custom text editor and need a symbol to appear at the start of a line during user input. The symbol may be clickable and rendered conditionally based on context. 

# Install
```
npm install slate-stamps
```

# Usage
## Plugin
### `withStamps(editor: Editor, onStampInsert: function, onStampClick: function): Editor`
Our plugin `withStamps` takes in an editor object and two callbacks. It returns an editor object augmented with the stamp behavior defined by the callbacks described below.

-  `onStampInsert(requestedAt: Date) => { label: string, value: any } | null`
	
	Executes when the user types on an empty line, right before a stamp is inserted. The `requestedAt` argument provides the timestamp of this event.

	Returns an object with `{ value, label }` to define the stamp's content. `value` holds the underlying data while `label` is a human-readable string displayed inside the stamp (often a formatted version of value).
	
	***Note** : If `null` is returned or the value property evaluates to `null`, then a stamp will not be inserted.*

- `onStampClick(label: string, value: any) => void`

	Executes when a stamp is clicked. Receives `label: string` and `value: any` as arguments i.e. the data stored by the stamp.

#### Example
```javascript
import { withStamps } from 'slate-stamps'

// Define the callbacks
const onStampInsert = (_) => {
	return { label: 'three', value: 3 }
}
const onStampClick = (label, value) => {
	console.log(`${ label, value }`)
} 

// Augment with our plugin
const editor = withStamps(editor, onStampInsert, onStampClick)
```

⚠ **Warning**: The callback functions must be wrapped in `usStableFn` before being passed to the plugin. Read more below.


## Hooks
### `useStableFn(fn: function, dependencies: any[]) => function`
Create a stable version of a function that can be used in dependency arrays without causing hooks like `useEffect` to re-run if the function changes. Calling the returned function always calls the most recent version of the function that was passed to `useStableFn`.

 If you do want the function to be replaced when certain dependency values change, include those values in the dependency array of `useStableFn`.

**We recommend to always stabilize your callbacks.**

#### Example

```javascript
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

// Augment with our plugin
const editor = withStamps(editor, onStampInsert, onStampClick)
```

## Rendering
A stamped line is internally represented by a custom element called a *stamped element*.
You must define how stamped elements are rendered. 

The plugin augments the `editor` with the following for your convenience:

- `StampedElementComponent`: A react component that serves as the default UI for rendering stamped blocks
- `stampedElementType`: The `type` property of a stamped element.

#### Example
```javascript
const Element = (props) => {
	const { children, element, attributes } = props

    switch (element.type) {
	    // Render stamped elements using the provided default UI
	    case editor.stampedElementType: {
		    const { StampedElementComponent } = editor
		    return <StampedElementComponent {...props} />
		}
		default:
			return <p {...attributes}>{children}</p>
	}
 }
```
If you are implementing a custom component to render stamped elements, note that `label` and `value` will automatically be passed to its `element` prop. For reference, see the default `StampedBlock` implementation in `withStamps.jsx`.

# How it works

# Resources


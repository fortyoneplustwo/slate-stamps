# Slate-stamps

A [Slate plugin](https://docs.slatejs.org/concepts/08-plugins) for building a custom text editor that auto-inserts clickable symbols, called _stamps_, at the start of each line. The plugin comes with sane defaults that define how stamps behave when editing text.

## Features

- Add custom styling to stamps.
- Store arbitrary data inside stamps.
- Define stamp `onclick` handler.
- Override stamp behaviours using the Slate API.

## Install

```
npm install slate-stamps
```

## Usage

Let's try to stamp each line with the number `3` and log the stamp's data to the console when clicked.

#### Step 1: Augmenting the editor with stamp functionality

To augment your editor, you must apply the `withStamps` plugin to your editor and supply two callbacks that define on-insert and on-click behaviour for all stamps. The returned editor now supports stamps using your provided insert and click handlers. 

> [!Important]
>  You **must** first stabilize your callbacks before passing them to the plugin.
>
> Use our stabilizer hook `useStableFn` and pass in your callback and a dependency array. It returns your callback function, stabilized.

```javascript
import { createEditor } from 'slate'
import { withStamps, useStableFn } from 'slate-stamps'

/**
 * Define the callbacks
 */
const onStampInsert = (_) => {
  return { label: '3', value: 3 }
}
const onStampClick = (label, value) => {
  console.log(`${ label, value }`)
}

/**
 * Stabilize the callbacks
 */
const stableOnStampInsert = useStableFn(
  onStampInsert,
  [], // Callback has no dependencies, so pass an empty dependency array
)
const stableOnStampClick = useStableFn(onStampClick, [])

/**
 * Apply the plugin with stable callbacks
 */
const augmentedEditor = withStamps(
  createEditor(),
  stableOnStampInsert,
  stableOnStampClick
))
```

#### Step 2: Rendering stamped lines

With an augmented editor in place, stamped lines still need explicit rendering. 

When a stamp is inserted, Slate represents the stamped line as an `Element` node with these additional properties: `type`, `label`, and `value`. You must tell Slate how to render elements of this type. The augmented editor provides two helpful properties for exactly this purpose:

- `stampedElementType`: a constant string that defines the `type` property on all stamped elements.
- `StampedElementComponent`: a default component that renders a clickable stamp at the start of the line.

```javascript
/**
 * Handle rendering of elements based on the provided schema
 */
const renderElement = props => {
  const { children, element, attributes } = props

  switch (element.type) {
    case augmentedEditor.stampedElementType: {
      // If this element's type is that of a stamped line,
      // then render the provided default component
      const { StampedElementComponent } = augmentedEditor
      return <StampedElementComponent {...props} /> // Always pass props!
    }
    default:
      return <p {...attributes}>{children}</p>
  }
}
```

You may instead wish to render your own component in lieu of the provided default. 

> [!Important]
> - Make sure to still pass down `props` from `renderElement` to your component. This ensures you'll have access to `label` and `value` from within.
> - You will need to manually register the stamp's on-click handler in your component.

```typescript
const YourCustomComponent = () => {}

const renderElement = props => {
  const { children, element, attributes } = props

  switch (element.type) {
    case augmentedEditor.stampedElementType: {
      // If this element's type is that of a stamped line,
      // then render your custom component
      return <YourCustomComponent {...props} /> // Still pass props!
    }
    default:
      return <p {...attributes}>{children}</p>
  }
}
```

> [!Note]
> Rendering content-editable boxes can be tricky. See the implementation of the `StampedBlock` component in `/src/withStamps.jsx` for reference.

## API

### Plugin

#### `withStamps(editor: Editor, onStampInsert: function, onStampClick: function) => AugmentedEditor`

Returns an instance of `AugmentedEditor` with stamp functionality defined by the callbacks `onStampInsert` and `onStampClick`.

#### `onStampInsert(requestedAt: Date) => { label: string, value: any } | null`

Second parameter to `withStamps`. This function executes when the user types on an empty line, but before a stamp is inserted. The `requestedAt` argument provides the timestamp of this event.

Returns an object `{ value, label }` to define the stamp's data. `value` holds the underlying data and `label` is a pretty-printed string that can be displayed inside the stamp.

> [!Note]
> If `null` is returned or the `value` property evaluates to `null`, then a stamp will not be inserted.

#### `onStampClick(label: string, value: any) => void`

Third parameter to `withStamps`. This function executes when a stamp is clicked. Arguments represent the stamp's data -- the same value that was returned from `onStampInsert` when the stamp was created.

#### `AugmentedEditor`

```typescript
type AugmentedEditor = Editor & {
  stampedElementType: string;
  StampedElementComponent: React.FC<
    Element & {
      type: string;
      label: string;
      value: any;
    }
  >;
};
```

The return type of `withStamps` is the same as your editor's, but with 2 additional properties: `stampedElementType` and `StampedElementComponent`.

### Stabilizer

#### `useStableFn(callback: function, dependencyArray: Array) => function`

Create a stable version of a function that can be used in dependency arrays without causing hooks like `useEffect` to re-run if the function changes. Calling the returned function always calls the most recent version of the function that was passed to `useStableFn`.

If you do want the function to be replaced when certain dependency values change, include those values in the dependency array of `useStableFn`.

## Schema

A good data model can solve problems right from the conceptual level. The schema achieves this by defining two new tightly-coupled concepts:

- a stamped node
- a stamped element

### Stamped Node

> [!Important]
> A stamped node must obey these rules:
> 1. It **must** be a `Block` node.
> 2. It **must** have a parent node that is **not** the `Editor` itself.
> 3. It **must** be a single child of its immediate parent.
> 4. It **must only** contain `Inline` nodes.

Visualized as a tree, an example schema could look like this.

<!-- diagram -->

### Stamped Element

> [!Important]
> A stamped element **must** satisfy the rules of a stamped node.

A stamped element can only represent a single stamped line -- rules (1) and (4) ensure this. The element holds the stamp data and the contents of the line. 

Its type extends Slate's `Element` type as follows:

```typescript
type StampedElement = Element & {
  type: string;    // a unique id that identifies a stamped element
  value: any;      // the value referenced by the stamp
  label: string;   // a string that can be rendered inside the stamp,
		   // which in most cases will be the pretty-printed value
}
```

## How it all works together

Below are a few scenarios that demonstrate how the API and schema work together. Reading through them will solidify your understanding of the concepts to fully take advantage of the plugin.

### Stamping a line

When an empty line is about to be stamped,

1.  the plugin locates the lowest-level block at the current selection.
2.  It then calls `onStampInsert` to fetch data that will be stored inside the stamped element.
3.  Finally, it wraps the lowest-level block’s children inside a stamped element, passing in the fetched data.

<!-- diagram -->

### Splitting a stamped line

When a stamped line is split, it results in two stamped lines, but remember, a stamped element cannot have siblings! To handle this, 

1. The content to the right of the split point is moved into a new stamped element.
2. The new stamped element receives fresh data generated by calling `onStampInsert` again.
3. This new stamped element is then wrapped in a container of the same type as the original stamped element's immediate parent. 

> [!Note]
> Because the original line was already stamped, we know from rules (2) and (3) of the schema definition that its immediate parent can neither be another stamped element nor the `Editor` itself. Hence, the result of the split remains valid.

<!-- diagram -->

### Pasting text copied from outside

When text is pasted from outside the editor, the plugin [normalizes](https://docs.slatejs.org/concepts/11-normalizing) the pasted content by splitting the selected block at all newline characters. If the split block is a stamped line, the resulting splits will also be stamped with the same data.


> [!Note]
> As with many plugins, you can customize the behavior by [overriding the augmented editor's methods](https://docs.slatejs.org/concepts/07-editor#overriding-behaviors).

## Resources

There is an example project in the `example/` directory. To run it locally:

1. Clone this repository.
2. Run `pnpm install` and `pnpm build` in the root directory.
3. Navigate to `example/`.
4. Run `pnpm install` and `pnpm run dev`.

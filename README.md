# Canvas Transform Context

A canvas context extension based on [this](http://phrogz.net/tmp/canvas_zoom_to_cursor.html) example by [phrogz](https://stackoverflow.com/users/405017/phrogz). 

Extends the 2d canvas context to support zooming and panning, allowing any canvas to be easily extended with panning and zooming functionalities. Perfect for visual web apps that requires extra canvas functionalities without the hassle of custom canvas implementations.

## [Demo](https://poohcom1.github.io/canvas-transform-context/basic/)


## Installation

### via npm
```
npm i canvas-transform
```

```javascript
import { toTransformedContext } from "canvas-transform"
```
### via browser
```javascript
import { toTransformedContext } from "https://unpkg.com/canvas-transform-context@0.0.2/dist/index.min.js";
```

## Usage

// import { toTransformedContext } from "canvas-transform"

```javascript
import { toTransformedContext } from "https://unpkg.com/canvas-transform-context@0.0.2/dist/index.min.js"
// import { toTransformedContext } from "canvas-transform"

const canvas = getDocumentById("myCanvas")
const ctx = canvas.getContext('2d')

toTransformedContext(ctx)

// Create reusable draw function
function draw(ctx) {
  /* draw on canvas */
}

// Mouse dragging
canvas.addEventListener("mousedown", (e) => {
  ctx.beginPan(e);
  draw(ctx);
});
canvas.addEventListener("mousemove", (e) => {
  ctx.pan(e);
  draw(ctx);
});
canvas.addEventListener("mouseup", (e) => {
  ctx.endPan(e);
  draw(ctx);
});

// Wheel zooming
canvas.addEventListener("wheel", (e) => {
  ctx.zoom(-Math.sign(e.deltaY));
  draw(ctx);
})
```

## Documentation

| Function | Description |
| -- | -- |
| toTransformedContext(ctx) | Extends the canvas context with new methods for rotation and panning (see below). Since the context is directly modified, the value does not need to be reassigned. However, the function does also return the modified context for the sake of typing when using with Typescript. |

### Utility methods
| Method | Description | 
| -- | -- | 
| ctx.transformedPoint(x, y)| Converts a coordinate to the correct translated/scaled coordinates. Returns a DOMPoint (contains `x` and `y` properties). | 

### Panning methods
| Method | Description |
| -- | -- |
| ctx.beginPan(mouseEvent) | Sets the initial panning point. Call from `mousedown`. |
| ctx.pan(mouseEvent) | Pans the canvas. Call from `mousemove`. |
| ctx.endPan(mouseEvent) | Stops the panning. Call form `mouseup`. |

### Zooming methods
| Method | Description |
| -- | -- |
| ctx.zoom(amount, factor?, center?) | Zooms the canvas. `amount` represents the increment to zoom (in integers). `factor` is the percentage to scale by. Defaults to 1.1. `center` is the canvas position to zoom to; if undefined, it will infer from the latest panned position from `endPan`. |

## Attributions

Main implementation based on code by phrogz:
 - http://phrogz.net/tmp/canvas_zoom_to_cursor.html
 - https://github.com/Phrogz

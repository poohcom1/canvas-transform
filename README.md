# Canvas Transform Context

[![npm version](https://badge.fury.io/js/canvas-transform-context.svg)](https://badge.fury.io/js/canvas-transform-context)

A canvas context extension based on [this](http://phrogz.net/tmp/canvas_zoom_to_cursor.html) example by [phrogz](https://stackoverflow.com/users/405017/phrogz).

A class wrapper for a 2D canvas context that keeps track of transform information, allowing for easy coordinate control with scaled/transformed canvases. Perfect for visual web apps that requires extra canvas functionalities without the hassle of custom canvas implementations.

## [Demo](https://poohcom1.github.io/canvas-transform-context/basic/)

## Installation

### via npm

```
npm i canvas-transform-context
```

```javascript
import { TransformContext } from "canvas-transform-context"
```

### via browser

```javascript
import { TransformContext } from "https://unpkg.com/canvas-transform-context@latest/dist/bundle.min.js";
```

## Usage

Basic setup

```javascript
const canvas = getDocumentById(/* canvas id */)
const ctx = canvas.getContext('2d')

const transformCtx = new TransformContext(ctx);

transformCtx.onDraw((ctx) => {
  /* Draw on canvas... */
})

// Mouse dragging
canvas.addEventListener("mousedown", (e) => transformCtx.beginMousePan(e));
canvas.addEventListener("mousemove", (e) => transformCtx.moveMousePan(e));
canvas.addEventListener("mouseup", (e) => transformCtx.endPan(e));

// Wheel zooming
canvas.addEventListener("wheel", (e) => transformCtx.zoomByMouse(e));
```

# Documentation

## Action Methods

Batteries-included methods for commonly use actions, included methods that can directly take mouse events as a parameter.


### `beginMousePan(e)`

Begins a pan given the current position from the mouse event


| Param |
| ------- |
| e     |

### `moveMousePan(e)`

Pans the canvas to the new position from the mouse event.
Does nothing if beginMousePan wasn't called, or if endPan was just called


| Param |
| ------- |
| e     |


### `endMousePan()`

Ends a mouse pan


### `zoomByMouse(e, zoomScale)`

Zooms via the mouse wheel event


| Param     | Default          | Description                                     |
| ----------- | ------------------ | ------------------------------------------------- |
| e         |                  | mouse wheel event                               |
| zoomScale | <code>1.1</code> | The scale percentage to zoom by. Default is 1.1 |


### `beginPan(start, transform)`

Sets the anchor for a panning action


| Param     | Default           | Description                                       |
| ----------- | ------------------- | --------------------------------------------------- |
| start     |                   | Starting coordinates for a pan                    |
| transform | <code>true</code> | Whether or not to transform the start coordinates |


### `movePan(current, transform)`

Pans the canvas to the new coordinates given the starting point in beginPan.
Does nothing if beginPan was not called, or if endPan was just called


| Param     | Default           | Description                                       |
| ----------- | ------------------- | --------------------------------------------------- |
| current   |                   |                                                   |
| transform | <code>true</code> | Whether or not to transform the start coordinates |


### `endPan()`

Stops a pan


### `zoomBy(amount, zoomScale, center, transform) ⇒`

Zoom by a given integer amount

**Returns**: Current zoom amount in integers


| Param     | Default                | Description                                                                                 |
| ----------- | ------------------------ | --------------------------------------------------------------------------------------------- |
| amount    |                        | Amount to zoom by in integers. Positive integer zooms in                                    |
| zoomScale | <code>1.1</code>       | The scale percentage to zoom by. Default is 1.1                                             |
| center    | <code>undefined</code> | The point to zoom in towards. If undefined, it will zoom towards the latest panned position |
| transform | <code>true</code>      | Whether or not to transform the center coordinates                                          |



### `reset()`

Resets all transformations

## Action Helpers

### `onDraw(callback)`

Creates a callback to be called after each action method above. 

| Param       | Description        |
| ------------- | -------------------- |
| callback | A callback function with the canvas context as a parameter |

## Transform Helpers

Helper methods to deal with coordinate transformations


### `transformPoint(canvasPoint) ⇒`

Converts canvas coordinates to transformed coordinates

**Returns**: Transformed coordinates


| Param       | Description        |
| ------------- | -------------------- |
| canvasPoint | Canvas coordinates |


### `mouseToTransformed(e) ⇒`

Converts a mouse event to the transformed coordinates within the canvas

**Returns**: Transformed point


| Param | Description |
| ------- | ------------- |
| e     | mouse event |


### `clearCanvas()`

Clear the canvas given the current transformations

## General Helpers

General purpose canvas helpers unrelated to transform


### `mouseToCanvas(e) ⇒`

Converts a mouse event to the correct canvas coordinates

**Returns**: Canvas coordinates


| Param | Description |
| ------- | ------------- |
| e     | mouse event |

## Attributions

Main implementation based on code by phrogz:

- http://phrogz.net/tmp/canvas_zoom_to_cursor.html
- https://github.com/Phrogz

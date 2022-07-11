import { TransformContext } from "../dist/canvas-transform.js";

const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = 800;
canvas.height = 600;

const ctx = canvas.getContext("2d");
const transformCtx = new TransformContext(ctx);

const catImage = new Image();
catImage.src = "../basic/cat.jpg";

transformCtx.onDraw((ctx) => {
  // Custom canvas clear method
  transformCtx.clearCanvas();

  ctx.drawImage(catImage, 0, 0);
})

// Mouse dragging
canvas.addEventListener("mousedown", (e) => transformCtx.beginMousePan(e));
canvas.addEventListener("mousemove", (e) => transformCtx.moveMousePan(e));
canvas.addEventListener("mouseup", (e) => transformCtx.endPan(e));

// Wheel zooming
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  transformCtx.zoomByMouse(e);
});

document.getElementById("reset").addEventListener("click", () => transformCtx.reset())
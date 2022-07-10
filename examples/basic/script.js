import { TransformContext } from "../dist/bundle.mjs.js";

var canvas = document.getElementsByTagName("canvas")[0];
canvas.width = 800;
canvas.height = 600;

var ctx = canvas.getContext("2d")
const transformCtx = new TransformContext(ctx);

const catImage = new Image();
catImage.src = "../basic/cat.jpg";

function draw() {
  // Custom canvas clear method
  transformCtx.clearCanvas();

  ctx.drawImage(catImage, 0, 0);
}

draw();

// Mouse dragging
canvas.addEventListener("mousedown", (e) => {
  transformCtx.beginMousePan(e);
  draw();
});
canvas.addEventListener("mousemove", (e) => {
  transformCtx.moveMousePan(e);
  draw();
});
canvas.addEventListener("mouseup", (e) => {
  transformCtx.endPan(e);
  draw();
});

// Wheel zooming
canvas.addEventListener("wheel", (e) => {
  transformCtx.mouseZoom(e);
  draw();
});
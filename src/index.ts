interface TransformCanvasRenderingContext2D extends CanvasRenderingContext2D {
  getTransform(): SVGMatrix;
  transformedPoint(x: number, y: number): SVGPoint;
}

export function trackTransforms(
  ctx: CanvasRenderingContext2D | any
): TransformCanvasRenderingContext2D {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let xform = svg.createSVGMatrix();
  ctx.getTransform = function () {
    return xform;
  };

  const savedTransforms = [];
  const save = ctx.save;
  ctx.save = function () {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(ctx);
  };

  const restore = ctx.restore;
  ctx.restore = function () {
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  let scale = ctx.scale;
  ctx.scale = function (sx, sy) {
    xform = xform.scaleNonUniform(sx, sy);
    return scale.call(ctx, sx, sy);
  };

  let rotate = ctx.rotate;
  ctx.rotate = function (radians) {
    xform = xform.rotate((radians * 180) / Math.PI);
    return rotate.call(ctx, radians);
  };

  let translate = ctx.translate;
  ctx.translate = function (dx, dy) {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };

  let transform = ctx.transform;
  ctx.transform = function (a, b, c, d, e, f) {
    let m2 = svg.createSVGMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(ctx, a, b, c, d, e, f);
  };

  let setTransform = ctx.setTransform;
  ctx.setTransform = function (a, b, c, d, e, f) {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };
  let pt = svg.createSVGPoint();
  ctx.transformedPoint = function (x, y) {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };

  ctx.draw = function (callback) {
    callback(ctx);
  };

  return ctx;
}

export function getTransformContext(
  canvas: HTMLCanvasElement
): (callback: (ctx: TransformCanvasRenderingContext2D) => void) => void {
  let ctx = canvas.getContext("2d") as TransformCanvasRenderingContext2D;
  trackTransforms(ctx);

  let callback = (ctx) => undefined;

  function draw(_callback) {
    callback = _callback;
    callback(ctx);
  }

  let lastX = canvas.width / 2,
    lastY = canvas.height / 2;
  let dragStart, dragged;
  canvas.addEventListener(
    "mousedown",
    function (evt) {
      // @ts-ignore
      document.body.style.mozUserSelect =
        document.body.style.webkitUserSelect =
        document.body.style.userSelect =
          "none";
      lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
      lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
      dragStart = ctx.transformedPoint(lastX, lastY);
      dragged = false;
    },
    false
  );
  canvas.addEventListener(
    "mousemove",
    function (evt) {
      lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
      lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
      dragged = true;
      if (dragStart) {
        let pt = ctx.transformedPoint(lastX, lastY);
        ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        callback(ctx);
      }
    },
    false
  );
  canvas.addEventListener(
    "mouseup",
    function (evt) {
      dragStart = null;
      if (!dragged) zoom(evt.shiftKey ? -1 : 1);
    },
    false
  );

  let scaleFactor = 1.1;
  let zoom = function (clicks) {
    let pt = ctx.transformedPoint(lastX, lastY);
    ctx.translate(pt.x, pt.y);
    let factor = Math.pow(scaleFactor, clicks);
    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);
    callback(ctx);
  };

  let handleScroll = function (evt) {
    let delta = evt.wheelDelta
      ? evt.wheelDelta / 40
      : evt.detail
      ? -evt.detail
      : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
  };
  canvas.addEventListener("DOMMouseScroll", handleScroll, false);
  canvas.addEventListener("mousewheel", handleScroll, false);

  draw.bind(this);
  return draw;
}

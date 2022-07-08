"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTransformedContext = exports.isTransformedContext = void 0;
/**
 * Type guard for transformed context
 * @param ctx
 * @returns
 */
function isTransformedContext(ctx) {
    return ("zoom" in ctx && "beginDrag" in ctx && "drag" in ctx && "endDrag" in ctx);
}
exports.isTransformedContext = isTransformedContext;
/**
 * Extends a canvas context IN PLACE.
 * The return value is for type change typescript usage
 * @param ctx
 * @returns The canvas context.
 */
function toTransformedContext(ctx) {
    if (isTransformedContext(ctx)) {
        console.warn("[canvas-transform] Canvas is already a transformed canvas!");
        return ctx;
    }
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () {
        return xform;
    };
    var savedTransforms = [];
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return CanvasRenderingContext2D.prototype.save.call(ctx);
    };
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return CanvasRenderingContext2D.prototype.restore.call(ctx);
    };
    ctx.scale = function (sx, sy) {
        xform = xform.scale(sx, sy);
        return CanvasRenderingContext2D.prototype.scale.call(ctx, sx, sy);
    };
    ctx.rotate = function (radians) {
        xform = xform.rotate((radians * 180) / Math.PI);
        return CanvasRenderingContext2D.prototype.rotate.call(ctx, radians);
    };
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return CanvasRenderingContext2D.prototype.translate.call(ctx, dx, dy);
    };
    ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a;
        m2.b = b;
        m2.c = c;
        m2.d = d;
        m2.e = e;
        m2.f = f;
        xform = xform.multiply(m2);
        return CanvasRenderingContext2D.prototype.transform.call(ctx, a, b, c, d, e, f);
    };
    ctx.setTransform = function (a, b, c, d, e, f) {
        if (typeof a === "number") {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return CanvasRenderingContext2D.prototype.setTransform.call(ctx, a, b, c, d, e, f);
        }
        else {
            return CanvasRenderingContext2D.prototype.setTransform.call(ctx, a);
        }
    };
    // Extensions
    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    };
    var lastX = 0, lastY = 0, dragged = false, dragStart = undefined;
    ctx.clearCanvas = function () {
        var p1 = this.transformedPoint(0, 0);
        var p2 = this.transformedPoint(this.canvas.width, this.canvas.height);
        this.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    };
    ctx.beginDrag = function (e) {
        lastX = e.offsetX || e.pageX - ctx.canvas.offsetLeft;
        lastY = e.offsetY || e.pageY - ctx.canvas.offsetTop;
        dragStart = this.transformedPoint(lastX, lastY);
        dragged = false;
    };
    ctx.drag = function (e) {
        lastX = e.offsetX || e.pageX - ctx.canvas.offsetLeft;
        lastY = e.offsetY || e.pageY - ctx.canvas.offsetTop;
        dragged = true;
        if (dragStart) {
            var pt_1 = this.transformedPoint(lastX, lastY);
            this.translate(pt_1.x - dragStart.x, pt_1.y - dragStart.y);
        }
    };
    ctx.endDrag = function () {
        dragStart = null;
    };
    var zoom = 0;
    ctx.zoom = function (amount, zoomFactor, center) {
        if (zoomFactor === void 0) { zoomFactor = 1.1; }
        var pt = center
            ? this.transform(center.x, center.y)
            : this.transformedPoint(lastX, lastY);
        zoom + amount;
        this.translate(pt.x, pt.y);
        var factor = Math.pow(zoomFactor, amount);
        this.scale(factor, factor);
        this.translate(-pt.x, -pt.y);
        return zoom;
    };
    return ctx;
}
exports.toTransformedContext = toTransformedContext;

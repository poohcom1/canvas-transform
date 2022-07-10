/**
 * @deprecated
 * Type guard for transformed context
 * @param ctx
 * @returns
 */
function isTransformedContext(ctx) {
    return "zoom" in ctx && "beginPan" in ctx && "pan" in ctx && "endPan" in ctx;
}
/**
 * @deprecated
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
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let xform = svg.createSVGMatrix();
    ctx.getTransform = function () {
        return xform;
    };
    const savedTransforms = [];
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return CanvasRenderingContext2D.prototype.save.call(ctx);
    };
    ctx.restore = function () {
        var _a;
        xform = (_a = savedTransforms.pop()) !== null && _a !== void 0 ? _a : svg.createSVGMatrix();
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
        let m2 = svg.createSVGMatrix();
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
        if (typeof a === "number" && b && c && d && e && f) {
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return CanvasRenderingContext2D.prototype.setTransform.call(ctx, a, 
            // @ts-ignore
            b, c, d, e, f);
        }
        else if (typeof a !== "number") {
            return CanvasRenderingContext2D.prototype.setTransform.call(ctx, a);
        }
    };
    // Extensions
    let pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x;
        pt.y = y;
        return pt.matrixTransform(xform.inverse());
    };
    let lastX = 0, lastY = 0, dragStart = undefined;
    ctx.clearCanvas = function () {
        var p1 = this.transformedPoint(0, 0);
        var p2 = this.transformedPoint(this.canvas.width, this.canvas.height);
        this.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    };
    ctx.beginPan = function (e) {
        lastX = e.offsetX || e.pageX - ctx.canvas.offsetLeft;
        lastY = e.offsetY || e.pageY - ctx.canvas.offsetTop;
        dragStart = this.transformedPoint(lastX, lastY);
    };
    ctx.pan = function (e) {
        lastX = e.offsetX || e.pageX - ctx.canvas.offsetLeft;
        lastY = e.offsetY || e.pageY - ctx.canvas.offsetTop;
        if (dragStart) {
            let pt = this.transformedPoint(lastX, lastY);
            this.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        }
    };
    ctx.endPan = function () {
        dragStart = undefined;
    };
    let zoom = 0;
    ctx.zoom = function (amount, zoomFactor = 1.1, center) {
        let pt = center
            ? this.transformedPoint(center.x, center.y)
            : this.transformedPoint(lastX, lastY);
        this.translate(pt.x, pt.y);
        const factor = Math.pow(zoomFactor, amount);
        this.scale(factor, factor);
        this.translate(-pt.x, -pt.y);
        return zoom;
    };
    return ctx;
}

class TransformContext {
    constructor(ctx) {
        this._transform = new DOMMatrix();
        this._savedTransforms = [];
        this.panPosition = { x: 0, y: 0 };
        this._zoom = 0;
        // Draw callback
        this._drawDepth = 0;
        this._ctx = ctx;
    }
    // Transform methods
    get ctx() {
        return this._ctx;
    }
    get transform() {
        return this._transform;
    }
    save() {
        this._savedTransforms.push(this._transform);
        this._ctx.save();
    }
    restore() {
        var _a;
        this._transform = (_a = this._savedTransforms.pop()) !== null && _a !== void 0 ? _a : new DOMMatrix();
        this._ctx.restore();
    }
    scale(x, y) {
        this._transform = this._transform.scale(x, y);
        this._ctx.scale(x, y);
    }
    rotate(radians) {
        this._transform = this._transform.rotate((radians * 180) / Math.PI);
        this._ctx.rotate(radians);
    }
    translate(x, y) {
        this._transform = this._transform.translate(x, y);
        this._ctx.translate(x, y);
    }
    setTransform(a, b, c, d, e, f) {
        this._transform.a = a;
        this._transform.b = b;
        this._transform.c = c;
        this._transform.d = d;
        this._transform.e = e;
        this._transform.f = f;
        this._ctx.setTransform(a, b, c, d, e, f);
    }
    // Basic Utils
    /**
     * Converts a mouse event to the correct canvas coordinates
     * @param e mouse event
     * @returns Canvas coordinates
     */
    mouseToCanvas(e) {
        const x = e.offsetX || e.pageX - this._ctx.canvas.offsetLeft;
        const y = e.offsetY || e.pageY - this._ctx.canvas.offsetTop;
        return { x, y };
    }
    // Transform utils
    /**
     * Converts canvas coordinates to transformed coordinates
     * @param canvasPoint Canvas coordinates
     * @returns Transformed coordinates
     */
    transformPoint(canvasPoint) {
        const domPoint = new DOMPoint(canvasPoint.x, canvasPoint.y);
        return domPoint.matrixTransform(this._transform.inverse());
    }
    /**
     * Converts a mouse event to the transformed coordinates within the canvas
     * @param e mouse event
     * @returns Transformed point
     */
    mouseToTransformed(e) {
        return this.transformPoint(this.mouseToCanvas(e));
    }
    /**
     * Sets the anchor for a panning action
     * @param start Starting coordinates for a pan
     * @param transform Whether or not to transform the start coordinates
     */
    beginPan(start, transform = true) {
        this.panStart = transform ? this.transformPoint(start) : start;
        this.draw();
    }
    /**
     * Pans the canvas to the new coordinates given the starting point in beginPan.
     * Does nothing if beginPan was not called, or if endPan was just called
     * @param current
     * @param transform Whether or not to transform the start coordinates
     */
    movePan(current, transform = true) {
        this.panPosition = transform ? this.transformPoint(current) : current;
        if (this.panStart) {
            this.translate(this.panPosition.x - this.panStart.x, this.panPosition.y - this.panStart.y);
        }
        this.draw();
    }
    /**
     * Stops a pan
     */
    endPan() {
        this.panStart = undefined;
        this.draw();
    }
    /**
     * Begins a pan given the current position from the mouse event
     * @param e
     */
    beginMousePan(e) {
        this.beginPan(this.mouseToCanvas(e));
    }
    /**
     * Pans the canvas to the new position from the mouse event.
     * Does nothing if beginMousePan wasn't called, or if endPan was just called
     * @param e
     */
    moveMousePan(e) {
        this.movePan(this.mouseToCanvas(e));
    }
    /**
     * Ends a mouse pan
     * @param _e Unused
     */
    endMousePan(_e) {
        this.endPan();
    }
    get zoom() {
        return this._zoom;
    }
    /**
     * Zoom by a given integer amount
     * @param amount Amount to zoom by in integers. Positive integer zooms in
     * @param zoomScale The scale percentage to zoom by. Default is 1.1
     * @param center The point to zoom in towards. If undefined, it will zoom towards the latest panned position
     * @param transform Whether or not to transform the center coordinates
     * @returns Current zoom amount in integers
     */
    zoomBy(amount, zoomScale = 1.1, center, transform = true) {
        const pt = !center
            ? this.panPosition
            : transform
                ? this.transformPoint(center)
                : center;
        this._zoom += amount;
        this.translate(pt.x, pt.y);
        const factor = Math.pow(zoomScale, amount);
        this.scale(factor, factor);
        this.translate(-pt.x, -pt.y);
        this.draw();
        return this._zoom;
    }
    /**
     * Zooms via the mouse wheel event
     * @param e mouse wheel event
     * @param zoomScale The scale percentage to zoom by. Default is 1.1
     */
    zoomByMouse(e, zoomScale = 1.1) {
        const point = this.mouseToCanvas(e);
        this.zoomBy(-Math.sign(e.deltaY), zoomScale, point, true);
    }
    /**
     * Resets all transformations
     */
    reset() {
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.draw();
    }
    /**
     * Clear the canvas given the current transformations
     */
    clearCanvas() {
        const p1 = this.transformPoint({ x: 0, y: 0 });
        const p2 = this.transformPoint({
            x: this._ctx.canvas.width,
            y: this._ctx.canvas.height,
        });
        this._ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    }
    draw() {
        if (this._drawDepth > 0) {
            this._drawDepth = 0;
            return;
        }
        if (this._draw) {
            this._drawDepth++;
            this._draw(this._ctx);
        }
        this._drawDepth = 0;
    }
    /**
     * Sets a callback to be drawn on actions. Set to undefined to remove draw callback
     * @param callback
     */
    onDraw(callback) {
        this._draw = callback;
    }
}

export { TransformContext, isTransformedContext, toTransformedContext };

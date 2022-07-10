interface Point {
  x: number;
  y: number;
}

/**
 * Remove wrapped methods to discourage use without the transform tracking
 */
type CanvasContextWithTransform = Omit<
  CanvasRenderingContext2D,
  "save" | "restore" | "scale" | "rotate" | "translate" | "setTransform"
>;

type DrawCallback = (ctx: CanvasContextWithTransform) => void;

export default class TransformContext {
  private readonly _ctx: CanvasRenderingContext2D;

  private _transform = new DOMMatrix();
  private _savedTransforms: DOMMatrix[] = [];

  private _draw: DrawCallback | undefined;

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  // Transform methods
  get ctx(): CanvasContextWithTransform {
    return this._ctx;
  }

  get transform(): DOMMatrix {
    return this._transform;
  }

  save(): void {
    this._savedTransforms.push(this._transform);
    this._ctx.save();
  }

  restore(): void {
    this._transform = this._savedTransforms.pop() ?? new DOMMatrix();
    this._ctx.restore();
  }

  scale(x: number, y: number): void {
    this._transform = this._transform.scale(x, y);
    this._ctx.scale(x, y);
  }

  rotate(radians: number): void {
    this._transform = this._transform.rotate((radians * 180) / Math.PI);
    this._ctx.rotate(radians);
  }

  translate(x: number, y: number): void {
    this._transform = this._transform.translate(x, y);
    this._ctx.translate(x, y);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void {
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
  mouseToCanvas(e: MouseEvent): Point {
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
  transformPoint(canvasPoint: Point): Point {
    const domPoint = new DOMPoint(canvasPoint.x, canvasPoint.y);

    return domPoint.matrixTransform(this._transform.inverse());
  }

  /**
   * Converts a mouse event to the transformed coordinates within the canvas
   * @param e mouse event
   * @returns Transformed point
   */
  mouseToTransformed(e: MouseEvent): Point {
    return this.transformPoint(this.mouseToCanvas(e));
  }

  // Pre-built transform method
  public panStart: Point | undefined;
  public panPosition: Point = { x: 0, y: 0 };

  /**
   * Sets the anchor for a panning action
   * @param start Starting coordinates for a pan
   * @param transform Whether or not to transform the start coordinates
   */
  beginPan(start: Point, transform = true): void {
    this.panStart = transform ? this.transformPoint(start) : start;

    this.draw();
  }

  /**
   * Pans the canvas to the new coordinates given the starting point in beginPan.
   * Does nothing if beginPan was not called, or if endPan was just called
   * @param current
   * @param transform Whether or not to transform the start coordinates
   */
  movePan(current: Point, transform = true): void {
    this.panPosition = transform ? this.transformPoint(current) : current;

    if (this.panStart) {
      this.translate(
        this.panPosition.x - this.panStart.x,
        this.panPosition.y - this.panStart.y
      );
    }
    this.draw();
  }

  /**
   * Stops a pan
   */
  endPan(): void {
    this.panStart = undefined;
    this.draw();
  }

  /**
   * Begins a pan given the current position from the mouse event
   * @param e
   */
  beginMousePan(e: MouseEvent): void {
    this.beginPan(this.mouseToCanvas(e));
  }

  /**
   * Pans the canvas to the new position from the mouse event.
   * Does nothing if beginMousePan wasn't called, or if endPan was just called
   * @param e
   */
  moveMousePan(e: MouseEvent): void {
    this.movePan(this.mouseToCanvas(e));
  }

  /**
   * Ends a mouse pan
   * @param _e Unused
   */
  endMousePan(_e?: MouseEvent): void {
    this.endPan();
  }

  private _zoom = 0;

  get zoom(): number {
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
  zoomBy(amount: number, zoomScale = 1.1, center?: Point, transform = true) {
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
  zoomByMouse(e: WheelEvent, zoomScale = 1.1) {
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

  // Draw callback
  private _drawDepth = 0;

  private draw() {
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
  onDraw(callback: DrawCallback | undefined) {
    this._draw = callback;
  }
}

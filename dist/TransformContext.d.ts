interface Point {
    x: number;
    y: number;
}
/**
 * Remove wrapped methods to discourage use without the transform tracking
 */
declare type CanvasContextWithTransform = Omit<CanvasRenderingContext2D, "save" | "restore" | "scale" | "rotate" | "translate" | "setTransform">;
export default class TransformContext {
    private readonly _ctx;
    private _transform;
    private _savedTransforms;
    constructor(ctx: CanvasRenderingContext2D);
    get ctx(): CanvasContextWithTransform;
    get transform(): DOMMatrix;
    save(): void;
    restore(): void;
    scale(x: number, y: number): void;
    rotate(radians: number): void;
    translate(x: number, y: number): void;
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
    /**
     * Converts a mouse event to the correct canvas coordinates
     * @param e mouse event
     * @returns Canvas coordinates
     */
    mouseToCanvas(e: MouseEvent): Point;
    /**
     * Converts canvas coordinates to transformed coordinates
     * @param canvasPoint Canvas coordinates
     * @returns Transformed coordinates
     */
    transformPoint(canvasPoint: Point): Point;
    /**
     * Converts a mouse event to the transformed coordinates within the canvas
     * @param e mouse event
     * @returns Transformed point
     */
    mouseToTransformed(e: MouseEvent): Point;
    panStart: Point | undefined;
    panPosition: Point;
    /**
     * Sets the anchor for a panning action
     * @param start Starting coordinates for a pan
     * @param transform Whether or not to transform the start coordinates
     */
    beginPan(start: Point, transform?: boolean): void;
    /**
     * Pans the canvas to the new coordinates given the starting point in beginPan.
     * Does nothing if beginPan was not called, or if endPan was just called
     * @param current
     * @param transform Whether or not to transform the start coordinates
     */
    movePan(current: Point, transform?: boolean): void;
    /**
     * Stops a pan
     */
    endPan(): void;
    /**
     * Begins a pan given the current position from the mouse event
     * @param e
     */
    beginMousePan(e: MouseEvent): void;
    /**
     * Pans the canvas to the new position from the mouse event.
     * Does nothing if beginMousePan wasn't called, or if endPan was just called
     * @param e
     */
    moveMousePan(e: MouseEvent): void;
    /**
     * Ends a mouse pan
     * @param _e Unused
     */
    endMousePan(_e?: MouseEvent): void;
    private _zoom;
    get zoom(): number;
    /**
     * Zoom by a given integer amount
     * @param amount Amount to zoom by in integers. Positive integer zooms in
     * @param zoomScale The scale percentage to zoom by. Default is 1.1
     * @param center The point to zoom in towards. If undefined, it will zoom towards the latest panned position
     * @param transform Whether or not to transform the center coordinates
     * @returns Current zoom amount in integers
     */
    zoomBy(amount: number, zoomScale?: number, center?: Point, transform?: boolean): number;
    /**
     * Zooms via the mouse wheel event
     * @param e mouse wheel event
     * @param zoomScale The scale percentage to zoom by. Default is 1.1
     */
    zoomByMouse(e: WheelEvent, zoomScale?: number): void;
    /**
     * Resets all transformations
     */
    reset(): void;
    /**
     * Clear the canvas given the current transformations
     */
    clearCanvas(): void;
}
export {};

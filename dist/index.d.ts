export interface TransformCanvasRenderingContext2D extends CanvasRenderingContext2D {
    getTransform(): SVGMatrix;
    transformedPoint(x: number, y: number): DOMPoint;
    clearCanvas(): void;
    /**
     * Marks the start of a canvas drag.
     * Should be used on the onmousedown event
     * @param e
     */
    beginPan(e: MouseEvent): void;
    /**
     * Drags the canvas.
     * Should be used on the onmousemove event
     * @param e
     */
    pan(e: MouseEvent): void;
    /**
     * Ends the canvas draw.
     * Should be used on the onmousemove event
     * @param e
     */
    endPan(e: MouseEvent): void;
    /**
     * Zooms in or out
     * @param amount Amount in integers to zoom by. Applies zoom on top of previous zoom
     * @param factor Zoom factor. Defaults to 1.1
     * @param center The center to zoom to. If undefined, will zoom to the last mouse pos in endDraw
     */
    zoom(amount: number, factor?: number, center?: {
        x: number;
        y: number;
    }): number;
}
/**
 * Type guard for transformed context
 * @param ctx
 * @returns
 */
export declare function isTransformedContext(ctx: CanvasRenderingContext2D): ctx is TransformCanvasRenderingContext2D;
/**
 * Extends a canvas context IN PLACE.
 * The return value is for type change typescript usage
 * @param ctx
 * @returns The canvas context.
 */
export declare function toTransformedContext(ctx: CanvasRenderingContext2D): TransformCanvasRenderingContext2D;

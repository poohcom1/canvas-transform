interface TransformCanvasRenderingContext2D extends CanvasRenderingContext2D {
    getTransform(): SVGMatrix;
    transformedPoint(x: number, y: number): SVGPoint;
}
export declare function trackTransforms(ctx: CanvasRenderingContext2D): TransformCanvasRenderingContext2D;
export declare function getTransformContext(canvas: HTMLCanvasElement): (callback: (ctx: TransformCanvasRenderingContext2D) => void) => void;
export {};

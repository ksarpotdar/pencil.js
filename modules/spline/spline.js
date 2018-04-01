import Line from "@pencil.js/line";
import { equal } from "@pencil.js/math";

/**
 * Spline class
 * @class
 * @extends Line
 */
export default class Spline extends Line {
    /**
     * Spline constructor
     * @param {Array<Position>} points - Set of points to go through
     * @param {Number} [tension=Spline.defaultTension] - Ratio of tension between points (0 means straight line, can take any value, but with weird results above 1)
     * @param {LineOptions} [options] - Drawing options
     */
    constructor (points, tension = Spline.defaultTension, options) {
        super(points, options);

        /**
         * @type {Number}
         */
        this.tension = tension;
    }

    /**
     * Draw the spline
     * @param {CanvasRenderingContext2D} ctx - Drawing context
     * @return {Spline} Itself
     */
    trace (ctx) {
        if (this.points.length < 3 || equal(this.tension, 0)) {
            super.trace(ctx);
        }
        else {
            ctx.lineCap = this.options.cap;
            Spline.splineThrough(ctx, this.points.map(point => point.clone().subtract(this.position)), this.tension);
        }
        return this;
    }

    /**
     * Default ratio of tension
     * @return {Number}
     */
    static get defaultTension () {
        return 0.2;
    }

    /**
     * Draw a spline through points using a tension
     * @param {CanvasRenderingContext2D} ctx - Drawing context
     * @param {Array<Position>} points - Points to use
     * @param {Number} [tension=Spline.defaultTension] - Ratio of tension
     */
    static splineThrough (ctx, points, tension = Spline.defaultTension) {
        const getCtrlPts = Spline.getControlPoint;
        let previousControls = [null, points[0]];
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1, l = points.length; i < l; ++i) {
            const controlPoints = i < l - 1 ? getCtrlPts(points.slice(i - 1, i + 2), tension) : [points[i], null];
            ctx.bezierCurveTo(
                previousControls[1].x, previousControls[1].y, controlPoints[0].x, controlPoints[0].y,
                points[i].x, points[i].y,
            );

            previousControls = controlPoints;
        }
    }

    /**
     * Returns control points for a point in a spline (needs before and after, 3 points in total)
     * @param {Array<Position>} points - 3 points to use (before, target, after)
     * @param {Number} tension - Ratio of tension
     * @return {[Position, Position]}
     */
    static getControlPoint (points, tension) {
        if (points.length < 3) {
            throw new RangeError(`Need exactly 3 points to compute control points, but ${points.length} given.`);
        }

        const diff = points[2].clone().subtract(points[0]).multiply(tension);
        return [
            points[1].clone().subtract(diff),
            points[1].clone().add(diff),
        ];
    }

    /**
     * @return {LineCaps}
     */
    static get caps () {
        return super.caps;
    }

    /**
     * @return {LineJoins}
     */
    static get joins () {
        return super.joins;
    }
}

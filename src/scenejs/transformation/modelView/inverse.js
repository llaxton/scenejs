/**
 * @class A scene node that inverts the transformations (IE. the model/view matrix) defined by the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>Inverting the transformation defined by a {@link SceneJS.Matrix) child node:</b></p><pre><code>
 * var inverse = new SceneJS.Inverse(
 *     new SceneJS.Matrix({
 *           elements : [
 *                  1, 0, 0, 10,
 *                  0, 1, 0, 5,
 *                  0, 0, 1, 3,
 *                  0, 0, 0, 1
 *              ]
 *        })
 *   })
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Inverse
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Inverse = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "inverse";
    this._mat = SceneJS._math_identityMat4();
    this._xform = null;
};

SceneJS._inherit(SceneJS.Inverse, SceneJS.Node);

SceneJS.Inverse.prototype._render = function(traversalContext, data) {
    var origMemoLevel = this._memoLevel;

    if (this._memoLevel == 0) {
        this._memoLevel = 1; // For consistency with other transform nodes
    }
    var superXform = SceneJS._modelViewTransformModule.getTransform();
    if (origMemoLevel < 2 || (!superXform.fixed)) {
        var instancing = SceneJS._instancingModule.instancing();
        var tempMat = SceneJS._math_inverseMat4(superXform.matrix, this._mat);

        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: origMemoLevel == 2
        };

        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS._modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS._modelViewTransformModule.setTransform(superXform);
};

/** Factory function that returns a new {@link SceneJS.Inverse} instance
 */
SceneJS.inverse = function() {
    var n = new SceneJS.Inverse();
    SceneJS.Inverse.prototype.constructor.apply(n, arguments);
    return n;
};

SceneJS.registerNodeType("inverse", SceneJS.inverse);

define(["../lib/trackball-controls/TrackballControls"], function (TrackballControls) {
    "use strict";

    var Frame = function (elem) {
        var self = this;

        if (typeof elem === 'string') {
            elem = document.getElementById(elem);
        }

        var width = elem.scrollWidth;
        var height = elem.scrollHeight;

        this.scene = new THREE.Scene();

        this._initCamera(width/height);

        this._initRenderer(width, height);
        elem.appendChild(this.renderer.domElement);

        this._initControls();

        this._initNodes();
        this.scene.add(this.particleSystem);

        this._initEdges();
        this.scene.add(this.line);

        window.addEventListener('resize', function () {
            self.camera.aspect = window.innerWidth / window.innerHeight;
            self.camera.updateProjectionMatrix();

            self.renderer.setSize(window.innerWidth, window.innerHeight);
            self.renderer.render(self.scene, self.camera);
        }, false);
    };

    Frame.prototype._initCamera = function (aspect) {
        var viewAngle = 45;
        var near = 0.1;
        var far = 10000;

        var camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
        camera.position.z = 15;

        this.camera = camera;
    };

    Frame.prototype._initRenderer = function (width, height) {
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        this.renderer = renderer;
    };

    Frame.prototype._initControls = function () {
        var self = this;
        var controls = new TrackballControls(this.camera);

        controls.addEventListener('change', function () {
            self.renderer.render(self.scene, self.camera);
        });

        this.controls = controls;
    };

    Frame.prototype._initNodes = function () {
        var material = new THREE.ParticleSystemMaterial({
            size: 4,
            sizeAttenuation: false,
        });
        this.particles = new THREE.Geometry();
        this.particleSystem = new THREE.ParticleSystem(this.particles, material);
    };

    Frame.prototype._initEdges = function () {
        this.edges = new THREE.Geometry();
        var edgeMaterial = new THREE.LineBasicMaterial({color: 0x0000ff});
        this.line = new THREE.Line(this.edges, edgeMaterial, THREE.LinePieces);
    };

    Frame.prototype.addNode = function (node) {
        this.particles.vertices.push(node.position);
    };

    Frame.prototype.addEdge = function (edge) {
        this.edges.vertices.push(edge.n1Coords);
        this.edges.vertices.push(edge.n2Coords);
    };

    Frame.prototype.centerView = function () {
        // Calculate bounding sphere
        this.particles.computeBoundingSphere();
        var sphere = this.particles.boundingSphere;
        var center = [-sphere.center.x, -sphere.center.y, -sphere.center.z];

        // Create/apply translation transformation matrix
        var translation = new THREE.Matrix4();
        translation.makeTranslation.apply(translation, center);
        this.particles.applyMatrix(translation);

        // Determine scale to normalize coordinates
        var scale = 5 / sphere.radius;

        // Scale coordinates
        this.particleSystem.scale.set(scale, scale, scale);
        this.line.scale.set(scale, scale, scale);
    };

    Frame.prototype.render = function () {
        var self = this;

        this.centerView();

        (function animate() {
            window.requestAnimationFrame(animate);
            self.controls.update();
        }());
    };

    return Frame;
});
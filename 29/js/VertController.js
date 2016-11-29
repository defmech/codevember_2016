this.Dog = this.Dog || {};

(function() {
	"use strict";

	function VertController(object3D) {
		this.object3D = object3D;
		this.vertices = [];

		var curVert;

		for (var j = 0; j < object3D.geometry.vertices.length; j++) {
			curVert = object3D.geometry.vertices[j];
			object3D.geometry.vertices[j] = this.getVert(curVert.x, curVert.y, curVert.z);
		};

	}

	VertController.prototype.getVert = function(x, y, z) {
		var tmpVert = new THREE.Vector3(x, y, z);
		var curVert;

		// loops though the verts to see if a reference already exists

		for (var i = 0; i < this.vertices.length; i++) {
			curVert = this.vertices[i];

			if (Math.round(curVert.x) == Math.round(tmpVert.x) && Math.round(curVert.y) == Math.round(tmpVert.y) && Math.round(curVert.z) == Math.round(tmpVert.z)) {
				console.log('VertController.js', 'match');
				return curVert;
			}
		};

		this.vertices.push(tmpVert);

		return tmpVert;
	}

	Dog.VertController = VertController;
})();
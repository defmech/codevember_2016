var Defmech = Defmech || {};

Defmech.BoxOfBalls = function(scene, size, iterator, maxIterator) {

	var SCALE_MIN = 0.2;
	var SPHERE_RADIUS = 8;

	var elements = [];

	var howMany = 20;

	var color = new THREE.Color('hsl(' + Dog.Utils.map(iterator, 0, maxIterator, 0, 360) + ', 90%, 40%)')

	var container = new THREE.Object3D();

	addElements();
	addBox();

	function addBox() {

		/**
		 * There must be a better way of doing this?
		 */

		var material = new THREE.LineBasicMaterial({
			color: color,
			linewidth: 2,
			transparent: true,
			opacity: 0.5,
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-size, -size, -size),
			new THREE.Vector3(-size, -size, size),
			new THREE.Vector3(size, -size, size),
			new THREE.Vector3(size, -size, -size),
			new THREE.Vector3(-size, -size, -size)
		);

		var line = new THREE.Line(geometry, material);
		container.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-size, size, -size),
			new THREE.Vector3(-size, size, size),
			new THREE.Vector3(size, size, size),
			new THREE.Vector3(size, size, -size),
			new THREE.Vector3(-size, size, -size)
		);

		line = new THREE.Line(geometry, material);
		container.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-size, size, -size),
			new THREE.Vector3(-size, -size, -size)
		);

		line = new THREE.Line(geometry, material);
		container.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(size, size, -size),
			new THREE.Vector3(size, -size, -size)
		);

		line = new THREE.Line(geometry, material);
		container.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-size, size, size),
			new THREE.Vector3(-size, -size, size)
		);

		line = new THREE.Line(geometry, material);
		container.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(size, size, size),
			new THREE.Vector3(size, -size, size)
		);

		line = new THREE.Line(geometry, material);
		container.add(line);

	}

	function addElements() {


		var geometry = new THREE.SphereBufferGeometry(SPHERE_RADIUS, 32, 32);
		var material = new THREE.MeshPhongMaterial({
			// color: 0x2194ce,
			color: color,
			shading: THREE.SmoothShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 60,
		});

		for (var i = 0; i < howMany; i++) {

			var element = new THREE.Mesh(geometry, material);

			element.index = i;

			element.position.x = Dog.Utils.randomRange(-size, size);
			element.position.y = Dog.Utils.randomRange(-size, size);
			element.position.z = Dog.Utils.randomRange(-size, size);


			element.scale.x = element.scale.y = element.scale.z = Dog.Utils.randomRange(SCALE_MIN, 1);

			element.velocity = new THREE.Vector3(Dog.Utils.randomRange(-1, 1), Dog.Utils.randomRange(-1, 1), Dog.Utils.randomRange(-1, 1));

			element.velocity.setLength(Dog.Utils.map(element.scale.x, SCALE_MIN, 1, 5, 1));

			element.scaleClone = element.scale.clone();

			element.receiveShadow = true;
			element.castShadow = true;

			element.positionClone = element.position.clone();

			container.add(element);

			// if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elements.push(element);
		}
	};

	container.animateElements = function() {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			if (element.position.x + element.velocity.x >= size || element.position.x + element.velocity.x <= -size) {
				element.velocity.x *= -1;
			};
			if (element.position.y + element.velocity.y >= size || element.position.y + element.velocity.y <= -size) {
				element.velocity.y *= -1;
			};
			if (element.position.z + element.velocity.z >= size || element.position.z + element.velocity.z <= -size) {
				element.velocity.z *= -1;
			};

			element.position.x += element.velocity.x;
			element.position.y += element.velocity.y;
			element.position.z += element.velocity.z;

			// console.log('Main.js', 'speed', speed, 'element.scale.x', element.scale.x);
		}
	}

	return container;
};
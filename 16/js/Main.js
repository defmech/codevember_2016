var Dog = Dog || {};

Dog.Main = (function() {
	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// texture vars
	var textureBumpMapLoader, textureMapBump;

	// Should scene show helpers
	var USE_HELPERS = false;

	// Objects
	var elements = [];
	var elementsContainer;

	var BOX_WIDTH = 150;

	var SCALE_MIN = 0.2;
	var SPHERE_RADIUS = 10;

	var spotLight1;

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = -400;
		camera.position.y = 440;
		camera.position.z = 400;

		// console.log('Main.js', camera.position);

		camera.lookAt(0, 0, 0)

		// init renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		renderer.shadowMap.enabled = true;

		// console.dir(renderer.shadowMap);
		// renderer.shadowMapSoft = false;

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);


		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		// load images
		textureBumpMapLoader.load('./img/logo_dog.png', function(texture) {
			textureMapBump = texture;

			init();
		});

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(500));
	}

	function init() {

		// add content
		addLighting();
		addFloor();
		addElements();
		addBox();

		// init keyboard listener
		initKeyboard();

		// render
		render();
	}

	function animateElements() {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			if (element.position.x + element.velocity.x >= BOX_WIDTH || element.position.x + element.velocity.x <= -BOX_WIDTH) {
				element.velocity.x *= -1;
			};
			if (element.position.y + element.velocity.y >= BOX_WIDTH || element.position.y + element.velocity.y <= -BOX_WIDTH) {
				element.velocity.y *= -1;
			};
			if (element.position.z + element.velocity.z >= BOX_WIDTH || element.position.z + element.velocity.z <= -BOX_WIDTH) {
				element.velocity.z *= -1;
			};

			element.position.x += element.velocity.x;
			element.position.y += element.velocity.y;
			element.position.z += element.velocity.z;

			// console.log('Main.js', 'speed', speed, 'element.scale.x', element.scale.x);


		}
	}


	function initKeyboard() {
		// listen for keystrokes
		document.body.addEventListener("keyup", function(event) {
			// console.info('event.keyCode', event.keyCode);

			switch (event.keyCode) {
				case 80: // p
					exportCanvasImageDataToPNG();
					break;
			}
		});
	}

	// gets image data 
	function exportCanvasImageDataToPNG() {
		getCanvasImageData = true;
		render(ONCE);

		var win = window.open("", "Canvas Image");
		var canvas = renderer.domElement;
		var src = canvas.toDataURL("image/png");

		win.document.write("<img src='" + canvasImageData + "' width='" + canvas.width + "' height='" + canvas.height + "'/>");
	}

	function onWindowResize() {
		// Update camera and renderer
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function addLighting() {

		// Add a light
		spotLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
		spotLight1.position.set(Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(400, 600), Dog.Utils.randomRange(300, 500));
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 600;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 100;
		spotLight1.shadow.camera.far = 1500;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;

		if (USE_HELPERS) scene.add(new THREE.CameraHelper(spotLight1.shadow.camera));

		scene.add(spotLight1);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight1));

		// add another spotlight
		var spotLight2 = new THREE.DirectionalLight(0xffffff, 0.125);
		spotLight2.position.set(Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500));
		spotLight2.target.position.set(0, 0, 0);

		scene.add(spotLight2);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight2));

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x555555));
	}

	function addBox() {

		/**
		 * There must be a better way of doing this?
		 */

		var material = new THREE.LineBasicMaterial({
			color: 0x2194ce
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-BOX_WIDTH, -BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, -BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, -BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, -BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, -BOX_WIDTH, -BOX_WIDTH)
		);

		var line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-BOX_WIDTH, BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, BOX_WIDTH, -BOX_WIDTH)
		);

		line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-BOX_WIDTH, BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, -BOX_WIDTH, -BOX_WIDTH)
		);

		line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(BOX_WIDTH, BOX_WIDTH, -BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, -BOX_WIDTH, -BOX_WIDTH)
		);

		line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-BOX_WIDTH, BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(-BOX_WIDTH, -BOX_WIDTH, BOX_WIDTH)
		);

		line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(BOX_WIDTH, BOX_WIDTH, BOX_WIDTH),
			new THREE.Vector3(BOX_WIDTH, -BOX_WIDTH, BOX_WIDTH)
		);

		line = new THREE.Line(geometry, material);
		elementsContainer.add(line);

	}

	function addElements() {

		var howMany = 250;

		elementsContainer = new THREE.Object3D();
		scene.add(elementsContainer);

		var geometry = new THREE.SphereBufferGeometry(SPHERE_RADIUS, 32, 32);
		var material = new THREE.MeshPhongMaterial({
			color: 0x2194ce,
			shading: THREE.SmoothShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 60,
		});


		for (var i = 0; i < howMany; i++) {

			var element = new THREE.Mesh(geometry, material);

			element.index = i;

			element.position.x = Dog.Utils.randomRange(-BOX_WIDTH, BOX_WIDTH);
			element.position.y = Dog.Utils.randomRange(-BOX_WIDTH, BOX_WIDTH);
			element.position.z = Dog.Utils.randomRange(-BOX_WIDTH, BOX_WIDTH);


			element.scale.x = element.scale.y = element.scale.z = Dog.Utils.randomRange(SCALE_MIN, 1);

			element.velocity = new THREE.Vector3(Dog.Utils.randomRange(-1, 1), Dog.Utils.randomRange(-1, 1), Dog.Utils.randomRange(-1, 1));

			element.velocity.setLength(Dog.Utils.map(element.scale.x, SCALE_MIN, 1, 5, 1));

			element.scaleClone = element.scale.clone();

			element.receiveShadow = true;
			element.castShadow = true;

			element.positionClone = element.position.clone();

			elementsContainer.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elements.push(element);
		}

	}

	function addFloor() {
		var floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shading: THREE.FlatShading,
			emissive: 0x666666,
			specular: 0x111111,
			shininess: 30,
		});

		var floorGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -BOX_WIDTH;
		scene.add(floor);


	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateElements();
		elementsContainer.rotation.y -= 0.01;

		renderer.clear();
		renderer.render(scene, camera);
		orbitControls.update();

		if (getCanvasImageData === true) {
			canvasImageData = renderer.domElement.toDataURL();
			getCanvasImageData = false;
		}
	}

	return {
		init: function() {
			setup();
		}
	};
})();
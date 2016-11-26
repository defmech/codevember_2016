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
	var USE_HELPERS = true;

	// Objects
	var hero;
	var sphere;
	var topVertIndexes = [];
	var animationSpeed = 2;
	var animOffset = 0;
	var elements = [];
	var elementsContainer;

	var ORIGIN = {
		x: 0,
		y: 0
	}

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

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);


		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(500));

		init();
	}

	function init() {

		// add content
		addLighting();
		addFloor();
		addElements();

		// init keyboard listener
		initKeyboard();

		// render
		render();
	}

	function animateElements() {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			var elementRadius = Dog.Utils.distance({
				x: element.position.x,
				y: element.position.z
			}, ORIGIN);

			var elementAngle = Dog.Utils.angleBetweenPointsInRad({
				x: element.position.x,
				y: element.position.z
			}, ORIGIN);

			// Normalize to positive angle
			elementAngle += Math.PI;

			var speed = 0.005;

			elementAngle = (elementAngle + speed) % (Math.PI * 2);

			var maxCirc = 2 * (Math.PI * 2) * elementRadius;

			var elementCirc = 2 * (elementAngle - Dog.Utils.degToRad(animOffset)) * elementRadius;

			var distanceRoundCirc = Dog.Utils.map(elementCirc, 0, maxCirc, 0, (Math.PI * 4));

			element.position.x = Math.cos(elementAngle) * elementRadius;
			element.position.z = Math.sin(elementAngle) * elementRadius;

			var newScale = element.scaleClone.x * Dog.Utils.map(Math.sin(distanceRoundCirc), -1, 1, 0.3, 1.3);
			element.scale.x = element.scale.y = element.scale.z = newScale;
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
		spotLight1.position.set(Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500));
		spotLight1.position.set(0, 400, 0);
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 600;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 100;
		spotLight1.shadow.camera.far = 1000;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;

		// if (USE_HELPERS) scene.add(new THREE.CameraHelper(spotLight1.shadow.camera));

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

	function addElements() {


		var sphereRadius = 10;

		var howMany = 250; // 250

		var donutRadius = 200;
		var innerRadiusMax = 60;


		elementsContainer = new THREE.Object3D();
		scene.add(elementsContainer);

		var geometry = new THREE.SphereBufferGeometry(sphereRadius, 32, 32);


		for (var i = 0; i < 360; i += 15) {

			var material = new THREE.MeshPhongMaterial({
				color: new THREE.Color('hsl(' + i + ', 100%, 50%)'),
				shading: THREE.SmoothShading,
				emissive: 0x000000,
				specular: 0x666666,
				shininess: 60,
			});

			var angleDonut = Dog.Utils.degToRad(i);

			var howManyPerSlice = 14;

			for (var j = 0; j < howManyPerSlice; j++) {
				var element = new THREE.Mesh(geometry, material);

				element.index = i;

				// Position
				element.position.x = Math.cos(angleDonut) * donutRadius;
				element.position.z = Math.sin(angleDonut) * donutRadius;

				// Rotation
				element.rotation.y = -angleDonut;

				// Move on local axis
				var angleInner = ((Math.PI * 2) / howManyPerSlice) * j;

				element.translateX(Math.cos(angleInner) * innerRadiusMax);
				element.translateY(Math.sin(angleInner) * innerRadiusMax);

				// Scale relative to distance
				element.scale.x = element.scale.y = element.scale.z = Dog.Utils.map(element.position.length(), donutRadius - innerRadiusMax, donutRadius + innerRadiusMax, 0.9, 1.2);

				element.scaleClone = element.scale.clone();

				// Shadow
				element.receiveShadow = true;
				element.castShadow = true;

				element.positionClone = element.position.clone();

				elementsContainer.add(element);

				if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

				elements.push(element);
			}
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
		floor.position.y = -200;
		scene.add(floor);
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animOffset = (animOffset < 360) ? animOffset += animationSpeed : 0;

		animateElements();
		// elementsContainer.rotation.y -= 0.01;

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
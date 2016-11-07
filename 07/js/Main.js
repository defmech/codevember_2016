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
	var hero;
	var sphere;
	var topVertIndexes = [];
	var animationSpeed = 2;
	var animOffset = 0;
	var maxUndulation = 80;
	var elements = [];
	var elementsContainer;

	var depthArray = [];
	var depthArrayIndex = 0;

	var axisArray = ['x', 'y', 'z'];
	var axisArrayIndex = 0;

	var howManyElementsInRow = 10;

	var animDur = 1.125;
	var intervalDur = 4 * 1000;

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = Dog.Utils.randomRange(-300, -500);
		camera.position.y = Dog.Utils.randomRange(300, 400);
		camera.position.z = Dog.Utils.randomRange(300, 500);

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

		initAnimation();

		// init keyboard listener
		initKeyboard();

		// render
		render();
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
		var spotLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
		spotLight1.position.set(Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(500, 700), Dog.Utils.randomRange(300, 500));
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 3000;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 1;
		spotLight1.shadow.camera.far = 2000;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;
		spotLight1.shadow.camera.visible = true;

		scene.add(spotLight1);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight1));

		// add another spotlight
		var spotLight2 = new THREE.DirectionalLight(0xffffff, 0.25);
		spotLight2.position.set(Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(100, 300), Dog.Utils.randomRange(300, 500));
		spotLight2.target.position.set(0, 0, 0);

		scene.add(spotLight2);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight2));

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x222222));
	}

	function addToDepthArray(val) {
		if (depthArray.indexOf(val) == -1) {
			depthArray.push(val);
		}
	}

	function addElements() {

		var width = 20;
		var gap = 10;
		var howMany = Math.pow(howManyElementsInRow, 3);

		var offSet = ((width * (howManyElementsInRow - 1)) + (gap * (howManyElementsInRow - 1))) / 2;

		elementsContainer = new THREE.Object3D();
		scene.add(elementsContainer);

		var geometry = new THREE.BoxBufferGeometry(width, width, width);

		// var geometry = new THREE.SphereBufferGeometry(width / 2, 32, 32);



		for (var i = 0; i < howMany; i++) {
			var material = new THREE.MeshPhongMaterial({
				// color: 0x2194ce,
				color: new THREE.Color('hsl(' + Dog.Utils.randomRange(0, 360) + ', 100%, 50%)'),
				shading: THREE.FlatShading,
				// shading: THREE.SmoothShading,
				emissive: 0x000000,
				specular: 0x666666,
				shininess: 60,
			});

			var element = new THREE.Mesh(geometry, material);
			element.position.x = (((i % howManyElementsInRow) * (width + gap)) - offSet);
			element.position.y = (Math.floor(i / Math.pow(howManyElementsInRow, 2)) * (width + gap)) - offSet;
			element.position.z = ((Math.floor(i / howManyElementsInRow) % howManyElementsInRow) * (width + gap)) - offSet;
			element.positionClone = element.position.clone();
			element.receiveShadow = true;
			element.castShadow = true;
			elementsContainer.add(element);
			elements.push(element);

			addToDepthArray(element.position.x);

			// console.log('Main.js', 'element.position.x', element.position.x, 'element.position.y', element.position.y, 'element.position.z', element.position.z);

		}
	}

	function initAnimation() {
		/**
		 * Start after a delay
		 */

		var delay = 750;

		setTimeout(getGroups, delay);
		setInterval(getGroups, intervalDur + delay);
	}

	function getAxis() {
		var axis = axisArray[axisArrayIndex];
		return axis;
	}

	function incAxisIndex() {
		axisArrayIndex = (axisArrayIndex + 1) % axisArray.length;
	}

	function getGroups() {
		var delay = 300;

		for (var i = 0; i < depthArray.length; i++) {
			setTimeout(getGroup, delay * i);
		}
	}

	function getGroup() {

		var axis = getAxis();

		var depthToGrab = depthArray[depthArrayIndex];

		if (depthArrayIndex + 1 >= depthArray.length) {
			incAxisIndex();
		}

		depthArrayIndex = (depthArrayIndex + 1) % depthArray.length;

		var subElements = [];
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			if (Math.round(element.position[axis]) == depthToGrab) {
				subElements.push(element);
			}
		}

		processSubElements(subElements, axis);
	}

	function processSubElements(array, axis) {
		// for (var i = 0; i < 1; i++) {
		for (var i = 0; i < array.length; i++) {
			var element = array[i];

			var dims = getDistanceAndAngleForAxis(element, axis);

			var callback = getBakedAnimation(element, dims.angle, dims.distance, axis);

			callback();

			// console.log('Main.js', 'distance', i, distance, angle);
		}
	}

	function getDistanceAndAngleForAxis(element, axis) {
		var distance;
		var angle;

		switch (axis) {
			case 'x':
				distance = Dog.Utils.distance({
					x: 0,
					y: 0
				}, {
					x: element.position.z,
					y: element.position.y
				});
				angle = Dog.Utils.angleBetweenPointsInRad({
					x: 0,
					y: 0
				}, {
					x: element.position.z,
					y: element.position.y
				})
				break;

			case 'y':
				distance = Dog.Utils.distance({
					x: 0,
					y: 0
				}, {
					x: element.position.x,
					y: element.position.z
				});
				angle = Dog.Utils.angleBetweenPointsInRad({
					x: 0,
					y: 0
				}, {
					x: element.position.x,
					y: element.position.z
				})
				break;

			case 'z':
				distance = Dog.Utils.distance({
					x: 0,
					y: 0
				}, {
					x: element.position.x,
					y: element.position.y
				});
				angle = Dog.Utils.angleBetweenPointsInRad({
					x: 0,
					y: 0
				}, {
					x: element.position.x,
					y: element.position.y
				})
				break;

		}

		return {
			distance: distance,
			angle: angle
		};

	}

	function getBakedAnimation(element, angle, distance, axis) {

		var callback = function() {

			var dummy = {
				stub: 0
			};

			TweenLite.to(dummy, animDur, {
				stub: 1,
				onUpdate: function() {
					switch (axis) {
						case 'x':
							element.position.z = Math.cos(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;
							element.position.y = Math.sin(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;

							break;
						case 'y':
							element.position.x = Math.cos(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;
							element.position.z = Math.sin(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;

							break;
						case 'z':
							element.position.y = Math.cos(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;
							element.position.x = Math.sin(Dog.Utils.map(dummy.stub, 0, 1, angle, (angle + (Math.PI / 2)))) * distance;
							break;

					}

					element.rotation[axis] = Dog.Utils.map(dummy.stub, 0, 1, 0, -(Math.PI / 2));
				},
				onComplete: function() {
					/**
					 * Reset to rotation at the end or weird stuff happens
					 */

					element.rotation.x = 0;
					element.rotation.y = 0;
					element.rotation.z = 0;
				},
				delay: 0,
				ease: Back.easeOut,
			})
		}

		return callback;
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

		elementsContainer.rotation.y -= 0.005;

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
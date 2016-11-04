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
	var rods = [];
	var rodsContainer;

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
		addRods();

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
		spotLight1.position.set(Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500));
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 2000;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 1;
		spotLight1.shadow.camera.far = 1200;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;
		spotLight1.shadow.camera.visible = true;

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
		scene.add(new THREE.AmbientLight(0x333333));
	}

	function addRods() {
		rodsContainer = new THREE.Object3D();
		scene.add(rodsContainer);

		var width = 20;
		var gap = 6;
		var howManyInRow = 16;
		var howMany = howManyInRow * howManyInRow;
		var geometry = new THREE.BoxBufferGeometry(width, width, width);
		var material = new THREE.MeshPhongMaterial({
			color: 0x2194ce,
			shading: THREE.FlatShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 60,
			// side: THREE.DoubleSide,
			// transparent: true,
			// opacity: 0.9,
		});

		var offSet = ((width * howManyInRow) + (gap * (howManyInRow - 1))) / 2;

		for (var i = 0; i < howMany; i++) {
			var rod = new THREE.Mesh(geometry, material);
			rod.position.x = (((i % howManyInRow) * (width + gap)) - offSet);
			// rod.position.y += Dog.Utils.randomRange(0, 50);
			rod.position.z = (Math.floor(i / howManyInRow) * (width + gap)) - offSet;
			rod.receiveShadow = true;
			rod.castShadow = true;
			rodsContainer.add(rod);
			rods.push(rod);
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
		floor.position.y = 0;
		scene.add(floor);
	}

	function animateRods() {
		for (var i = 0; i < rods.length; i++) {
			var rod = rods[i];
			rod.position.y = (maxUndulation + 20) + ((Math.sin(Dog.Utils.degToRad((rod.position.x) + animOffset))) * (maxUndulation / 2)) + ((Math.sin(Dog.Utils.degToRad((rod.position.z) + animOffset))) * (maxUndulation / 2));
		}

		animOffset = (animOffset < 360) ? animOffset += animationSpeed : 0;
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		rodsContainer.rotation.y += 0.005;
		animateRods();

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
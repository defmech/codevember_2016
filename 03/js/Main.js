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
	var groundMirror;
	var maxUndulation = 50;

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = Dog.Utils.randomRange(-300, -500);
		camera.position.y = Dog.Utils.randomRange(200, 400);
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
		addSphere();
		addHeroObject();

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

		var shadowSize = 1000;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = 1024 * 2;
		spotLight1.shadow.mapSize.height = 1024 * 2;
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

		// scene.add(spotLight2);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight2));

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x333333));
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
		floor.position.y = -25;
		scene.add(floor);
	}

	function addSphere() {
		var geometry = new THREE.SphereBufferGeometry(16, 32, 32);
		var material = new THREE.MeshPhongMaterial({
			color: 0x62A81B,
			emissive: 0x111111,
			specular: 0x333333,
			shininess: 30,
		});
		sphere = new THREE.Mesh(geometry, material);
		sphere.position.y = 64;
		sphere.receiveShadow = true;
		sphere.castShadow = true;
		scene.add(sphere);
	}

	function addHeroObject() {
		// create a cube and add it to scene
		var geometry = new THREE.BoxGeometry(300, 100, 300, 60, 1, 60);

		var material = new THREE.MeshPhongMaterial({
			color: 0x2194ce,
			shading: THREE.FlatShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 30,
		});

		hero = new THREE.Mesh(geometry, material);

		hero.receiveShadow = true;
		hero.castShadow = true;

		hero.geometry.verticesCloned = [];

		for (var i = 0; i < hero.geometry.vertices.length; i++) {
			var vert = hero.geometry.vertices[i];

			// Store indexes of those verts where y > 0
			if (vert.y > 0) {
				topVertIndexes.push(i);
			}

			hero.geometry.verticesCloned[i] = vert.clone();
		}

		// Add mesh to scene
		scene.add(hero);
	}

	function animateHeroFaces() {


		for (var i = 0; i < topVertIndexes.length; i++) {
			var index = topVertIndexes[i];

			var vert = hero.geometry.vertices[index];
			var vertClone = hero.geometry.verticesCloned[index];

			// vert.y = vertClone.y + ((Math.sin(Dog.Utils.degToRad((vertClone.z) + animOffset))) * (maxUndulation / 1));
			vert.y = vertClone.y + ((Math.sin(Dog.Utils.degToRad((vertClone.x) + animOffset))) * (maxUndulation / 2)) + ((Math.sin(Dog.Utils.degToRad((vertClone.z) + animOffset))) * (maxUndulation / 2));

		}

		animOffset = (animOffset < 360) ? animOffset += animationSpeed : 0;

		hero.geometry.computeFaceNormals();
		hero.geometry.verticesNeedUpdate = true;
		hero.geometry.normalsNeedUpdate = true;
	}

	function animateSphere() {
		sphere.position.y = 64 + ((Math.sin(Dog.Utils.degToRad((sphere.position.x) + animOffset))) * (maxUndulation / 2)) + ((Math.sin(Dog.Utils.degToRad((sphere.position.z) + animOffset))) * (maxUndulation / 2));
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateHeroFaces();
		animateSphere();

		hero.rotation.y += 0.005;

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
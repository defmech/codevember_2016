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
	var topVertIndexes = [];
	var botVertIndexes = [];
	var animationSpeed = 2;
	var animOffset = 0;
	var groundMirror;

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = Dog.Utils.randomRange(300, 500);
		camera.position.y = Dog.Utils.randomRange(100, 300);
		camera.position.z = Dog.Utils.randomRange(-300, -500);

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

		var shadowSize = 1000;

		// Add a light
		var spotLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
		spotLight1.position.set(Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(300, 500));
		spotLight1.target.position.set(0, 0, 0);

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

		var spotLight2 = new THREE.DirectionalLight(0xffffff, 0.125);
		spotLight2.position.set(Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(300, 500), Dog.Utils.randomRange(-300, -500));
		spotLight2.target.position.set(0, 0, 0);

		

		scene.add(spotLight2);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight2));

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x111111));
	}

	function addFloor() {
		var floorMaterial = new THREE.MeshPhongMaterial({
			color: 0x666666,
			shading: THREE.FlatShading,
			emissive: 0x000000,
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

	function addHeroObject() {
		// create a cube and add it to scene
		var geometry = new THREE.BoxGeometry(260, 60, 80, 8, 1, 1);

		var material = new THREE.MeshPhongMaterial({
			color: 0xF2A639,
			shading: THREE.FlatShading,
			emissive: 0x000000,
			specular: 0xcccccc,
			shininess: 100,
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
			else {
				botVertIndexes.push(i);
			}
		}

		for (var i = 0; i < topVertIndexes.length; i++) {

			var position = function(vert, val) {
				vert.y += val;
			}

			var val = Dog.Utils.randomRange(0, 10);

			position(hero.geometry.vertices[topVertIndexes[i]], val);
		}

		for (var i = 0; i < botVertIndexes.length; i += 2) {


			var position = function(vert, val) {
				if (vert.z > 0) {
					vert.z += val;
				}
				else {
					vert.z -= val;
				}
			}

			var val = Dog.Utils.randomRange(20, 40);

			position(hero.geometry.vertices[botVertIndexes[i]], val);
			position(hero.geometry.vertices[botVertIndexes[i + 1]], val);

		}

		for (var i = 0; i < hero.geometry.vertices.length; i++) {
			var vert = hero.geometry.vertices[i];
			// Store vert as backup
			hero.geometry.verticesCloned[i] = vert.clone();
		}

		// Add mesh to scene
		scene.add(hero);
	}

	function animateHeroFaces() {

		var maxUndulation = 20;

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

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateHeroFaces();

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
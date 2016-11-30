var Dog = Dog || {};

Dog.Main = (function() {
	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// texture vars
	var textureMapLoader, textureMap;

	// Should scene show helpers
	var USE_HELPERS = false;

	// Objects
	var hero, heroWireframe;
	var sphere;
	var topVertIndexes = [];
	var animationSpeed = 2;
	var animOffset = 0;
	var slices = [];
	var elementsContainer;
	var maxUndulation = 50;
	var normals;

	var ORIGIN = {
		x: 0,
		y: 0
	}

	var spotLight1;

	function setup() {

		textureMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = -400;
		camera.position.y = 400;
		camera.position.z = 400;

		// console.log('Main.js', camera.position);

		camera.lookAt(0, 0, 0);

		// init renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		renderer.shadowMap.enabled = true;
		// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(500));

		// add container
		elementsContainer = new THREE.Object3D();
		scene.add(elementsContainer);

		textureMapLoader.load('./img/saltire.png', function(texture) {
			textureMap = texture;
			init();
		});
	}

	function init() {

		// add content
		addLighting();
		addFloor();
		addHero();

		// init keyboard listener
		initKeyboard();

		// render
		render();
	}

	function animateElements() {

		var offset = 0.07;

		for (var i = 0; i < hero.geometry.vertices.length; i++) {

			var vert = hero.geometry.vertices[i];
			var vertClone = hero.geometry.verticesCloned[i];

			vert.z = vertClone.z + (Math.sin(Dog.Utils.degToRad(animOffset + vertClone.x)) * (maxUndulation / 2)) + (Math.sin(Dog.Utils.degToRad(animOffset + vertClone.y)) * (maxUndulation / 4));

		}

		hero.geometry.computeFaceNormals();
		hero.geometry.verticesNeedUpdate = true;
		hero.geometry.normalsNeedUpdate = true;
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
		// spotLight1.position.set(0, 400, 0);
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 2000;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 1;
		spotLight1.shadow.camera.far = 2000;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;

		if (USE_HELPERS) scene.add(new THREE.CameraHelper(spotLight1.shadow.camera));

		scene.add(spotLight1);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight1));

		// add another spotlight
		var spotLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.25);
		spotLight2.position.set(Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500));
		spotLight2.target.position.set(0, 0, 0);

		scene.add(spotLight2);

		// helper
		if (USE_HELPERS) scene.add(new THREE.DirectionalLightHelper(spotLight2));

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x555555));
	}

	function addHero() {

		if (hero) elementsContainer.remove(hero);

		var solidMaterial = new THREE.MeshPhongMaterial({
			// color: 0x156289,
			// color: 0x2498D1,
			emissive: 0x000000,
			specular: 0x555555,
			shininess: 10,
			side: THREE.DoubleSide,
			shading: THREE.FlatShading,
			// shading: THREE.SmoothShading,
			map: textureMap,
		});

		// var geometry = new THREE.PlaneGeometry(500, 300, 32, 24);
		var geometry = new THREE.BoxGeometry(500, 300, 1, 32*2, 24*2, 1);

		// move verts about randomly

		hero = new THREE.Mesh(geometry, solidMaterial);
		hero.castShadow = true;
		hero.receiveShadow = true;

		hero.geometry.verticesCloned = [];

		for (var i = 0; i < hero.geometry.vertices.length; i++) {
			var vert = hero.geometry.vertices[i];
			hero.geometry.verticesCloned[i] = vert.clone();
		}

		// normals = new THREE.FaceNormalsHelper(hero, 70, 0xFBBC03, 1);
		// elementsContainer.add(normals);

		elementsContainer.add(hero);
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
		floor.position.y = -340;
		scene.add(floor);
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateElements();
		// elementsContainer.rotation.y -= 0.005;

		animOffset = (animOffset < 360) ? animOffset += animationSpeed : animationSpeed;


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
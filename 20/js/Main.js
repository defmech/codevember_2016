var Dog = Dog || {};

Dog.Main = (function() {
	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// Should scene show helpers
	var USE_HELPERS = false;

	// Objects
	var hero;
	var sphere;
	var elements = [];
	var elementsContainer;

	var ORIGIN = {
		x: 0,
		y: 0
	}

	var SCALE_MIN = 0.2;

	var Y_MIN = -200;
	var Y_MAX = 200;

	function setup() {

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 400;

		// console.log('Main.js', camera.position);

		camera.lookAt(0, 0, 0)

		// init renderer
		renderer = new THREE.CSS3DRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;

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
		addElements();

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

			var speed = Dog.Utils.map(element.scale.x, SCALE_MIN, 1, Math.PI / 25, Math.PI / 300);

			var elementAngle = (elementAngle + speed) % (Math.PI * 2);

			var maxCirc = 2 * (Math.PI * 2) * elementRadius;

			var elementCirc = 2 * elementAngle * elementRadius;

			element.position.x = Math.cos(elementAngle) * elementRadius;
			element.position.z = Math.sin(elementAngle) * elementRadius;

			// console.log('Main.js', 'speed', speed, 'element.scale.x', element.scale.x);


		}
	}

	function onWindowResize() {
		// Update camera and renderer
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	function addElements() {

		var howMany = 230;

		for (var i = 0; i < howMany; i++) {

			var domElement = document.createElement('div');
			domElement.innerText = '🎾';
			domElement.className += 'ball';


			var element = new THREE.CSS3DSprite(domElement);

			var angleInsideDonut = Dog.Utils.randomRange(0, Math.PI * 2);

			var newY = Dog.Utils.randomRange(Y_MIN, Y_MAX);
			var donutRadius = Dog.Utils.map(newY, Y_MIN, Y_MAX, 80, 140);
			var donutRadius = (Y_MAX - Y_MIN) / 2;

			element.index = i;

			var phi = Math.acos(-1 + (2 * i) / howMany);
			var theta = Math.sqrt(howMany * Math.PI) * phi;

			element.position.x = 140 * Math.cos(theta) * Math.sin(phi);
			element.position.y = 140 * Math.sin(theta) * Math.sin(phi);
			element.position.z = 140 * Math.cos(phi);

			element.scaleClone = element.scale.clone();

			element.positionClone = element.position.clone();

			scene.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elements.push(element);
		}

		/**
		 * Add trophy 🏆
		 */

		var elementTrophy = document.createElement('div');
		elementTrophy.innerText = '🏆';
		elementTrophy.className += 'trophy';

		var spriteTrophy = new THREE.CSS3DSprite(elementTrophy);
		spriteTrophy.position.y = -20;
		scene.add(spriteTrophy);

	}


	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateElements();
		// elementsContainer.rotation.y -= 0.01;

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
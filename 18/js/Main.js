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

	var spotLight1;

	var MAX_VERTICAL_AMPLITUDE = 5;

	var Y_MIN = -200;
	var Y_MAX = 200;

	function setup() {

		// init scene
		scene = new THREE.Scene();

		
		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = -400;
		camera.position.y = 440;
		camera.position.z = 100;

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

			var bob = Dog.Utils.map(elementCirc, 0, maxCirc, 0, Math.PI * 6);

			element.position.y = element.positionClone.y + (Math.sin(bob) * MAX_VERTICAL_AMPLITUDE);

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

		var emojis = ['😀', '😬', '😂', '😄', '😅', '😇', '☺️', '😋', '😘', '😚', '😜', '🤑', '😎', '🤗', '😳', '🙄', '😤', '😱', '😨', '😰', '😥', '🤒', '😭', '💩'];


		var howMany = 250; // 250

		var innerRadiusMax = 15;

		for (var i = 0; i < howMany; i++) {

			var domElement = document.createElement('div');
			domElement.innerText = emojis[Dog.Utils.randomInt(0, emojis.length - 1)];
			domElement.className += 'smiley';


			var element = new THREE.CSS3DSprite(domElement);

			var angleInsideDonut = Dog.Utils.randomRange(0, Math.PI * 2);

			var newY = Dog.Utils.randomRange(Y_MIN, Y_MAX);
			var donutRadius = Dog.Utils.map(newY, Y_MIN, Y_MAX, 80, 140);

			element.index = i;
			element.position.x = Math.cos(angleInsideDonut) * donutRadius;
			element.position.y = newY;
			element.position.z = Math.sin(angleInsideDonut) * donutRadius;

			element.rotation.y = -angleInsideDonut;

			// Move on local axis
			var angleInner = Dog.Utils.randomRange(0, Math.PI * 2);

			var innerRadius = Dog.Utils.randomRange(0, innerRadiusMax);

			element.translateX(Math.cos(angleInner) * innerRadius);
			element.translateY(Math.sin(angleInner) * innerRadius);

			element.scale.x = element.scale.y = element.scale.z = Dog.Utils.randomRange(SCALE_MIN, 1);

			element.scaleClone = element.scale.clone();

			element.positionClone = element.position.clone();

			scene.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elements.push(element);
		}

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
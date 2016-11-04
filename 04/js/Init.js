if (Dog.WebGLDetect.canProceed)
{
	// If WebGL is available to use then we load our libraries.
	LazyLoad.js(
		[
			"//cdnjs.cloudflare.com/ajax/libs/three.js/r82/three.min.js",
			"./js/vendor/OrbitControls.js",
			// "./js/Mirror.js",
			"./js/Utils.js",
			"./js/Main.js"
		],
		function()
		{
			Dog.Main.init();
		});
}
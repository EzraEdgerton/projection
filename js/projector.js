'use strict'

var camera, scene, raycaster, renderer, controls;
var ortho_camera;
var ortho_controls;
var ortho_scene;
	var mx, my;
	var graph_data;
	var tooltip;
	var mouse; 
	var spheres, group, lineGroup;
	var colors;
	var bargraph;
	var width, height;

	var hh = 56
	var rhh = 73
	var lhh = 33
	var font = undefined

	var textGeo;
	var textMesh1;
	var textmaterials = new THREE.MeshBasicMaterial({color: 0x000000, fog: true});
	var data
	var holder;
	var cloud
 
	var topicRef
	var legendSvg

	var pscale = 500

	var ldaModels = [new Object(), new Object()]
	//var dt
	//var docs
	var sphere
	var mouseSelect
	var mouseLabel
	var labelobj = new THREE.Object3D()
	var INTERSECTED;
	var labelobj = new THREE.Object3D()
	var mouseLabel
	var prevZoom = 1
var intersects
var sims;
var simsSpheres;
var simsLabels;
var wordtopicscount = 50;

var highlightSpheres
var searchLabels
var searchSpheres


	height = window.innerHeight - hh;

	width = window.innerWidth * .5


	var textGroup = new THREE.Group();


async function wrapper(){


		


		async function init(){

		makeLegendSvg()
		d3.select('#doc-table-div').style("height", (height - lhh) / 2)
		d3.select('#single-doc-div').style("height", (height - lhh)/ 2)
			//var colors = d3.scaleOrdinal(d3.schemeBlues[9]);

			mouse = new THREE.Vector2();
			raycaster = new THREE.Raycaster();
			raycaster.params = {
				Mesh: {},
				Line: {},
				LOD: {},
				Points: { threshold: 7 },
				Sprite: {}
			};


			renderer = new THREE.WebGLRenderer({antialias:true});
			renderer.autoClear = false; 
			renderer.setSize( width, height );
			holder = document.getElementById("holder")
			holder.appendChild( renderer.domElement );

			scene = new THREE.Scene();
			ortho_scene = new THREE.Scene();


			//camera = new THREE.PerspectiveCamera( 75, width/height, 1, 5000 );
			//ortho_camera = new THREE.PerspectiveCamera( 75, width/height, 1, 5000 );
			camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 5000 );
			ortho_camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 5000 );
			scene.background = new THREE.Color( 0xFFFFFF );
			controls = new THREE.OrbitControls( camera, holder );
			ortho_controls = new THREE.OrbitControls( ortho_camera, holder );

			controls.maxDistance = 5000
			controls.minDistance = 3
			controls.enablePan = false
			camera.position.set(30, 30, 1000)
			ortho_controls.maxDistance = 5000
			ortho_controls.minDistance = 3
			ortho_controls.enablePan = false
			ortho_camera.position.set(30, 30, 1000);
			controls.update();
			ortho_controls.update();
			

			holder.addEventListener( 'mousemove', onDocumentMouseMove, false );

			//holder.addEventListener('mousedown', onDocumentClick, false);

			topicRef = {}
			for(var j = 0; j < 25; j++){
				topicRef[j] = []
			}

			data = await d3.json(file)



			function makecircles(f){

			var geom = new THREE.Geometry();
			var tgeom = new THREE.Geometry();
			/*var tmax = d3.max(Object.keys(data), function(d){
					return data[d].in_topics.length;
				})*/
			var material = new THREE.PointsMaterial({size: 5, opacity: .3, color: 0xFFFFFF, sizeAttenuation: false, vertexColors: THREE.VertexColors, transparent: true});
			/*var colors = d3.scaleSequential()
				.domain([-(tmax /2), tmax ])
				.interpolator(d3.interpolateOranges);*/

			//makeLegendInside(colors)


			var xd = d3.extent(Object.keys(data), function(d){
				return data[d].proj[0]
			})
			var yd =  d3.extent(Object.keys(data), function(d){
				return data[d].proj[1]
			})
			var zd =  d3.extent(Object.keys(data), function(d){
				return data[d].proj[2]
			})

			makeaxes(xd,yd,zd, pscale);
			let index = 0
			for (var key in data){

				var particle = new THREE.Vector3(data[key].proj[0] * pscale, data[key].proj[1] * pscale, data[key].proj[2] * pscale);
				particle.UserData = data[key]
				particle.UserData.index = index
				index++
				particle.name = key

					var color = new THREE.Color(0xAAAAAA);
					geom.vertices.push(particle)
					geom.colors.push(color);
				
				data[key] = particle		
			}

			cloud = new THREE.Points(geom, material);
			cloud.sortParticles = true;
			scene.add(cloud);
			};//makecircles
			makecircles()
			var mouseMat = new THREE.MeshBasicMaterial({color: 0x0000FF})
			var mouseGeo = new THREE.SphereBufferGeometry( 3, 16, 16);
			 sphere = new THREE.Mesh(mouseGeo, mouseMat);
			ortho_scene.add(sphere);
			ortho_scene.add(labelobj)

			render_search();


    		
    		if (params.topic != undefined){
    			selectTopic(params.topic)
    		}
    		window.addEventListener( 'resize', onWindowResize, false );



		};//init
		
		function render() {
		  requestAnimationFrame( render );
			

		raycaster.setFromCamera( mouse, camera );

		var objsToIntersect = [cloud]
		if (ldaModels[0].points){
			objsToIntersect.push(ldaModels[0].points)
		}
		if (ldaModels[1].points){
			objsToIntersect.push(ldaModels[1].points)
		} 
		 intersects = raycaster.intersectObjects(objsToIntersect)

		if (intersects.length > 0){

			if (INTERSECTED != intersects[0]){
				if (INTERSECTED){
					labelobj.remove(mouseLabel)
					sphere.visible = false
				}
				
				INTERSECTED = intersects[0]
				sphere.position.set(INTERSECTED.point.x, INTERSECTED.point.y, INTERSECTED.point.z)
				sphere.scale.set((1.0 / camera.zoom), (1.0 / camera.zoom),(1.0 / camera.zoom))
				sphere.visible = true

				let i = INTERSECTED.index;
				if (cloud.visible == false){
					i = INTERSECTED.object.geometry.attributes.wordsIndex.array[i]
				}				
				var labelString = cloud.geometry.vertices[i].name
				mouseLabel = makeTextSprite(labelString)
				 mouseLabel.position.set(INTERSECTED.point.x, INTERSECTED.point.y, INTERSECTED.point.z)

				labelobj.add(mouseLabel)
			}
		}
		else{
			labelobj.remove(mouseLabel)
			sphere.visible = false
			INTERSECTED = null;
		}
			//console.log(camera)
			if (mouseLabel){

			var labelscale = 1.0 / camera.zoom
			var labelscalex = mouseLabel.scale.x * labelscale
			var labelscaley = mouseLabel.scale.y * labelscale
			mouseLabel.scale.set(labelscalex, labelscaley, 1.0)
		}

		var dobj0 = new THREE.Object3D(); 
		var dobj1 = new THREE.Object3D(); 
		if (ldaModels[0].topic != undefined){
			 dobj0 = ldaModels[0].topic.labels; 
		}
		if (ldaModels[1].topic != undefined){
			 dobj1 = ldaModels[1].topic.labels; 
		}
		if (Math.abs(ortho_camera.zoom - prevZoom) > .1){
			var ocscale = 1 / camera.zoom
			if (ortho_camera.zoom < 8 && ortho_camera.zoom > 1){
			dobj0.children.forEach(function(d){
				var ocscalex = d.scale.x * (ocscale * prevZoom)
				var ocscaley = d.scale.y * (ocscale * prevZoom)
				d.scale.set(ocscalex, ocscaley, 1.0)

			});
			dobj1.children.forEach(function(d){
				var ocscalex = d.scale.x * (ocscale* prevZoom)
				var ocscaley = d.scale.y * (ocscale * prevZoom)
				d.scale.set(ocscalex, ocscaley, 1.0)
				
			});
			if (simsLabels != undefined){
				simsLabels.children.forEach(function(d){
				var ocscalex = d.scale.x * (ocscale* prevZoom)
				var ocscaley = d.scale.y * (ocscale * prevZoom)
				d.scale.set(ocscalex, ocscaley, 1.0)
			});
			}
			if (searchLabels != undefined){
				searchLabels.children.forEach(function(d){
				var ocscalex = d.scale.x * (ocscale* prevZoom)
				var ocscaley = d.scale.y * (ocscale * prevZoom)
				d.scale.set(ocscalex, ocscaley, 1.0)
			});
			}

		}
			raycaster.params = {
				Mesh: {},
				Line: {},
				LOD: {},
				Points: { threshold: (raycaster.params.Points.threshold * prevZoom) * ocscale },
				Sprite: {}
			};
			prevZoom = ortho_camera.zoom
		}
			camera.updateProjectionMatrix()
			controls.update()
			ortho_camera.updateProjectionMatrix()
			ortho_controls.update()
			renderer.clear();
			renderer.render(scene, camera);
			renderer.clearDepth();
			renderer.render( ortho_scene, ortho_camera );
			
		};//render

		var $loading = $('#loadingDiv').hide();
		$loading.show();
		await init();
		$loading.hide()


		render();

};//wrapper

wrapper()
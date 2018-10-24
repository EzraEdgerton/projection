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
	var dt
	var docs
	var sphere
	var mouseSelect
	var mouseLabel
	var labelobj = new THREE.Object3D()
	var INTERSECTED;
	var labelobj = new THREE.Object3D()
	var mouseLabel
	var prevZoom = 1

	height = window.innerHeight - hh;

	width = window.innerWidth * .5


	var textGroup = new THREE.Group();


	console.log(window.innerWidth)
async function wrapper(){


		var hidden = false
		d3.select("#isolate-button").on("click", function(){
			if(!hidden){
				cloud.visible = false;
				hidden = true;
			}
			else{
				cloud.visible = true;
				hidden = false;
			}
			
		})


		var topicDropdown = d3.select("#topic-dropdown")

		var topics = ["None"]
		for(var i = 0; i < 25; i++){
			topics.push(i)
		}


		var m1Dropdown = d3.select("#model1dd")

		m1Dropdown.selectAll("a")
			.data(Object.keys(ldafiles))
			.enter()
			.append("a")
			.attr("class", "dropdown-item")
			.text(function(d){
				return d
			}).on("click", function(d){
				//d3.select("#model1btn").text(d)
				console.log(0)
				console.log(d)
				getLdaModel(d, 0)
			})

		var m2Dropdown = d3.select('#model2dd')

		m2Dropdown.selectAll("a")
			.data(Object.keys(ldafiles))
			.enter()
			.append("a")
			.attr("class", "dropdown-item")
			.text(function(d){
				return d
			}).on("click", function(d){
				//d3.select("#model2btn").text(d)
				console.log(1)
				console.log(d)
				getLdaModel(d, 1)
				
				
			})



		async function getLdaModel(modelname, modelnum){
			var ldaData = await d3.json(ldafiles[modelname])
			ldaModels[modelnum]["data"] = ldaData
			console.log(ldaModels)
			ldaColorProjection(modelnum)
			renderTopicDiv(modelnum)
		}

		function ldaColorProjection(modelnum){
			if(ldaModels[modelnum]["points"] != undefined){
				scene.remove(ldaModels[modelnum]["points"])
				ldaModels[modelnum]["points"].dispose()
			}

			let newcolor = new THREE.Color(0xFF0000)
			if (modelnum == 0){
				newcolor = new THREE.Color(0x0000FF)			}
			
			console.log(ldaModels[modelnum])
			console.log(cloud)
			cloud.material.opacity = .1
			cloud.geometry.colorsNeedUpdate = true;
			var posarray = []
			var colorsarray = []
			ldaModels[modelnum]["data"].forEach(function(topic){
				topic.forEach(function(word){
					//console.log(data[word[0]])
					if (data[word[0]] != undefined){
						posarray.push(data[word[0]].UserData.proj[0] * pscale);
						posarray.push(data[word[0]].UserData.proj[1] * pscale);
						posarray.push(data[word[0]].UserData.proj[2] * pscale);
						colorsarray.push(newcolor)
					}
					
				})

			})
			var mgeom = new THREE.BufferGeometry()
			var alphas = new Float32Array( ldaModels[modelnum]["data"].length * ldaModels[modelnum]["data"][0].length  * 1 );
			var vertices = new Float32Array(posarray)

		var uniforms = {
        	color: { value: newcolor },
   		 };

		var shaderMaterial = new THREE.ShaderMaterial( {
		    uniforms:       uniforms,
		    vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		    transparent:    true
   		});

		var mmaterial = new THREE.PointsMaterial({size: 8, opacity: .5, sizeAttenuation: true, vertexColors: THREE.VertexColors, transparent: true});	
			mgeom.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
			mgeom.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
			//mgeom.addAttribute('color', new THREE.BufferAttribute(vcolors, 1));
			ldaModels[modelnum]["points"] = new THREE.Points(mgeom, shaderMaterial);
			console.log(ldaModels[modelnum]["points"])
			scene.add(ldaModels[modelnum]["points"]);

		}

		function renderTopicDiv(modelnum){
			console.log(ldaModels)
		}

		function renderDocumentTable(topic){
			console.log(topic)
			console.log(dt.p[topic + 1])
			d3.select("#topic-docs").remove()
			var docIndex 
			/*for (var x = dt.p[topic]; x < dt.p[topic + 1]; x++){
				docIndex = dt.i[dt.p[topic] + x]
				console.log(docs[docIndex])
				console.log(dt.x[dt.p[topic] + x])
			}*/
			//d3.select('#doc-table-div').style("height", (height - rhh) - 200)
			var dtable = d3.select("#doc-table-div")
				.append("table")
				.attr("class", "table tinytext")
				.attr("id", "topic-docs")
			
			

			var dth = dtable.append("thead")

			dth.append("tr")
				.selectAll("th")
				.data(Object.keys(docs[0]))
				.enter()
				.append("th")
				.text(function(d){
					//console.log(d)
					return d
				})
			var formatTime = d3.timeFormat("%m,%d,%Y")
			var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z ")

			//get sparse matrix form into more appropriate one. Probably should add this to dfr browser.
			var doctopictotal = 0
			var format_d = function(){
							let docindexes = dt.i.slice(dt.p[topic], dt.p[topic + 1])
							let scores = dt.x.slice(dt.p[topic], dt.p[topic + 1])
							let returnd = []
							for( var x = 0; x < docindexes.length; x++){
								doctopictotal = doctopictotal + scores[x];
								returnd.push({index : docindexes[x], score: scores[x]})
							}
							return returnd
						}

			var dtb = dtable.append("tbody")
			var drows = dtb.selectAll("tr")
						.data(format_d().sort(function(a,b){
							return b.score - a.score
						}))
						.enter()
						.append("tr")
						.attr("class", "document-row")
						.on("click", function(d){
							renderDocumentText(docs[d.index].id)
							console.log(d)
						})

			let dcells = drows.selectAll("td")
	              .data(function(row) {
	                return Object.keys(docs[0]).map(function (column2) {
	                	if (column2 == "thin"){
	                		return { column: column2, value: row.score}

	                	}
						return { column: column2, value: docs[row.index][column2]}
	                
	                
	                });
	              })
	              .enter()
	              .append('td')
	              .text(function(d){
	              	if (d.column == "thin"){
	              		return d3.format(",.3%")(d.value/doctopictotal)
	              		//d3.select(this).append("div").style("width", 141)
	              	}
	              	if (d.column == "date"){
	                 return formatTime(parseTime(d.value))
	              	}
	              	return d.value
	              })

		}//renderDocumentTable
		
		async function renderDocumentText(id){
			var docdiv = d3.select("#single-doc-div")
			docdiv.select("#doc-title").remove()
			docdiv.select("#doc-content").remove()
			var doc_response = await d3.json("/dfr_data/dna_response.json")
			d3.select("#single-doc-alert").style("display", "none")
			var doc_obj = doc_response.hits.hits[0]._source

			var docdiv = d3.select("#single-doc-div")
			var r= '<span style="color:green">here there</span>'
			docdiv.append("h6").attr("id", "doc-title").text(doc_obj.ArticleTitle)



			var docp = docdiv.append("p").attr("id", "doc-content")

			$('#doc-content').click( function(event){
				console.log(event.target.innerText)
			})

			docp.selectAll('span.words').data(doc_obj.AbstractText.split(' '))
				.enter()
				.append("span")
				.style("class", function(d){
					if (data[d.toLowerCase()] != undefined){
						return "words " + d
					}
					else{
						return "words"
					}
				})
				.style("background-color", function(d){
					if (data[d.toLowerCase()] != undefined){
						return "lightblue"
					}
					else{
						return
					}
				})
				.text(function(d){
					return d + " "
				})
			/*.forEach(function(d){
				console.log(data[d.toLowerCase()])
				if (data[d.toLowerCase()] != undefined){
					docdiv.append("p").attr("id", d).attr("class", "doc-word").text(d + " ")
				}
				docdiv.append("p").attr("id", d).attr("class", "doc-word").text(d + " ")
			})*/

		}


		function renderTopicTable(topic, tcolors){
			var table_width = (window.innerWidth * .25) - 35
			d3.select('#topic-table').style("height", height - rhh)

			d3.selectAll('.table').remove()
			d3.select("#doc-title").remove()
			d3.select("#doc-content").remove()
			d3.select("#single-doc-alert").style("display", "block")

			var table = d3.select('#topic-table')
						.append("table")
						.attr("class", "table tinytext")
						.attr("id", "topic-counts")
						.style("width", table_width)


		var th = table.append("thead")

		var headData = ["word", "score"]

 		th.append("tr")
	        .selectAll("th")
	        .data(headData)
	        .enter()
	        .append("th")
	          .text(function(d){
	            return d;
	          })
	          .on("click", function(d, i){
	             rows.sort(function(a, b) { 
	              return b[i] - a[i];
	               });
	          })
	          .style("cursor", "pointer")

		var tb = table.append("tbody")
		var mr = 0
		var mcircle;

			let rows = tb.selectAll("tr")
						.data(selectedTopic.sort(function(a,b){
							return b[1] - a[1]
						}))
						.enter()
						.append("tr")
						.style("background-color", function(d){
							//return tcolors(d[1])
						})
						.attr("class", "topicrow")
						.on("mouseover", function(d){
							selectedTCircleGroup.children.forEach(function(c){
								if (c.name == d[0]){
									 mcircle = c
									 mr = c.material.color.r
									c.material.color.r = 1
									c.scale.set(3, 3, 3)

								}
								
							})
						})
						.on("mouseout", function(d){
							mcircle.scale.set(1, 1, 1)
							mcircle.material.color.r = mr;
						})
			let cells = rows.selectAll("td")
	              .data(function(row) {
	                return headData.map(function (column2) {
	                  if(column2 == "word"){
						return { column: column2, value: row[0], score: row[1]}
	                  }
	                  else{
						return { column: column2, value: row[1], score: row[1]}
	                  }
	                  
	                });
	              })
	              .enter()
	              .append('td')
	              .style("border-top", function(d){
	              	return "3px solid " + tcolors(d.score)
	              })
	                .text(function(d){
	                 return d.value
	                })


		};
		let selectedTopic = []
		var dobj = new THREE.Object3D()
		var selectedTCircleGroup = new THREE.Group();
		//var circleMat = new THREE.MeshBasicMaterial({color: 0xFFA500, opacity: 1, transparent: true})
		var circleMat = new THREE.MeshBasicMaterial({color: 0x0066cc, opacity: 1, transparent: true})
		var circleGeo = new THREE.SphereBufferGeometry( 100, 16, 16);
		var selTc;
		function selectTopic(topic){


			//cloud.material.opacity = .1



			ortho_scene.remove(dobj)
			console.log(topic)
			d3.selectAll(".before-selection").style("display", "none")
			scene.remove(selectedTCircleGroup)


			selectedTopic = [];



			dobj = new THREE.Object3D();
			selectedTCircleGroup = new THREE.Group();
			var tmax = d3.max(topicRef[topic], function(d){ return d[1]})
			var selcolors = d3.scaleSequential()
				.domain([-(tmax / 2), tmax])
				.interpolator(d3.interpolateGreens);

			topicRef[topic].forEach(function(w){
				

						selectedTopic.push([w[0], w[1]])
						var circleColor =  new THREE.Color(selcolors(w[1]))
						//console.log(circleColor)
						var label = makeTextSprite(w[0], {zoom : ortho_camera.zoom});
						 circleGeo = new THREE.SphereBufferGeometry( 1, 16, 16);
						 circleMat = new THREE.MeshBasicMaterial({color:circleColor, opacity: .6, transparent: true})
						label.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
						selTc = new THREE.Mesh(circleGeo, circleMat)
						selTc.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
						selTc.name = w[0]
						selectedTCircleGroup.add(selTc)
						dobj.add(label)
				})
			console.log(dobj)
			ortho_scene.add(dobj)
			scene.add(selectedTCircleGroup)
			
			renderTopicTable(topic, selcolors)
			renderDocumentTable(topic)
		}//selectTopic




		topicDropdown
			.selectAll("a")
			.data(topics)
			.enter()
			.append("a")
			.attr("class", "dropdown-item")
			.text(function(d, i ){
				if( i > 0){
					return "Topic " + (d + 1)
				}
				return d
			}).on("click", function(d){
				if (d == "None"){
					ortho_scene.remove(dobj)
					scene.remove(selectedTCircleGroup)
					d3.selectAll('.table').remove()
					d3.selectAll(".before-selection").style("display", "block")
					d3.select("#single-doc-alert").style("display", "block")
					d3.select("#dropdownMenuButton").text("Select Topic")
					d3.select("#doc-title").remove()
					d3.select("#doc-content").remove()
				}
				else{
				selectTopic(d)
				d3.select("#dropdownMenuButton").text("Topic " + (d + 1))
				}
			})


		// This was written by Lee Stemkoski
// https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontface = parameters["fontface"] || "Helvetica";
	var fontsize = parameters["fontsize"] || 70;
	var canvas = document.createElement('canvas');
	var camerazoom = parameters["zoom"] || 1
	var context = canvas.getContext('2d');
	context.font = fontsize + "px " + fontface;

	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";
	context.strokeStyle = "rgba(255, 255, 255, 1.0)"
	context.lineWidth = 10
	context.strokeText(message, 0, fontsize)
	context.fillText( message, 0, fontsize);



	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas)
			texture.minFilter = THREE.LinearFilter;
			texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial({ map: texture,  fog: true});
	spriteMaterial.sizeAttenuation = false;
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set((100 * (1/ camerazoom)),(50 * (1/camerazoom)),1.0);
	return sprite;
};//makeTextSprite


		function changeColor(node){

		}

		function clickNode(node){

		}
		function mouseOverNode(node){

		}

		function makeLegendSvg(){
			
			legendSvg = d3.select("#holder")
							.append("div")
							.style("height", 50)
							.style("width", 200)
							.style("position", "absolute")
							.style("class","tinytext")
							.style("left", "20px")
							.style("top", "10px")
							.style("background-color", "lightgrey")



		}
		function makeLegendInside(colors){
			console.log(colors)

			legendSvg.append("div").style("height", 20)
							.style("width", 20)
							.style("display", "inline-block")
							.style("left", "20px")
							.style("background-color", colors(0))


			legendSvg.append("div")
							.style("display", "inline-block")
							//.style("left", "20px")
							.append("p").text("less  ")
							//.style("background-color", colors(0))

			//legendSvg.append("p").style("display", "inline-block").text("Less frequent")
			legendSvg.append("div").style("height", 20)
							.style("width", 20)
							.style("display", "inline-block")
							.style("left", "60px")
							.style("background-color", colors(25))

			legendSvg.append("div")
					.style("display", "inline-block")
					//.style("left", "20px")
					.append("p").text("more")
			//legendSvg.append("p").style("display", "inline-block").text("More frequent")
		}
	
	

		function makeaxes(xd, yd, zd, p){
			var xlineMaterial = new THREE.LineBasicMaterial( { color: 0x0000FF} );
			var ylineMaterial = new THREE.LineBasicMaterial( { color: 0x00FF00} );
			var zlineMaterial = new THREE.LineBasicMaterial( { color: 0xFF0000} );
			var xGeometry = new THREE.Geometry();
			var yGeometry = new THREE.Geometry();
			var zGeometry = new THREE.Geometry();

			xGeometry.vertices.push(new THREE.Vector3(xd[0] * p, 0, 0))
			xGeometry.vertices.push(new THREE.Vector3(xd[1] * p, 0, 0))
			yGeometry.vertices.push(new THREE.Vector3(0, yd[0] * p, 0))
			yGeometry.vertices.push(new THREE.Vector3(0, yd[1] * p, 0))

			zGeometry.vertices.push(new THREE.Vector3(0, 0, zd[0] * p))
			zGeometry.vertices.push(new THREE.Vector3(0, 0, zd[1] * p))

			var xline = new THREE.Line( xGeometry, xlineMaterial );
			var yline = new THREE.Line( yGeometry, ylineMaterial)
			var zline = new THREE.Line( zGeometry, zlineMaterial)
			scene.add(xline);
			scene.add(yline);
			scene.add(zline);
		};//makeaxes

		function onDocumentMouseMove( event ) {

			event.preventDefault();
			let altx = event.clientX - (window.innerWidth * .25) - 15
			let alty = event.clientY - hh

			mouse.x = ( (altx / width  ) * 2 - 1) ;
			mouse.y = - ( alty / height ) * 2 + 1;
		
			
		};//onDocumentMouseMove
		var selectednode;
		function onDocumentClick( event) {
			var d = "nothing"
		}//onDocumentClick;

		function onWindowResize() {
				height = window.innerHeight - hh;

				width = window.innerWidth * .5

				camera.left = width / - 2
				camera.right = width / 2
				camera.top = height / 2
				camera.bottom = height / - 2

				ortho_camera.left = width / - 2
				ortho_camera.right = width / 2
				ortho_camera.top = height / 2
				ortho_camera.bottom = height / - 2
				camera.updateProjectionMatrix();
				ortho_camera.updateProjectionMatrix();
				renderer.setSize( width, height );
			}
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

			holder.addEventListener('mousedown', onDocumentClick, false);

			holder.addEventListener('mouseup', function(){

			})
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
			var material = new THREE.PointsMaterial({size: 5, opacity: .1, color: 0xFFFFFF, sizeAttenuation: false, vertexColors: THREE.VertexColors, transparent: true});
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

				/*data[key].in_topics.forEach(function(d){
					topicRef[d[0]].push([key, d[1]])
				})*/
				var particle = new THREE.Vector3(data[key].proj[0] * pscale, data[key].proj[1] * pscale, data[key].proj[2] * pscale);
				particle.UserData = data[key]
				particle.UserData.index = index
				index++
				particle.name = key
				/*if (data[key].in_topics.length > 1){
					//var color = new THREE.Color(data[key].in_topics.length  * 0x7F2F00)

					var color = new THREE.Color(colors(data[key].in_topics.length ))
					tgeom.vertices.push(particle)
					tgeom.colors.push(color);
				}*/
				//else{
					var color = new THREE.Color(0xAAAAAA);
					geom.vertices.push(particle)
					geom.colors.push(color);
				//}

				
				
				

				
				data[key] = particle		
				//console.log(data[key])
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

			$( "#tags" ).autocomplete({
      			source: Object.keys(data)
    		});

    		dt = await d3.json("/dfr_data/ecuador_dfr_dt.json")
    		docs = await d3.csv("/dfr_data/ecuador_dfr_meta.csv")

    		console.log(dt)

    		if (params.topic != undefined){
    			selectTopic(params.topic)
    		}
    		window.addEventListener( 'resize', onWindowResize, false );



		};//init
		
		function render() {
		  requestAnimationFrame( render );
			

		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects([cloud])

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
				let intopics = ""
				 /*INTERSECTED.object.geometry.vertices[i].UserData.in_topics.forEach(function(d){
				 	intopics = intopics + (d[0] + 1) + ", "
				 })*/
				var labelString = INTERSECTED.object.geometry.vertices[i].name +" " + intopics
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
		if (Math.abs(ortho_camera.zoom - prevZoom) > .3){
			var ocscale = 1.0 / camera.zoom
			if (ortho_camera.zoom < 2 || ortho_camera.zoom > .5){
			dobj.children.forEach(function(d){
				var ocscalex = d.scale.x * (labelscale * prevZoom)
				var ocscaley = d.scale.y * (labelscale * prevZoom)
				d.scale.set(ocscalex, ocscaley, 1.0)
			});
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
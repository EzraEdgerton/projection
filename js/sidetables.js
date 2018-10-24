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
			if (modelname == "None"){
				noneSelected(modelnum);
				noneTopicSelected(modelnum);
				return;
			}
			var ldaData = await d3.json(ldafiles[modelname] + "tw.json")
			ldaModels[modelnum]["data"] = ldaData.tw;
			console.log(ldaModels)
			ldaColorProjection(modelnum)
			renderTopicDiv(modelnum , modelname)

			ldaModels[modelnum]["dt"] = await d3.json(ldafiles[modelname] + "dt.json")
			ldaModels[modelnum]["docs"] = await d3.csv(ldafiles[modelname] + "meta.csv")



		}

		function noneTopicSelected(modelnum){
			d3.select("#topicalert" + modelnum).classed("hidden", false)
					d3.select("#model" + modelnum + "dropdown").text("Select Topic") 
					d3.select("#topic-table" + modelnum).select("table").remove()

					if(ldaModels[modelnum].topic != undefined){
						scene.remove(ldaModels[modelnum].topic.circles)
						ortho_scene.remove(ldaModels[modelnum].topic.labels)
					}

		}
		function noneSelected(modelnum){
			if(ldaModels[modelnum]["points"] != undefined){
				scene.remove(ldaModels[modelnum]["points"])
			}
			d3.select('#model' + modelnum + 'alert')
				.classed("hidden", false)

			d3.select('#modelbox'+ modelnum)
				.classed("hidden", true)

		}
		function noneDocumentTable(modelnum){
			var docdiv = d3.select("#single-doc-div")
			docdiv.select("#doc-title").remove()
			docdiv.select("#doc-content").remove()
			d3.select('#doc-table-title').text("Explore Docs");
			d3.select("#topic-docs").remove()
			d3.select("#doc-table-alert").classed("hidden", false)
			d3.select("#single-doc-alert").classed("hidden", false)

		}

		function ldaColorProjection(modelnum){
			console.log(modelnum)
			if(ldaModels[modelnum]["points"] != undefined){
				scene.remove(ldaModels[modelnum]["points"])
				console.log(ldaModels)
			//	ldaModels[modelnum]["points"].dispose()
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
			var wordsIndex = []
			ldaModels[modelnum]["data"].forEach(function(topic){
				for (var i = 0; i < topic.words.length; i++){
					word = [topic.words[i], topic.weights[i]];

					if (data[word[0]] != undefined){
						posarray.push(data[word[0]].UserData.proj[0] * pscale);
						posarray.push(data[word[0]].UserData.proj[1] * pscale);
						posarray.push(data[word[0]].UserData.proj[2] * pscale);
						colorsarray.push(newcolor)
						wordsIndex.push(data[word[0]].UserData.index)
					}
				};

			})
			var mgeom = new THREE.BufferGeometry()
			//var alphas = new Float32Array( ldaModels[modelnum]["data"].length * ldaModels[modelnum]["data"][0].length  * 1 );
			var vertices = new Float32Array(posarray)
			var typedWordsIndexes = new Int32Array(wordsIndex)

		var uniforms = {
        	color: { value: newcolor },
   		 };

		var shaderMaterial = new THREE.ShaderMaterial( {
		    uniforms:       uniforms,
		    vertexShader:   document.getElementById( 'vertexshader' ).textContent,
		    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
		    transparent:    true
   		});
			mgeom.addAttribute("position", new THREE.BufferAttribute(vertices, 3));
			//mgeom.addAttribute( 'alpha', new THREE.BufferAttribute( alphas, 1 ) );
			mgeom.addAttribute("wordsIndex", new THREE.BufferAttribute(typedWordsIndexes, 1))
			//mgeom.addAttribute('color', new THREE.BufferAttribute(vcolors, 1));
			ldaModels[modelnum]["points"] = new THREE.Points(mgeom, shaderMaterial);
			scene.add(ldaModels[modelnum]["points"]);

		}

		function renderTopicDiv(modelnum, modelname){
			d3.select('#model' + modelnum + 'alert')
				.classed("hidden", true)

			d3.select('#modelbox'+ modelnum)
				.classed("hidden", false)

			d3.select('#modeltitle' + modelnum).text(modelname)

		var topicDropdown = d3.select("#topic-dropdown" + modelnum)

		var topics = ["None"]
		for(var i = 0; i < ldaModels[modelnum].data.length; i++){
			topics.push([i])
			var length = ldaModels[modelnum].data[i].length  < 5 ? ldaModels[modelnum].data[i].length : 5;   
			for( var  j = 0; j < 5; j++){
				topics[i + 1].push(ldaModels[modelnum].data[i].words[j])
			}
		}
		topicDropdown
			.selectAll("a")
			.data(topics)
			.enter()
			.append("a")
			.attr("class", "dropdown-item")
			.text(function(d, i ){
				if( i > 0){
					return d[0] + ") " + d[1] + " " + d[2] + " " + d[3] + " " + d[4] + " " + d[5]
				}
				return d
			})
			.on("click", function(d){
				if (d == "None"){
					noneTopicSelected(modelnum)
					noneDocumentTable(modelnum);

					return
				}
				var colorint = (modelnum == 0)? d3.interpolateGreens : d3.interpolateOranges
				var tmax = d3.max(ldaModels[modelnum].data[d[0]].weights, function(w){ return w})
				var selcolors = d3.scaleSequential()
				.domain([-(tmax / 2), tmax])
				.interpolator(colorint);

				renderTopicSpheres(d[0], selcolors, modelnum)
				renderTopicTable(d[0], selcolors, modelnum)
				renderDocumentTable(d[0], modelnum)
				d3.select("#model" + modelnum + "dropdown").text("Topic " + d[0]) 
			})
		}//renderTopicDiv

		function renderTopicSpheres(topicnum, selcolors, modelnum){
			if(ldaModels[modelnum].topic != undefined){
				scene.remove(ldaModels[modelnum].topic.circles);
				ortho_scene.remove(ldaModels[modelnum].topic.labels)
			}
			ldaModels[modelnum]["topic"] = {
				"circles": new THREE.Group(),
				"labels": new THREE.Object3D()
			};

			var wordscount = ldaModels[modelnum].data[topicnum].length < wordtopicscount ? ldaModels[modelnum].data[topicnum].length : wordtopicscount;
			for(var i = 0; i < wordscount; i++){
				var w = [ldaModels[modelnum].data[topicnum].words[i], ldaModels[modelnum].data[topicnum].weights[i]]
				var circleColor = new THREE.Color(selcolors(w[1]))
				var scalezoom = ortho_camera.zoom
				if(ortho_camera.zoom > 8){
					scalezoom = 8
				}
				if(ortho_camera.zoom < 1){
					scalezoom = 1
				}
				var label = makeTextSprite(w[0], {zoom : 1 / scalezoom });
				var circleGeo = new THREE.SphereBufferGeometry( 3, 16, 16);
				var circleMat = new THREE.MeshBasicMaterial({color:circleColor, opacity: .8, transparent: true})
				if( data[w[0]] != undefined){
				label.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
				var selTc = new THREE.Mesh(circleGeo, circleMat)
				selTc.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
				selTc.name = w[0]
				ldaModels[modelnum].topic.circles.add(selTc)
				ldaModels[modelnum].topic.labels.add(label)
				}
				else{
					console.log(w[0])
				}
			}


			ortho_scene.add(ldaModels[modelnum].topic.labels)
			scene.add(ldaModels[modelnum].topic.circles)
			console.log(scene)
			console.log(ortho_scene)
			
		}//renderTopicSpheres

		function renderDocumentTable(topic, modelnum){

			d3.select('#doc-table-alert').classed("hidden", true)
			d3.select('#doc-table-title').text(d3.select('#modeltitle' + modelnum).text() + " " + "Topic " + topic);

			var dt = ldaModels[modelnum].dt
			var docs = ldaModels[modelnum].docs
			console.log(topic)
			console.log(dt.p[topic + 1])
			d3.select("#topic-docs").remove()
			var docIndex 
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
						 .style("border-top", function(d){
						 	var color
						 	if (modelnum == 0){
						 		color="green"
						 	}
						 	if (modelnum == 1){
						 		color="orange"
						 	}

	              			return "2px solid " + color
	             		 })
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
			console.log(id)
			var doc_response = await d3.json("/dfr_data/dna_response.json")
			d3.select("#single-doc-alert").classed("hidden", true)
			var doc_obj = doc_response.hits.hits[0]._source

			var docdiv = d3.select("#single-doc-div")
			var r= '<span style="color:green">here there</span>'
			docdiv.append("h6").attr("id", "doc-title").text(doc_obj.ArticleTitle)



			var docp = docdiv.append("p").attr("id", "doc-content")

			$('#doc-content').click( function(event){
				var word = event.target.innerText.toLowerCase().trim();
				//console.log(data[event.target.innerText.toLowerCase().trim()])
				if (data[event.target.innerText.toLowerCase().trim()] != undefined){
						onDocumentClick(event, word);
					}
			})

			$('#doc-content').mouseover( function(event){
				console.log(event.clientX)
				console.log(event.clientY)
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


		function renderTopicTable(topic, tcolors, modelnum){

			d3.select('#topicalert' + modelnum).classed("hidden", true)
			var table_width = (window.innerWidth * .25) - 35
			d3.select('#topic-table' + modelnum).style("height", (height - rhh - 175)/2)

			//d3.selectAll('.table').remove()
			d3.select("#doc-title").remove()
			d3.select("#doc-content").remove()
			d3.select("#topic-table" + modelnum).select("table").remove()
			//d3.select("#doc-title").classed("hidden", true)
			//d3.select("#doc-content").classed("hidden", true)
			d3.select("#single-doc-alert").classed("hidden", false)


			var table = d3.select('#topic-table' + modelnum)
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
						.data(function(){

							var retData = []
							var wordscount = ldaModels[modelnum].data[topic].length < wordtopicscount ? ldaModels[modelnum].data[topicnum].length : wordtopicscount;
							for(var i = 0; i < wordscount; i++){
								var w = [ldaModels[modelnum].data[topic].words[i], ldaModels[modelnum].data[topic].weights[i]]
								retData.push(w)
							}
							retData.sort(function(a,b){
								console.log(a)
								return b[1] - a[1]
							})
							return retData;
						})
						.enter()
						.append("tr")
						.style("background-color", function(d){
							//return tcolors(d[1])
						})
						.attr("class", "topicrow")
						.on("click", function(d){
							console.log(d[0])
							console.log(event)
							onDocumentClick(event, d[0])
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



	
	
'use strict'
$(document).ready(function(){
  $("#options_div").hide();
  let toggle = false
    $("#options_nav").click(function(){
      if (toggle){
        $("#options_div").hide();
        toggle = false
      }
      else{
        $('#options_div').show();
        toggle = true
      }
        
    });
});

//from https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
function getJsonFromUrl(hashBased) {
  var query;
  if(hashBased) {
    var pos = location.href.indexOf("?");
    if(pos==-1) return [];
    query = location.href.substr(pos+1);
  } else {
    query = location.search.substr(1);
  }
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]",from);
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}




d3.selectAll(".country-select").on("click", function(d){
  if (file == files[d3.select(this).text()]){
    return
  }
  else{
    file = files[d3.select(this).text()]
  d3.select("canvas").remove()
  d3.select("#topic-counts").remove()
  d3.select("#dropdownMenuButton").text("Select Topic")
  d3.select("#topic-docs").remove()
  d3.select("#isolate-button").property("checked", false)
  d3.select("#isolate-t-button").property("checked", false)
  d3.selectAll(".before-selection").style("display", "block")
  wrapper()
  }
  
})


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
    function onDocumentClick( event, word) {

      if (word != undefined){
        hideLabels();

        cloud.material.opacity = .1
        if (simsLabels != undefined){
          ortho_scene.remove(simsLabels)
          scene.remove(simsSpheres)
        }
        simsLabels = new THREE.Object3D()
        simsSpheres = new THREE.Group()
        sims = data[word].UserData.sims
        var scalezoom = ortho_camera.zoom;
        if(ortho_camera.zoom > 8){
          scalezoom = 8
        }
        else if(ortho_camera.zoom < 1){
          scalezoom = 1
        }

        var colorint = d3.interpolateReds
        var tmax = d3.max(sims, function(w){ return w[1]})
          var selcolors = d3.scaleSequential()
          .domain([0, tmax])
          .interpolator(colorint);


        var circleGeo = new THREE.SphereBufferGeometry( 3, 16, 16);
        var circleMat = new THREE.MeshBasicMaterial({color:new THREE.Color(0xFF0000), opacity: 1, transparent: true})
        var wlabel = makeTextSprite(word, {zoom : 1 / scalezoom });
           wlabel.position.set(data[word].x,data[word].y, data[word].z )
        var wselTc = new THREE.Mesh(circleGeo, circleMat)
           wselTc.position.set(data[word].x,data[word].y, data[word].z )
           simsLabels.add(wlabel);
           simsSpheres.add(wselTc);       
        
        sims.forEach(function(w){
           var circleColor = new THREE.Color(selcolors(w[1]))
            circleMat = new THREE.MeshBasicMaterial({color:circleColor, opacity: .5, transparent: true})
           var label = makeTextSprite(w[0], {zoom : 1 / scalezoom });
           label.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
           var selTc = new THREE.Mesh(circleGeo, circleMat)
           selTc.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
           simsLabels.add(label);
           simsSpheres.add(selTc);
        })

        scene.add(simsSpheres);
        ortho_scene.add(simsLabels)

      }

      else if (intersects.length > 0 ){
        hideLabels();

        cloud.material.opacity = .1
        if (simsLabels != undefined){
          ortho_scene.remove(simsLabels)
          scene.remove(simsSpheres)
        }
        simsLabels = new THREE.Object3D()
        simsSpheres = new THREE.Group()
        var i = INTERSECTED.index
        if (cloud.visible == false){
            i = INTERSECTED.object.geometry.attributes.wordsIndex.array[i]
          } 
        sims = cloud.geometry.vertices[i].UserData.sims

        var scalezoom = ortho_camera.zoom;
        if(ortho_camera.zoom > 8){
          scalezoom = 8
        }
        else if(ortho_camera.zoom < 1){
          scalezoom = 1
        }

        var colorint = d3.interpolateReds
        var tmax = d3.max(sims, function(w){ return w[1]})
        var tmin = d3.min(sims, function(w){ return w[1]})
          var selcolors = d3.scaleSequential()
          .domain([tmin, tmax])
          .interpolator(colorint);
        var word = cloud.geometry.vertices[i].name;
        var circleGeo = new THREE.SphereBufferGeometry( 3, 16, 16);
        var circleMat = new THREE.MeshBasicMaterial({color:new THREE.Color(0xFF0000), opacity: 1, transparent: true})
        var wlabel = makeTextSprite(word, {zoom : 1 / scalezoom });
           wlabel.position.set(data[word].x,data[word].y, data[word].z )
        var wselTc = new THREE.Mesh(circleGeo, circleMat)
           wselTc.position.set(data[word].x,data[word].y, data[word].z )
           simsLabels.add(wlabel);
           simsSpheres.add(wselTc); 

        sims.forEach(function(w){
           var circleColor = new THREE.Color(selcolors(w[1]))
            circleMat = new THREE.MeshBasicMaterial({color:circleColor, opacity: .7, transparent: true})
           var label = makeTextSprite(w[0], {zoom : 1 / scalezoom });
           label.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
           var selTc = new THREE.Mesh(circleGeo, circleMat)
           selTc.position.set(data[w[0]].x,data[w[0]].y, data[w[0]].z )
           simsLabels.add(label);
           simsSpheres.add(selTc);
        })

        scene.add(simsSpheres);
        ortho_scene.add(simsLabels)
      }
      else{
        showLabels();
        ortho_scene.remove(simsLabels)
        scene.remove(simsSpheres)
        if (ldaModels[0].data == undefined && ldaModels[1].data == undefined){
           cloud.material.opacity = .3
        }
      }

      
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



      // This was written by Lee Stemkoski
// https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function makeTextSprite( message, parameters )
{
  if ( parameters === undefined ) parameters = {};

  var fontface = parameters["fontface"] || "Helvetica";
  var fontsize = parameters["fontsize"] || 70;
  var canvas = document.createElement('canvas');
  var camerazoom = parameters["zoom"] || 1
  //camerazoom = 1
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
  sprite.scale.set((100 * camerazoom),(50 * camerazoom),1.0);
  return sprite;
};//makeTextSprite


  function hideLabels(){
    if (ldaModels[0].topic != undefined){
      ldaModels[0].topic.labels.visible = false;
    }
    if (ldaModels[1].topic != undefined){
      ldaModels[1].topic.labels.visible = false;
    }
  }

  function showLabels(){
    if (ldaModels[0].topic != undefined){
      ldaModels[0].topic.labels.visible = true;
    }
    if (ldaModels[1].topic != undefined){
      ldaModels[1].topic.labels.visible = true;
    }
  }



//FROM https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag

var currentPos = [];

$('#holder').on('mousedown', function (evt) {
   currentPos = [evt.pageX, evt.pageY]
  $('#holder').on('mousemove', function handler(evt) {
    currentPos=[evt.pageX, evt.pageY];
    $('#holder').off('mousemove', handler);
  });
  $('#holder').on('mouseup', function handler(evt) {
    if(evt.pageX === currentPos[0] && evt.pageY===currentPos[1])
      onDocumentClick()
    $('#holder').off('mouseup', handler);
  });
});


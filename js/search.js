

searchLabels = new THREE.Object3D()
searchSpheres = new THREE.Group()

function highlightSearched(list){



var circleColor = new THREE.Color(0xFF0000);
var circleGeo = new THREE.SphereBufferGeometry( 3, 16, 16);
var circleMat = new THREE.MeshBasicMaterial({color:circleColor, opacity: .8, transparent: true})

var scalezoom = ortho_camera.zoom
        if(ortho_camera.zoom > 8){
          scalezoom = 8
        }
        if(ortho_camera.zoom < 1){
          scalezoom = 1
        }

  list.forEach(function(d){
    var w = d.value
     var label = makeTextSprite(w, {zoom : 1 / scalezoom });
     label.position.set(data[w].x,data[w].y, data[w].z )
      var selTc = new THREE.Mesh(circleGeo, circleMat)
      selTc.position.set(data[w].x,data[w].y, data[w].z )
      searchLabels.add(label);
      searchSpheres.add(selTc);
  })

  scene.add(searchSpheres);
  ortho_scene.add(searchLabels)
}
function removeSearched(){
  scene.remove(searchSpheres);
  ortho_scene.remove(searchLabels)
}


function render_search(){

$( "#words" ).autocomplete({
				delay: 500,
				minLength: 3,
				appendTo: '#searchdd',
      	source: Object.keys(data),
      	response: function(event, ui){
      				console.log(event)
      				console.log(ui)
      				hideLabels()
              highlightSearched(ui.content)
      			},
        select: function(event, ui){
          showLabels();
         console.log(ui)
          removeSearched(ui.content)
          //highlightSearched([ui.item])
          //highlightSearched([ui.item])
         // console.log(data[ui.item.value])
          onDocumentClick(event, ui.item.value)
        },
        close: function(event, ui){
             showLabels();
         console.log(ui)
          removeSearched(ui.content)
        }
    		});



}
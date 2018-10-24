	    function makeLegendSvg(){
      
    /*  legendSvg = d3.select("#holder")
              .append("div")
              .style("height", 50)
              .style("width", 200)
              .style("position", "absolute")
              .style("class","tinytext")
              .style("left", "20px")
              .style("top", "10px")
              .style("background-color", "lightgrey")
*/


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
	
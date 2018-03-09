function drawTheLine (ISO){
        document.getElementById('validation').style.display = 'initial'
        //document.getElementById('explanation').classList.replace( 'explanation-done', 'explanation' )
        document.getElementById('explanation').classList.add( 'explanation')
        document.getElementById('explanation').classList.remove( 'explanation-done')
       // document.getElementById('explanation').classList.remove();

  var data =dataTot.filter(function(v) { return v.LOCATION == ISO; })


  var ƒ = d3.f

  var parseTime = d3.timeParse("%Y")

  var breakDate= 2005;

  var sel = d3.select('#drawChart').html('')

  var heightChart=400;
  if(sel.node().offsetWidth<700)
    heightChart=200;

  var c = d3.conventions({
    parentSel: sel, 
    totalWidth: sel.node().offsetWidth, 
    height: heightChart, 
    margin: {left: 0, right: 80, top: 30, bottom: 30}
  })

  c.svg.append('rect').at({width: c.width, height: c.height, opacity: 0})

  c.x.range([c.width/15, c.width]).domain([d3.min(data, function(d) { return d.TIME; }), d3.max(data, function(d) { return d.TIME; })]);
  c.y.domain([0.75*d3.min(data, function(d) { return parseFloat(d.value); }), 1.25*d3.max(data, function(d) { return parseFloat(d.value); })]);

  c.xAxis.ticks(5).tickFormat(ƒ())
  c.yAxis.ticks(5).tickFormat(d => d )

  var area = d3.area().x(ƒ('TIME', c.x)).y0(ƒ('value', c.y)).y1(c.height)
  var line = d3.area().x(ƒ('TIME', c.x)).y(ƒ('value', c.y))

  c.svg.append("g")     
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-c.width - c.margin.left - c.margin.right)
                .tickFormat("")
                .ticks(5)
            );

  c.svg.append("g")
        .attr("transform", "translate(" + c.width/14+ ","+ "-"+ 10+")")
          .attr("class", "y axis donottouch")
          .call(d3.axisLeft(c.y)
                .tickFormat(d3.format(".2s"))
                .ticks(5)
          );

  var annotation = c.svg.append("g")
        
  annotation.append("rect")
      .attr("class", "annotation")
      .attr("x",c.x(breakDate))
      .attr("y",0.0)
      .attr("rx",10)
      .attr("ry",10)
      .attr("width", (c.x(d3.max(data, function(d) { return d.TIME; })) - c.x(breakDate) ))
      .attr("height", c.height);

  annotation.append("text")
      .attr("class","textindic")
      .attr("x",c.x(breakDate)+0.02*c.width)
      .attr("y",function(){
        var testPos="";
        data.forEach(function(v){
          if(v.TIME==breakDate){
            testPos= c.y(v.value)
          }
        }) 

        if(testPos=="")
          return 0.6*c.height;
        else
          return testPos;
      })
      .text("Draw your estimate");  

  annotation.append("text")
      .attr("class","subtextindic")
      .attr("x",c.x(breakDate)+0.02*c.width)
      .attr("y",function(){
        var testPos="";
        data.forEach(function(v){
          if(v.TIME==breakDate){
            testPos= c.y(v.value)+20
          }
        }) 

        if(testPos=="")
          return 0.6*c.height+20;
        else
          return testPos;
      })
      .text("Click and drag");

  var clipRect = c.svg
    .append('clipPath#clip')
    .append('rect')
    .at({width: c.x(breakDate) - 2, height: c.height})

  var correctSel = c.svg.append('g').attr('clip-path', 'url(#clip)')

  correctSel.append('path.area').at({d: area(data)})
  correctSel.append('path.line').at({d: line(data)})

 /** ADDED VALUE TO END OF LINE **/
  var trueFinalLabel= c.svg.append("text")
                    //.attr("id","visualGuide")
                    .text(d3.round(data[data.length-1].value,1))
                    .attr("x", 30+c.x(data[data.length-1].TIME) )
                    .attr("y", c.y(data[data.length-1].value))
                    .attr("text-anchor", "end")
                    .attr("class", "trueDataLabel donottouch")
                    .attr("opacity",0);

  yourDataSel = c.svg.append('path.your-line')


  c.drawAxis()

  yourData = data
    .map(function(d){ return {TIME: d.TIME, value: parseFloat(d.value), defined: 0} })
    .filter(function(d){
      if (d.TIME == breakDate) d.defined = true
      return d.TIME >= breakDate
    })

  var completed = false

  var drag = d3.drag()
    .on('drag', function(){
      var pos = d3.mouse(this)
      var TIME = clamp(breakDate+1,  d3.max(data, function(d) { return d.TIME; }) +1, c.x.invert(pos[0]))
      var value = clamp(0, c.y.domain()[1], c.y.invert(pos[1]))

      d3.selectAll('.guide').style('opacity', 0.1);
      
      c.svg.selectAll(".annotation")
          .attr("x",c.x(TIME))
          .attr("width", c.x(d3.max(data, function(d) { return d.TIME; })) -c.x(TIME));
      
      c.svg.selectAll(".textindic").remove();      
      c.svg.selectAll(".subtextindic").remove();
      
      yourData.forEach(function(d){
        if (Math.abs(d.TIME - TIME) < .5){
          d.value = value
          d.defined = true
        }
      })
  if (!completed){

      yourDataSel.at({d: line.defined(ƒ('defined'))(yourData)})



  if (c.svg.selectAll("circle").empty() == true) {
                var circle=c.svg.append("circle")
                    .attr("class","donottouch")
                    .attr("fill", "#8EA4B1")
                    .attr("cx", c.x(d3.max(data, function(d) { return d.TIME; })))
                    .attr("cy", c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1]))))
                    .attr("r", 5)
                    .style("cursor","crosshair")
                    
                c.svg.append("text")
                    .attr("id","visualGuide")
                    .text(function() {
                        return c.y.invert(c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1])))).toFixed(0).replace(".", ".")  + "" // add unit in between the quote
                    })
                    .attr("x", 30 + c.x(d3.max(data, function(d) { return d.TIME; })) )
                    .attr("y", c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1]))))
                    .attr("text-anchor", "middle")
                    .attr("class", "dataLabel donottouch");
            } else {
                c.svg.select("circle")
                    .attr("cx", c.x(d3.max(data, function(d) { return d.TIME; })))
                    .attr("cy", c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1]))))
                    .style("cursor","pointer")

                d3.select("#visualGuide")
                    .attr("x",  30 + c.x(d3.max(data, function(d) { return d.TIME; })))
                    .attr("y", c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1]))))
                    .text(function() {
                        return c.y.invert(c.y(clamp(0, c.y.domain()[1], c.y.invert(pos[1])))).toFixed(0).replace(".", ".")  + "" // add unit in between the quote
                    });
            }

  }



      if (!completed && d3.mean(yourData, ƒ('defined')) == 1){

        completed = true

        
        clipRect.transition().duration(1000).attr('width', c.x(d3.max(data, function(d) { return d.TIME; })))
        trueFinalLabel.transition().duration(1000).attr("opacity",1);

        c.svg.selectAll(".annotation").remove();
        document.getElementById('validation').style.display = 'none'
        //document.getElementById('explanation').classList.replace( 'explanation', 'explanation-done' )
        document.getElementById('explanation').classList.remove( 'explanation')
        document.getElementById('explanation').classList.add( 'explanation-done')
        /**document.getElementById('explanation').classList.remove('explanation');
        document.getElementById('explanation').classList.toggle('explanation-done');**/
      }
    })

  c.svg.call(drag)



  function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }

  function make_y_gridlines() { return d3.axisLeft(c.y).ticks() }
}

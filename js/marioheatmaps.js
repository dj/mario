/* =======================================================================
  Heatmap Visualization
  ====================================================================== */
var points = [];

var generatorList = [
  'GE',
  'hopper',
  'launchpad',
  'launchpad-rhythm',
  'notch',
  'notch-param',
  'notch-param-rand',
  'ORE',
  'original',
  'pb-count',
  'pb-occurence',
  'pb-weighted-count'
]

var metricList = [
  'density',
  'LeniencyMetric',
  'LevelSlopeMetric',
  'LinearityMetric',
  'Patterndensity',
  'patternvariation'
]

var clearSVG = function(id) {
  d3.select(id).selectAll("svg").remove()
}

var heatMap = function (id, generatorName, xAxisMetric, yAxisMetric, color1, color2) {
  var controls = d3.select(id)
    .append("div")
    .attr("class", "controls")
  // Add form controls
  var genSelect = controls
    .append("label")
    .style({
      "padding": "1em"
    })
    .text("Generator")
    .append("select")
    .on("change", function() {
      var selectedVal = this.options[this.selectedIndex].value;
      this['generatorName'] = selectedVal;
      drawSVG(id, selectedVal, xAxisMetric, yAxisMetric, color1, color2);
    });

  var xSelect = controls
    .append("label")
    .style({
      "padding": "1em"
    })
    .text("x axis")
    .append("select")
    .on("change", function() {
      var selectedVal = this.options[this.selectedIndex].value;
      this['xAxisMetric'] = selectedVal;
      drawSVG(id, generatorName, selectedVal, yAxisMetric, color1, color2);
    });

  var ySelect = controls
    .append("label")
    .style({
      "padding": "1em"
    })
    .text("y axis")
    .append("select")
    .on("change", function() {
      var selectedVal = this.options[this.selectedIndex].value;
      this['yAxisMetric'] = selectedVal;
      drawSVG(id, generatorName, xAxisMetric, selectedVal, color1, color2);
    });

  // Populate selects with options and select
  var addOptions = function (selectElem, optsList, selected) {
    options = selectElem.selectAll("option")
        .data(optsList)
        .enter()
          .append("option")
          .attr("value", function (d) { return d })
          .text(function (d) { return d });

    currentOption = options.filter(function (d, i) {
      return d == selected
    });

    currentOption.property("selected", true);
  }

  addOptions(genSelect, generatorList, generatorName)
  addOptions(xSelect, metricList, xAxisMetric)
  addOptions(ySelect, metricList, yAxisMetric)

  drawSVG(id, generatorName, xAxisMetric, yAxisMetric, color1, color2);
}

var drawSVG = function(id, generatorName, xAxisMetric, yAxisMetric, color1, color2) {
  clearSVG(id);
  console.log("data/" + generatorName + ".csv");

  var margin = {
        top:    50,
        right:  50,
        bottom: 50,
        left:   50
      },
      w = 500 - margin.left - margin.right,
      h = 500 - margin.top - margin.bottom;

  var color = d3.scale.linear()
      .domain([0, 3])
      .range([color1, color2])
      .interpolate(d3.interpolateLab);

  var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, w]);

  var y = d3.scale.linear()
      .domain([0, 1])
      .range([h, 0]);

  var yinv = d3.scale.linear()
      .domain([0, 1])
      .range([0, h]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var numBins = 50;
      side = 1.0 / numBins;
      bins = d3.bin()
        .size([w, h])
        .side(side);

  var points = []

  // Select the heatmap container div by id
  var svg = d3.select(id)
    .append("svg")
    .attr("class", "heatmap")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" +margin.left+ "," +margin.top+ ")");

  d3.csv("data/" + generatorName + ".csv", function(error, data) {
    // Read CSV
    data.forEach(function(d) {
      d.x = +d[xAxisMetric];
      d.y = +d[yAxisMetric];
      points.push([d.x, d.y]);
    });

    // X AXIS
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
      .append("text")
      .style("text-anchor", "middle")
      .attr("x", w / 2)
      .attr("y", 35)
      .text(xAxisMetric);

    // Y AXIS
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .style("text-anchor", "end")
      .attr("y", h / 2)
      .attr("transform", function(d) {
        return "rotate(90 -45," + h/2 + ")"
      })
      .text(yAxisMetric)


    // DRAW BINS
    svg.selectAll(".square")
      .data(bins(points))
      .enter().append("rect")
      .attr("class", "square")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y)-yinv(side); })
      .attr("width", x(side))
      .attr("height", yinv(side))
      .style("fill", function(d) { return color(d.length); });
  });
}

document.addEventListener("DOMContentLoaded", function(event) {
  heatMap("#chart1", "GE", "density", "LeniencyMetric", "white", "red");
  heatMap("#chart2", "hopper", "density", "LeniencyMetric", "white", "red");
});

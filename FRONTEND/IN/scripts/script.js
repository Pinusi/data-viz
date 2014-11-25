if( !DATAVIZ ) { var DATAVIZ = {}; }

/**
 * @Constructor for the widget
 */
DATAVIZ.Main = function( container, config )
{
	this.config = config;
	this.containerName = container;
    this.$container = $( container );

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
	this.b = {
		w: 250, h: 30, s: 3, t: 10
	};

	this.colors = {};
	this.formattedData = {};

    this.buildGraph();
};

/*
	DATA FUNCTIONS
 */

// format incoming data
DATAVIZ.Main.prototype.formatData = function()
{
	var that = this;

	d3.json("data.json", function(json) {

		var root = {"name": "root", "children": []};

		//project
		for (var i = 0; i < json.length; i++) {
			for (var j = 0; j < root.children.length; j++) {
				
				var project_children = root.children;
				var project_found = false;
				if( project_children[j].name == json[i].project.name)
				{	
					project_found = true;

					//category
					var category_children = project_children[j].children;
					var category_found = false;
					for (var h = 0; h < category_children.length; h++) {
						if( category_children[h].name == json[i].category.name)
						{
							category_found = true;

							var vendor_children = root.children[j].children[h].children;
							var vendor_found = false;
							for (var e = 0; e < vendor_children.length; e++) {
								if( vendor_children[e].customer_name == json[i].vendor.name)
								{
									vendor_found = true;
								}
							}
							if( !vendor_found )
							{
								vendor_children.push({ "name": json[i].vendor.customer_name, "size": json[i].amount });
							}
						}
					}
					if( !category_found )
					{
						category_children.push({ "name": json[i].category.name, "children":[{ "name": json[i].vendor.customer_name, "size": json[i].amount }] });
					}
				}
			}
			if( !project_found )
			{
				root.children.push({ "name": json[i].project.name, "children": [{ "name": json[i].category.name, "children":[{ "name": json[i].vendor.customer_name, "size": json[i].amount }] }] });
			}
		}

		that.formattedData = root;
		that.createColorScale( json );
  		// that.initializeBreadcrumbTrail();
	});
};

// create color scale
DATAVIZ.Main.prototype.createColorScale = function( data )
{
	var proj_increase = 0;
	var cat_increase = 0;
	var vend_increase = 0;

	//loop through data
	for (var i = 0; i < data.length; i++) 
	{
		if( !this.colors[data[i].project.name] )
		{
			this.colors[data[i].project.name] = "rgb(" + (proj_increase * 20) + ", 0, 0)";
			proj_increase++;
		}
		if( !this.colors[data[i].category.name] )
		{
			this.colors[data[i].category.name] = "rgb(0, " + (cat_increase * 20) + ", 0)";
			cat_increase++;
		}
		if( !this.colors[data[i].vendor.customer_name] )
		{
			this.colors[data[i].vendor.customer_name] = "rgb(0, 0, " + (vend_increase * 20) + ")";
			vend_increase++;
		}
	}

	this.drawGraph( this.formattedData );
  	this.initializeBreadcrumbTrail();
}

/*
	GRAPH FUNCTIONS
 */

//draw initial graph
DATAVIZ.Main.prototype.buildGraph = function()
{
	var that = this;
	// this.totalSize = 0;

	this.w = 960;
	var h = 700,
		r = Math.min(this.w, h) / 2;

	// Total size of all segments; we set this later, after loading the data.
	this.totalSize = 0;
	
	// this.color = d3.scale.category20c();

	this.vis = d3.select( this.containerName + " .chart" ).append("svg:svg")
		.attr("width", that.w)
		.attr("height", h)
		.append("svg:g")
		.attr("class", "container")
		.attr("transform", "translate(" + that.w / 2 + "," + h / 2 + ")");

	this.partition = d3.layout.partition()
		.sort(null)
		.size([2 * Math.PI, r * r])
		.value(function(d) { return d.size; });

	this.arc = d3.svg.arc()
		.startAngle(function(d) { return d.x; })
		.endAngle(function(d) { return d.x + d.dx; })
		.innerRadius(function(d) { return Math.sqrt(d.y); })
		.outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

	this.formatData();
};

//fill the graph with data
DATAVIZ.Main.prototype.drawGraph = function( data ) 
{
	var that = this;

	//draw all paths with data (data is already properly formatted)
	var path = this.vis.data([data]).selectAll("path")
		.data( that.partition.nodes )
		.enter().append("svg:path")
		.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
		.attr("d", that.arc)
		.attr("fill-rule", "evenodd")
		.style("stroke", "#fff")
		.style("fill", function(d) { return that.colors[d.name]; })
		// .each( function(d) { d.x0 = d.x; d.dx0 = d.dx; }) // Stash the old values for transition.
		.on("mouseover", function(d) { that.mouseover(d) });
	
	this.totalSize = path.node().__data__.value;

	d3.select( this.containerName + " .container" ).on("mouseleave", function(d) { that.mouseleave()});
};

//get anchestor of a path
DATAVIZ.Main.prototype.getAncestors = function( node )
{
	var path = [];
	var current = node;
	while (current.parent) {
		path.unshift(current);
		current = current.parent;
	}
	return path;
}

/*
	BREADCRUMB FUNCTIONS
 */

// Create the initial breadbrumb structure
DATAVIZ.Main.prototype.initializeBreadcrumbTrail = function() 
{
	var that = this;

	// Add the svg area.
	this.trail = d3.select( this.containerName + " .sequence" ).append("svg:svg")
		.attr("width", that.w)
		.attr("height", 50)
		.attr("id", "trail");
	
	// Add the label at the end, for the percentage.
	this.trail.append("svg:text")
		.attr("id", "endlabel")
		.style("fill", "#000");
}

// Generate a string that describes the points of a breadcrumb polygon.
DATAVIZ.Main.prototype.breadcrumbPoints = function (d, i) {
	var points = [];
	var that = this;

	points.push("0,0");
	points.push(that.b.w + ",0");
	points.push(that.b.w + that.b.t + "," + (that.b.h / 2));
	points.push(that.b.w + "," + that.b.h);
	points.push("0," + that.b.h);
	if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
		points.push(that.b.t + "," + (that.b.h / 2));
	}
	return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
DATAVIZ.Main.prototype.updateBreadcrumbs = function (nodeArray, valueString) 
{

	var that = this;
	// Data join; key function combines name and depth (= position in sequence).
	var g = d3.select("#trail")
		.selectAll("g")
		.data(nodeArray, function(d) { return d.name + d.depth; });

	// Add breadcrumb and label for entering nodes.
	var entering = g.enter().append("svg:g");

	entering.append("svg:polygon")
		.attr("points", function(d,i){ return that.breadcrumbPoints(d,i) })
		.style("fill", function(d) { return that.colors[d.name]; });

	entering.append("svg:text")
		.attr("x", (that.b.w + that.b.t) / 2)
		.attr("y", that.b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(function(d) { return d.name; });

	// Set position for entering and updating nodes.
	g.attr("transform", function(d, i) {
		return "translate(" + i * (that.b.w + that.b.s) + ", 0)";
	});

	// Remove exiting nodes.
	g.exit().remove();

	// Now move and update the percentage at the end.
	d3.select("#trail").select("#endlabel")
		.attr("x", (nodeArray.length + 0.5) * (that.b.w + that.b.s))
		.attr("y", that.b.h / 2)
		.attr("dy", "0.35em")
		.attr("text-anchor", "middle")
		.text(valueString);

	// Make the breadcrumb trail visible, if it's hidden.
	d3.select("#trail")
		.style("visibility", "");

}

/*
	EVENT FUNCTIONS
 */

DATAVIZ.Main.prototype.mouseover = function( obj ) 
{
	var percentage = (100 * obj.value / this.totalSize).toPrecision(3);
	var valueString = "Amount: £" + obj.value;
	var percentageString = percentage + "%";
	if (percentage < 0.1) {
		percentageString = "< 0.1%";
	}

	d3.select( this.containerName + " .percentage")
		.text(percentageString);

	d3.select( this.containerName + " .explanation" )
		.style("visibility", "");

	var sequenceArray = this.getAncestors(obj);
  	this.updateBreadcrumbs(sequenceArray, valueString);

	// Fade all the segments.
	d3.selectAll("path")
		.style("opacity", 0.3);

  	// Then highlight only those that are an ancestor of the current segment.
	this.vis.selectAll("path")
		.filter(function(node) {
				return (sequenceArray.indexOf(node) >= 0);
		})
		.style("opacity", 1);
}

DATAVIZ.Main.prototype.mouseleave = function() 
{
	var that = this;

	// Deactivate all segments during transition.
	d3.selectAll("path").on("mouseover", null);

	// Hide the breadcrumb trail
	d3.select("#trail")
		.style("visibility", "hidden");

	// Transition each segment to full opacity and then reactivate it.
	d3.selectAll("path")
		.transition()
		.duration(1000)
		.style("opacity", 1)
		.each("end", function() {
			d3.select(this).on("mouseover", function(d) { 
				that.mouseover( d );
			});
		});

	d3.select( this.containerName + " .explanation" )
		.style("visibility", "hidden");
}

/*
	WIDGET INITIALIZE
 */

$( document ).ready( function()
{
	window.DATAVIZ = new DATAVIZ.Main('#chart_sunburst',{});
});

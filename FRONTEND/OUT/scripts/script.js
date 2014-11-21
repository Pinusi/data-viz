if( !DATAVIZ ) { var DATAVIZ = {}; }

/**
 * @Constructor for the union info widget
 */
DATAVIZ.Main = function( container, config )
{
	this.config = config;
	this.containerName = container;
    this.$container = $( container );

    this.buildGraph();
};

DATAVIZ.Main.prototype.buildGraph = function()
{
	var that = this;
	// this.totalSize = 0;

	var w = 960,
		h = 700,
		r = Math.min(w, h) / 2;
	
	this.color = d3.scale.category20c();

	this.vis = d3.select( this.containerName ).append("svg:svg")
		.attr("width", w)
		.attr("height", h)
		.append("svg:g")
		.attr("id", "container")
		.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")")
      
      this.vis.append("svg:circle")
            .attr("r", r)
            .style("opacity", 0);

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

DATAVIZ.Main.prototype.mouseover = function( current ) 
{
	var percentage = (100 * current.value / this.totalSize).toPrecision(3);
	var percentageString = percentage + "%";
	if (percentage < 0.1) {
		percentageString = "< 0.1%";
	}

	d3.select("#percentage")
		.text(percentageString);

	d3.select("#explanation")
		.style("visibility", "");

      // Fade all the segments.
      d3.selectAll("path")
            .style("opacity", 0.3);

      var sequenceArray = this.getAncestors(current);
      // Then highlight only those that are an ancestor of the current segment.
      this.vis.selectAll("path")
            .filter(function(node) {
                  return (sequenceArray.indexOf(node) >= 0);
            })
            .style("opacity", 1);
}

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

DATAVIZ.Main.prototype.mouseleave = function( current ) 
{
      var that = this;
	
      // Deactivate all segments during transition.
      d3.selectAll("path").on("mouseover", null);

      // Transition each segment to full opacity and then reactivate it.
      d3.selectAll("path")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .each("end", function() {
                  d3.select(this).on("mouseover", function(d) { that.mouseover(d) });
            });

      d3.select("#explanation")
		.style("visibility", "hidden");
}

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
			};
			if( !project_found )
			{
				root.children.push({ "name": json[i].project.name, "children": [{ "name": json[i].category.name, "children":[{ "name": json[i].vendor.customer_name, "size": json[i].amount }] }] });
			}
		};

		that.drawGraph( root );
	});
};

DATAVIZ.Main.prototype.drawGraph = function( data ) 
{
	var that = this;
	var path = this.vis.data([data]).selectAll("path")
		.data( that.partition.nodes )
		.enter().append("svg:path")
		.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
		.attr("d", that.arc)
		.attr("fill-rule", "evenodd")
		.style("stroke", "#fff")
		.style("fill", function(d) { return that.color((d.children ? d : d.parent).name); })
		// .each( function(d) { d.x0 = d.x; d.dx0 = d.dx; }) // Stash the old values for transition.
		.on("mouseover", function(d) { that.mouseover(d) });
	
	this.totalSize = path.node().__data__.value;

	d3.select("#container").on("mouseleave", function(d) { that.mouseleave(d) });
};

$( document ).ready( function()
{
	window.DATAVIZ = new DATAVIZ.Main('#chart_sunburst',{});
});

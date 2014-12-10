angular.module('dataviz')
.controller('sunBurst', function($scope) {
	// $scope.template = { name: 'template1.html', url: 'templates/sunburst.html'};
	$scope.openModal = function() {
		console.log('clicked');
		$("body").addClass("modal-open");
		$(".dv_modal").show();
	};
})
.directive('datavizWidgetSunburst', function() {
	var link = function ($scope, $el, $attrs) {
		var b = {
			w: ($el.width()/3 - 10 ), h: 20, s: 2, t: 7
		};
		var w = $el.width(),
			h = $el.height() - 50,
			r = Math.min(w, h) / 2;

		var colors = {};
		var palette = ['#36909C','#8CCED8','#59AEBA','#1E8290','#0D6875'];
		var formattedData = {};
		var totalSize = 0;
		var vis = d3.select( $el.find(".chart")[0] ).append("svg:svg")
			.attr("width", w)
			.attr("height", h)
			.append("svg:g")
			.attr("class", "container")
			.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

		var partition = d3.layout.partition()
			.sort(null)
			.size([2 * Math.PI, r * r])
			.value(function(d) { return d.size; });

		var arc = d3.svg.arc()
		    .startAngle(function(d) { return d.x; })
		    .endAngle(function(d) { return d.x + d.dx; })
		    .innerRadius(function(d) { return Math.sqrt(d.y); })
		    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });
		
		formatData();

		function formatData()
		{
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

				formattedData = root;
				createColorScale( json );
			});
		}

		function createColorScale( color_data )
		{
			// var proj_increase = 0;
			// var cat_increase = 0;
			// var vend_increase = 0;
			var palette_index = 0

			//loop through color_data
			for (var i = 0; i < color_data.length; i++) 
			{
				// if( !colors[color_data[i].project.name] )
				// {
				// 	colors[color_data[i].project.name] = "rgb(" + (proj_increase * 20) + ", 0, 0)";
				// 	proj_increase++;
				// }
				// if( !colors[color_data[i].category.name] )
				// {
				// 	colors[color_data[i].category.name] = "rgb(0, " + (cat_increase * 20) + ", 0)";
				// 	cat_increase++;
				// }
				// if( !colors[color_data[i].vendor.customer_name] )
				// {
				// 	colors[color_data[i].vendor.customer_name] = "rgb(0, 0, " + (vend_increase * 20) + ")";
				// 	vend_increase++;
				// }
				colors[color_data[i].project.name] = palette[ palette_index ];
				colors[color_data[i].category.name] = palette[ palette_index ];
				colors[color_data[i].vendor.customer_name] = palette[ palette_index ];
				if( palette_index < palette.length - 1 )
				{
					palette_index++;
				}
				else
				{
					palette_index = 0;
				}
				
			}
			drawGraph( formattedData );
		  	initializeBreadcrumbTrail();
		}


		function drawGraph( data ) 
		{

			//draw all paths with data (data is already properly formatted)
			var path = vis.data([data]).selectAll("path")
				.data( partition.nodes )
				.enter().append("svg:path")
				.attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
				.attr("d", arc)
				.style("stroke", '#fff')
				.attr("fill-rule", "evenodd")
				.style("opacity", 0.8)
				.style("fill", function(d) { return colors[d.name]; })
				.each( function(d) { d.x0 = d.x; d.dx0 = d.dx; }) // Stash the old values for transition.
				.on("mouseover", mouseover);
			
			totalSize = path.node().__data__.value;

			d3.select( $el.find(".container")[0] ).on("mouseleave", mouseleave);
		};

		/*
			EVENT FUNCTIONS
 		*/

		function mouseover( d ) 
		{
			var percentage = (100 * d.value / totalSize).toPrecision(3);
			var valueString = "Amount: £" + d.value;
			var percentageString = percentage + "%";
			if (percentage < 0.1) {
				percentageString = "< 0.1%";
			}

			d3.select( $el.find(".percentage")[0] )
				.text(percentageString);

			d3.select( $el.find(".explanation")[0] )
				.style("visibility", "");

			var sequenceArray = getAncestors(d);
		  	updateBreadcrumbs(sequenceArray, valueString);

			// Fade all the segments.
			d3.selectAll("path")
				.style("opacity", 0.3);

		  	// Then highlight only those that are an ancestor of the current segment.
			vis.selectAll("path")
				.filter(function(node) {
						return (sequenceArray.indexOf(node) >= 0);
				})
				.style("opacity", 0.8);
		};

		function mouseleave( d ) 
		{
			// Deactivate all segments during transition.
			d3.selectAll("path").on("mouseover", null);

			// Hide the breadcrumb trail
			d3.select("#trail")
				.style("visibility", "hidden");

			// Transition each segment to full opacity and then reactivate it.
			d3.selectAll("path")
				.transition()
				.duration(500)
				.style("opacity", 0.8)
				.each("end", function() {
					d3.select(this).on("mouseover", mouseover);
				});

			d3.select( $el.find(".explanation")[0] )
				.style("visibility", "hidden");
		};

		// //get anchestor of a path
		function getAncestors( node )
		{
			var path = [];
			var current = node;
			while (current.parent) {
				path.unshift(current);
				current = current.parent;
			}
			return path;
		};

		/*
			BREADCRUMB FUNCTIONS
 		*/

		// Create the initial breadbrumb structure
		function initializeBreadcrumbTrail() 
		{
			// Add the svg area.
			var trail = d3.select( $el.find(".sequence")[0] ).append("svg:svg")
				.attr("width", w)
				.attr("height", 50)
				.attr("id", "trail");
			
			// Add the label at the end, for the percentage.
			trail.append("svg:text")
				.attr("id", "endlabel")
				.style("fill", "#000");
		}

		// Generate a string that describes the points of a breadcrumb polygon.
		function breadcrumbPoints(d, i) 
		{
			var points = [];

			points.push("0,0");
			points.push(b.w + ",0");
			points.push(b.w + b.t + "," + (b.h / 2));
			points.push(b.w + "," + b.h);
			points.push("0," + b.h);
			if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
				points.push(b.t + "," + (b.h / 2));
			}
			return points.join(" ");
		}

		// Update the breadcrumb trail to show the current sequence and percentage.
		function updateBreadcrumbs(nodeArray, valueString) 
		{

			// Data join; key function combines name and depth (= position in sequence).
			var g = d3.select("#trail")
				.selectAll("g")
				.data(nodeArray, function(d) { return d.name + d.depth; });

			// Add breadcrumb and label for entering nodes.
			var entering = g.enter().append("svg:g");

			entering.append("svg:polygon")
				.attr("points", function(d,i){ return breadcrumbPoints(d,i) })
				.style("fill", function(d) { return colors[d.name]; });

			entering.append("svg:text")
				.attr("x", (b.w + b.t) / 2)
				.attr("y", b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(function(d) { return d.name; });

			// Set position for entering and updating nodes.
			g.attr("transform", function(d, i) {
				return "translate(" + i * (b.w + b.s) + ", 0)";
			});

			// Remove exiting nodes.
			g.exit().remove();

			// Now move and update the percentage at the end.
			d3.select("#trail").select("#endlabel")
				.attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
				.attr("y", b.h / 2)
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle")
				.text(valueString);

			// Make the breadcrumb trail visible, if it's hidden.
			d3.select("#trail")
				.style("visibility", "");

		}
	};

	return {
		restrict: "C",
		replace: true,
		link: link,
		templateUrl: 'templates/sunburst.html'
	};
});
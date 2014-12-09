if( !DATAVIZ ) { var DATAVIZ = {}; }

/**
 * @Constructor for the widget
 */
DATAVIZ.Main = function()
{
	var that = this;
	//to be done before loading the page
	this.angularApp = angular.module('dataviz',[]);
	// that.initializeWidgets();
	
	$(document).ready(function() {
		that.setListeners();
	});
};

DATAVIZ.Main.prototype.setListeners = function()
{

	//variables
    var $container = $('#packery');
    var $modal = $('.dv_modal');
	
	// init packery
	setTimeout(function(){
		$container.packery({
		  	gutter: ".gutter-sizer",
            itemSelector: '.widget',
            "columnWidth": ".grid-sizer"
		});

		$container.find('.widget').each( function( i, itemElem ) {
	  		// make element draggable with Draggabilly
	  		var draggie = new Draggabilly( itemElem );
	  		// bind Draggabilly events to Packery
	  		$container.packery( 'bindDraggabillyEvents', draggie );
		});
	}, 1000);

	//modal event
	$modal.on('click',function( e ){
		var $box = $('.dv_modal .container');
	   	if(!$box.is( e.target ) && $box.has( e.target ).length === 0)
	      	$( this ).hide();
	});
}

/*
	WIDGET INITIALIZE
 */

window.DATAVIZ = new DATAVIZ.Main();
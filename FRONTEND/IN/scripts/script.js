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
	$(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    });
}

// DATAVIZ.Main.prototype.initializeWidgets = function()
// {
// 	$.each( $( '.widget' ), function()
//     {
//         var widgetName = $( this ).attr("dataviz-widget");
//         window.DATAVIZ.WIDGETS.WidgetName = new DATAVIZ.WIDGETS [ widgetName ].Main( $( this ), {} );
//     } );
// }

/*
	WIDGET INITIALIZE
 */

window.DATAVIZ = new DATAVIZ.Main();



// constructor = 'window.DATAVIS.CLIENT.WIDGET_NAME'
// parts = constructor.split('.') // [ PULSE, CLIENT, WIDGET_NAME ]

// window.DATAVIZ.WidgetName = new DATAVIZ.[ widgetName ].Main(  )

// for(i = 0; i <parts; i++)
// {
// 	var functionName
// 	if( parts[0] )
// 		if( parts[0][ parts[1] ] )
// 			functionName = parts[0][ parts[1] ]
// }

define([
    'base/js/namespace',
    'base/js/events',
    'require',
    'services/config'
], function(Jupyter, events, require, configmod) {

    var load_css = function(name) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl(name);
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    var expand_handler = function(e) {
        var target = $(e.target);
        var code_cell = target.parents(".cell.code_cell");
        var widget_area = code_cell.find(".widget-area");
        var parent = target.parent(".output_subarea");
        var top_element = target.parents(".output_wrapper");
        var svg_container = parent.find(".svg-container");
        var svgs = svg_container.find(".main-svg");

        if(target.hasClass("collapsed")) {
            var height = $("#header").height();
            if(widget_area.length > 0) {

                widget_area.addClass("plotly-fullscreen");
                widget_area.css("top", height);
                widget_area.find(".jupyter-widgets").addClass("plotly-center");
                widget_area.find(".jupyter-widgets").css("color", "white");
                var w_height = widget_area.height()
                height += w_height;
            }
            parent.addClass("plotly-fullscreen");
            parent.css("top", height);
            top_element.addClass("plotly-zindex");
            $(parent.find(".plotly-graph-div")[0]).addClass("plotly-center")
            parent.css("bottom", 0);

            // Find the scaling factor
            var parent_width = parent.width();
            var parent_height = parent.height();
            var svg_width = $(svgs[0]).width();
            var svg_height = $(svgs[0]).height();

            if (parent_width <= parent_height) {
                var sc_factor = parent_width / svg_width;
            }
            else {
                var sc_factor = parent_height / svg_height;
            }

            // Scale the svgs to fit the screen
            svgs.each((idx, element) => {
                //$(element).css("transform", "scale(" + sc_factor + ")");
                //$(element).css("transform-origin", "0% 0%");
                var w = $(element).width();
                var h = $(element).height();
                $(element)[0].setAttribute("viewBox", "0 0 " + w + " " + h);
                $(element).css("height", h * sc_factor);
                $(element).css("width", w * sc_factor);
            });

            for (var ele of [svg_container, parent.find(".plotly-graph-div")[0]]) {
                $(ele).css("height",svg_height * sc_factor);
                $(ele).css("width", svg_width * sc_factor);
            }
        }
        else {
            if(widget_area.length > 0) {
                widget_area.removeClass("plotly-fullscreen");
                widget_area.css("top", height);
                widget_area.css("bottom", height);
                widget_area.find(".jupyter-widgets").removeClass("plotly-center");
                widget_area.find(".jupyter-widgets").css("color", "");
            }

            svgs.each((idx, element) => {
                $(element).css("height", "");
                $(element).css("width", "");
            });

            var svg_width = $(svgs[0]).width();
            var svg_heigth = $(svgs[0]).height();
            for (var ele of [svg_container, parent.find(".plotly-graph-div")[0]]) {
                $(ele).css("height",svg_heigth);
                $(ele).css("width", svg_width);
            }

            parent.removeClass("plotly-fullscreen");
            parent.css("top", "");
            parent.css("bottom", "");
            top_element.removeClass("plotly-zindex");
            $(parent.find(".plotly-graph-div")[0]).removeClass("plotly-center")
        }
        target.toggleClass("collapsed");
    };

    var update_height = function() {
        var fullscreen_ele = $("#site").find(".output_subarea.plotly-fullscreen");
        var height = $("#header").height();
        fullscreen_ele.css("top", height);
    };

    var create_button = function(cell, output_div) {
        // Check if the output area has any plotly elements
        if(cell.find(".plot-container plotly")) {
            // Add fullscreen toggle to the cell
            if(output_div)
                var div = cell.find(".output_subarea:has(.plotly)");
            else
                var div = cell.parents(".output_subarea:has(.plotly)");

            if(div.length) {
                if(div.find(".plotly-expand").length)
                    return;
                else {
                    var ele = div.append("<div class='plotly-expand collapsed'></div>");
                    ele.find(".plotly-expand").unbind().on("click", expand_handler);
                }
            }
        }
    };

    var first_load = function() {
        var cells = Jupyter.notebook.get_cells();
        for(var i in cells){
            var cell = cells[i];
            if ((cell instanceof Jupyter.CodeCell)) {
                create_button(cell.output_area.element, true);
            }
        }
    };

    function load_ipython_extension() {
        load_css("./main.css")
        events.one('kernel_ready.Kernel', first_load);
        events.on("resize-header.Page", update_height);

        $(document).on("plotly_afterplot", function(event) {
            create_button($(event.target, false));
        });
    }


/*var oldJQueryEventTrigger = jQuery.event.trigger;
jQuery.event.trigger = function( event, data, elem, onlyHandlers ) {
    // if(event.search("plotly") >= 0)
        // console.log( event, data ,elem, onlyHandlers);
        //console.log(event,data ,elem);
  oldJQueryEventTrigger( event, data, elem, onlyHandlers );
}*/

    return {
        load_ipython_extension: load_ipython_extension
    };
});

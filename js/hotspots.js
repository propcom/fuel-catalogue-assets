/**
 * Possible some of the worst javascript ever created.
 * "paper" deals with the actual drawing (in most cases...) and "hotspots" deals with the hotspots list and creating/editing/etc.
 */

var pageId = $("body").data("hotspot-page-id");
var modelId = $("body").data("page-model-id");

var paper = {
    paperDiv: $("#paper"), /** The Raphael Paper div **/
    wrapper: $("#wrapper"),
    img: $("#wrapper > img"),
    paper: false, /** The instance of 's paper **/
    offset: false,
    startX: 0,
    startY: 0,
    rect: false, /** Rectangle currently being drawn **/
    drawing: false, /** Whether or not they've clicked 'Create Hotspot' **/
    elements: [], /** The elements, with the ID of the hotspot as the key **/

    /**
     * Prepare - does stuff. Like setting the canvas to the right site, etc. etc. etc.
     */
    prepare: function() {
        this.paper = new Raphael('paper', this.img.width(), this.img.height());
        this.offset = this.findPos(this.paperDiv);

        /** Create already-made ones **/
        for(var i = 0, l = hotspotData.length; i < l; i++) {
            var hotspot = hotspotData[i];
            var r = this.paper.rect(hotspot.x, hotspot.y, hotspot.x2-hotspot.x, hotspot.y2-hotspot.y);
            r.attr("stroke-width", 3);

            this.elements[hotspot.id] = r;
        }
    },

    onmousedown: function(e) {
        if(!this.drawing) return false;
        if(hotspots.inCreation) return false; /** Don't let them start drawing **/
        var mouseCoords = this.getCoords(e);
        this.startX = mouseCoords.x - this.offset[0];
        this.startY = mouseCoords.y - this.offset[1];
        this.rect = this.paper.rect(this.startX, this.startY, 0, 0);
        this.rect.attr("stroke-width", 3);
        var that = this;
        this.paperDiv.on('mousemove', function(e) { that.doDraw(e); });
    },

    onmouseup: function(e) {
        var bbox;
        if (this.rect) {
            var bbox = this.rect.getBBox();
            this.paperDiv.off('mousemove');
            this.paperDiv.off('mousedown');
            hotspots.showCreateForm(bbox);
        }
    },

    doDraw: function() {
        if (this.rect) {
            var mousePos = this.getCoords(event);
            var currentX = mousePos.x - this.offset[0];
            var currentY = mousePos.y - this.offset[1];
            var width = currentX - this.startX;
            var height = currentY - this.startY;
            
            if (width < 0) {
                this.rect.attr({'x': currentX, 'width': width * -1});
            } else {
                this.rect.attr({'x': this.startX, 'width': width});
            }
            if (height < 0) {
                this.rect.attr({'y': currentY, 'height': height * -1});
            } else {
                this.rect.attr({'y': this.startY, 'height': height});
            }
        }
    },

    /** Get the position of an object by looking at it's offset parents**/
    findPos: function(obj) {
        if(obj.get()) obj = obj.get(0); /** for jquery objects **/

        var curleft = 0, curtop = 0;

        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return [curleft, curtop];
        } else {
            return false;
        }
    },

    /** Get mouse position relative to paper **/
    getCoords: function(event) {
        event = event || window.event;
        if (event.pageX || event.pageY) {
            return {x: event.pageX, y: event.pageY};
        }
        return {
            x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: event.clientY + document.body.scrollTop  - document.body.clientTop
        };
    },

};

var hotspots = {
    listElement: $("#hotspot-list"), 
    currentlyEditing: false,
    inCreation: false, /** Are we currently creating? **/

    /** Loads the hotspots from the JSON array on the page - should only be called on page load!! **/
    initialHotspotLoad: function() {
        /** Uses document.on as it supports elements added to DOM after page load **/
        $(document).on("click", ".remove-hotspot-btn", function(e) { return hotspots.removeHotspot(e); });

        $(document).on("click", ".edit-hotspot-btn", function(e) { return hotspots.showEditForm(e); });

        $(document).on('click', "#create-hotspot", function(e) { return hotspots.createHotspotButtonClicked(e); });

        $(document).on('submit', '#create-form', function(e) { return hotspots.submitCreateForm(e); });

        $(document).on('submit', '#edit-form', function(e) { return hotspots.submitEditForm(e); });

        $(document).on('click', '#cancel-create', function(e) { return hotspots.cancelCreateForm(e); });

        $(document).on('click', '#cancel-edit', function(e) { return hotspots.cancelEditForm(e); });
        /** Mouse in/out list elements to display the matching rectangle **/
        $(document).on('mouseenter', 'li', function(e) { return hotspots.mouseOverListElement(e); });
        $(document).on('mouseleave', 'li', function(e) { return hotspots.mouseOutListElement(e); });

        /** Make left hand side scrollable **/
        $('.left').height($(window).height());

        /** hotspotData is outputted on the page.php file with all the correct data **/
        hotspots.refreshHotspots(hotspotData);
    },

    /** Load all hotspots from API **/
    loadAll: function() {
        var hotspots = [];
        var that = this; /** http://stackoverflow.com/questions/1579672/reference-to-an-object-from-a-callback-function-in-jquery **/

        $.ajax({
            type: "GET",
            url: "/admin/catalogue/manage/api/pages/" + pageId + "/hotspots.json"
        }).success(function(data) {
            that.refreshHotspots(data);
        });
        return hotspots;
    },

    /** Clears out the hotspots ands replaces them with the data **/
    refreshHotspots: function(data) {
        this.clearHotspotList();

        /** Allow for AJAX - as AJAX returns the data inside a "data" key **/
        if(data.data) data = data.data;

        for(i = 0, l = data.length; i < l; i++) {
            this.appendHotspotToList(data[i]);
        }
    },

    /** Add a Hotspot to the end of the list **/
    appendHotspotToList: function(hotspot) {
        this.listElement.after(this.getHotspotHtml(hotspot));
    },

    /** Prepend to top of list **/
    prependHotspotToList: function(hotspot) {
        this.listElement.before(this.getHotspotHtml(hotspot));
    },

    /** Render the handlebars template with a hotspot object **/
    getHotspotHtml: function(hotspot) {
        var source   = $("#hotspot-item-template").html();
        var template = Handlebars.compile(source);
        var html = template(hotspot);

        return html;
    },

    /** Remove a hotspot from the list **/
    removeHotspotFromList: function(hotspotId) {
        $("li[data-hotspot-id=" + hotspotId + "]").remove();
    },

    /** Clear out the list **/
    clearHotspotList: function() {
        this.listElement.empty();
    },
    
    /** Passed from jQuery's click event **/
    removeHotspot: function(e) {
        /** Had to add into a $.when because it wasn't setting before sending AJAX request **/
        $.when(hotspotId = $(e.target).parent('li').data('hotspot-id')).done(function(hotspotId) {

            var that = this;
            $.ajax({
                type: "DELETE",
                url: "/admin/catalogue/manage/api/pages/" + pageId + "/hotspots/" + hotspotId + ".json"
            }).success(function(data) {
                /** Remove from the image **/
                hotspots.removeHotspotFromList(hotspotId);
                hotspots.removeRectangleFromImage(hotspotId);
            });
        });
    },

    /** This updates a specfic hotspot in the list - fetching the latest information and replacing it. Useful for post-update **/
    updateHotspotInList: function(hotspotId) {
        var listItem = $(".hotspot-list__item[data-hotspot-id=" + hotspotId + "]");
        if ( ! listItem) {
            console.log("Couldn't find Hotspot " + hotspotId + " in list."); 
            return false;
        }
        $.ajax({
            type: "DELETE",
            url: "/admin/catalogue/manage/api/pages/" + pageId + "/hotspots/" + hotspotId + ".json"
        }).success(function(data) {
            listItem.replace(this.getHotspotHtml(data.data));
        });
    },

    /** Show the creation form **/
    showCreateForm: function(bbox) {        
        this.inCreation = true;
        var source   = $("#create-form-template").html();
        var template = Handlebars.compile(source);
        var context = {
            x: bbox.x,
            y: bbox.y,
            x2: bbox.x2,
            y2: bbox.y2
        };

        return this.listElement.before(template(context));
    },

    /** Submit the creation form **/
    submitCreateForm: function(e) {
        e.preventDefault();

        var that = this;
        $.ajax({
            type: "POST",
            url: "/admin/catalogue/manage/api/pages/" + modelId + "/hotspots.json",
            data: $(e.target).serialize()
        }).success(function(data) {
            if(data.success) {
                /** Add to grid permanently and store in elements **/
                data = data.data[0]; /** Get the hotspot data, as it comes back in an array inside data **/
                var r = paper.paper.rect(data.x, data.y, data.x2-data.x, data.y2-data.y); /** Create rectangle **/
                r.attr("stroke-width", 3);
                paper.elements[data.id] = r; /** Add to the elements repository on paper **/

                that.prependHotspotToList(data); /** Add to the list! **/
            } else {
                alert(data.message);
            }
        });

        /** Once they've made the hotspot, hide the form, turn off drawing and toggle the button back **/
        $(".left #create-form").remove();
        paper.drawing = false;
        this.toggleCreateButtonState('inactive');
        paper.rect.remove();
        paper.rect = false;
        this.inCreation = false;

        return false;
    },

    cancelCreateForm: function(e) {
        $("#create-form").empty();
        $("#create-form").remove();
        this.toggleCreateButtonState();
        this.inCreation = false;
        if(paper.rect) paper.rect.remove();
        paper.rect = false;
    },

    /** When the create hotspot button is clicked **/
    createHotspotButtonClicked: function(e) {
        if(!paper.drawing) {
            /** Going into creation mode **/
            this.toggleCreateButtonState('active');
            paper.paperDiv.on("mousedown", function(e) {
                return paper.onmousedown(e);
            });
            paper.paperDiv.on("mouseup", function(e) {
                return paper.onmouseup(e);
            });
        } else {
            /** Exiting creation made **/
            this.cancelCreateForm();
            this.toggleCreateButtonState('inactive');
            paper.paperDiv.off("mousedown");
            paper.paperDiv.off("mouseup");
        }

        paper.drawing = !paper.drawing;
    },

    toggleCreateButtonState: function(state) {
        var button = $("#create-hotspot");
        if(state == 'active') {
            button.removeClass("btn-success");
            button.addClass("btn-danger");
            button.html("Cancel Creation");
        } else {
            $("#create-form").remove();
            button.removeClass("btn-danger");
            button.addClass("btn-success");
            button.html("Create Hotspot");
        }
    },

    /** Show the edit form **/
    showEditForm: function(e) {
        this.closeEditForm(); /** Hide any edit forms to stop it showing more than one **/
        
        var target = $(e.target);
        var parentLi = target.parent();
        var hotspotId = parentLi.data("hotspot-id");
        // if(this.currentlyEditing == false) return; /** Already editing **/

        this.currentlyEditing = true;

        $.ajax({
            url: "/admin/catalogue/manage/api/pages/" + pageId + "/hotspots/" + hotspotId + ".json",
            type: "GET"
        }).success(function(data) {
            if(data.success) {
                var context = data.data;
                var source   = $("#edit-form-template").html();
                var template = Handlebars.compile(source);
                return parentLi.after(template(context));
            } else {
                return alert("Something went wrong fetching the hotspot. Please reload and try again.");
            }
        });
    },

    cancelEditForm: function(e) {
        var parent = $(e.target).parent();
        this.currentlyEditing = false;

        this.closeEditForm();
    },

    submitEditForm: function(e) {
        e.preventDefault();
        var target = $(e.target);
        var hotspotId = target.data('hotspot-id');
        var that = this;

        $.ajax({
            type: "POST",
            url: "/admin/catalogue/manage/api/pages/" + pageId + "/hotspots/" + hotspotId + ".json",
            data: target.serialize()
        }).success(function(data) {
            if(data.success) {
                /** Update the hotspot via ajax to match the data they just inputted **/
                that.updateHotspotInList(hotspotId);
            } else {
                alert(data.message);
            }
        });

        this.closeEditForm();
        this.currentlyEditing = false
        return false;
    },

    closeEditForm: function() {
        $(".left #edit-form").empty();
        $(".left #edit-form").remove();

        this.currentlyEditing = false;
    },

    /** Return a rectangle using the hotspot ID **/
    removeRectangleFromImage: function(hotspotId) {
        return paper.paper.getById(paper.elements[hotspotId].id).remove();;
    },

    /** Mouse over list element - highlight the matching rect **/
    mouseOverListElement: function(e) {
        var hotspotId = $(e.target).closest('li').data('hotspot-id');

        var rect = paper.paper.getById(paper.elements[hotspotId].id);
        rect.attr({ stroke: "#ff0" });
    },

    /** Mouse out list element - un-highlight the matching rect **/
    mouseOutListElement: function(e) {
        var hotspotId = $(e.target).closest('li').data('hotspot-id');

        var rect = paper.paper.getById(paper.elements[hotspotId].id);
        rect.attr({ stroke: "#000" });
    }

};

$(document).ready(function(e) {
    $.when(paper.prepare()).done(function() {
        hotspots.initialHotspotLoad();
    });

});

/** Experimental - don't forget to delete **/
// $(document).on('mousemove', function(e) {
//     var coords = paper.getCoords(e);
//     var offset = paper.findPos($("img"));
//     var currentX = coords.x - offset[0];
//     var currentY = coords.y - offset[1];

//     if(thing = paper.paper.getElementsByPoint(currentX, currentY)) {
//         thing.attr({ stroke: "#ff0" });

//         delete thing;
//     }
// });

var FeedScroller = function(feedUrl) {
	var scroller = this;
	scroller.feedURL = feedUrl; //"http://www.stellarbiotechnologies.com/media/press-releases/json";
	scroller.offset = 0; // start at latest
	scroller.templates = []; // template caches on first compile
	$.ajaxSetup({
		async: false // make life easy
	});
	$(function() {
	    scroller.ready();
	    while ($("body").height() < $(window).height()){
	    	$(window).scroll();
	    }
	});
};

FeedScroller.prototype.ready = function(){
	var scroller = this;
	scroller.fetch(3,function(){
		$(window).scroll(function() {
		    if($(window).scrollTop() == $(document).height() - $(window).height()) {
		        scroller.fetch(1);
		    }
		});
	});
};

FeedScroller.prototype.template = function(url, context, callback) {
	var scroller = this;
	var cached = false;
	$.each(scroller.templates,function(i,template) {
		if (template.url == url){
			cached = true;
			var html = template.tmpl(context);  
		    if (callback) callback(html);
		}
	});
	if(!cached){
		$.ajax({async:false, url: url,
			success: function(source) {
		        var tmpl = Handlebars.compile(source);
		        scroller.templates.push({url:url,tmpl:tmpl});
		        var html = tmpl(context);  
		        if (callback) callback(html);
	        }
	    });
	}
};

FeedScroller.prototype.fetch = function(limit,callback) {
	var scroller = this;
	$(".loading").show();

	var url = scroller.feedURL+"?limit="+limit+"&offset="+scroller.offset;
	$.getJSON(url, function(result) {
		scroller.offset = scroller.offset + result.news.length;
		$.each(result.news,function(i,release) {
			scroller.template('templates/release.html', release, function(output) {
		         scroller.render(output);
		    });
		});
		if (callback) callback();
	});
};

FeedScroller.prototype.render = function(output) {
	var scroller = this;
	$(".loading").hide();
	$(output).hide().appendTo(".scroller").fadeIn();
	
};
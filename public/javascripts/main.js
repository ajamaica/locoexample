$(function() {
	var dateformat = 'YYYY-MM-DD';
	var dateformatHora = 'MMMM Do YYYY, h:mm:ss a';
	var opts = {
	  lines: 13 // The number of lines to draw
	, length: 28 // The length of each line
	, width: 14 // The line thickness
	, radius: 42 // The radius of the inner circle
	, scale: 1 // Scales overall size of the spinner
	, corners: 1 // Corner roundness (0..1)
	, color: '#ffffff' // #rgb or #rrggbb or array of colors
	, opacity: 1 // Opacity of the lines
	, rotate: 0 // The rotation offset
	, direction: 1 // 1: clockwise, -1: counterclockwise
	, speed: 1 // Rounds per second
	, trail: 60 // Afterglow percentage
	, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
	, zIndex: 2e9 // The z-index (defaults to 2000000000)
	, className: 'spinner' // The CSS class to assign to the spinner
	, top: '50%' // Top position relative to parent
	, left: '50%' // Left position relative to parent
	, shadow: true // Whether to render a shadow
	, hwaccel: true // Whether to use hardware acceleration
	, position: 'absolute' // Element positioning
	}
		var spinner = new Spinner().spin();
	
		var from_code = "";
		var to_code = "";

		
		// Call ajax
		$("#search_now").click(function(){
			$("#tabs_render").html("");
			$("#tabs_render").hide();
			var day_selected = $('input[name="daterange"]').val();
			renderday( day_selected );
			
			
			selected_moment = moment(day_selected, dateformat);
			
			var antier = selected_moment.add(-2, 'day').format(dateformat);
			var ayer = selected_moment.add(1, 'day').format(dateformat);
			var hoy = selected_moment.add(1, 'day').format(dateformat);
			var manana = selected_moment.add(1, 'day').format(dateformat);
			var pasadomanana = selected_moment.add(1, 'day').format(dateformat);
			
			var valid_display_days = [antier, ayer, hoy, manana, pasadomanana];
			
			for (var i=0; i < valid_display_days.length; i++) {
				
				  var template = $('#tabday').html();
				  Mustache.parse(template);   // optional, speeds up future uses
				  var rendered = Mustache.render(template, {name : valid_display_days[i], index : i });
				  $("#tabs_render").append(rendered);
				
			};
			
			$( ".datetab:eq(2)" ).addClass("active");
			
		  	$( ".datetab").click(function(){
				var rel = $(this).attr("rel");
				var new_selected_tab = valid_display_days[parseInt(rel)];
				renderday( new_selected_tab );
			})
			
			
		});
	
	
	function renderday(day){
		var query = "http://localhost:3000/search?date=" + day + "&from=" + from_code + "&to=" + to_code;
		console.log(query);
		var target = $("body");
		target.append(spinner.el);
		$('#results').html("");
		$.get(query,function(data){
			spinner.el.remove();
			$("#tabs_render").show();
			
			for (var i=0; i < data.length; i++) {
				  var item = data[i];
				
					var to_rendered = { airline: item["airline"]["name"], 
															code :  item["airline"]["code"],
															flightNum :  item["flightNum"],
															price : item["price"],
															durationMin : item["durationMin"],
															startdateTime : moment(item["start"]["dateTime"]).format(dateformatHora) ,
															finishdateTime : moment(item["finish"]["dateTime"]).format(dateformatHora) }
				
					var template = $('#template').html();
				  Mustache.parse(template);   // optional, speeds up future uses
				  var rendered = Mustache.render(template, to_rendered);
				  $('#results').append(rendered);
			};

			
		}).fail(function() {
			spinner.el.remove();
		    alert( "error" );
		});
	}
		// Inputs
		var airports = new Bloodhound({
		  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('airportName'),
		  queryTokenizer: Bloodhound.tokenizers.whitespace,
		  remote: {
		    url: 'http://localhost:3000/airports?q=%QUERY',
		    wildcard: '%QUERY'
		  }
		});
					
		$('input[name="from"]').click(function(){
			$('input[name="from"]').val("")
		});
		$('input[name="from"]').typeahead(null, {
		  name: 'from',
		  display: 'airportName',
		  source: airports
			
		}).on('typeahead:selected', function(event, data){            
			        console.log(data.airportCode);    
							from_code =	data.airportCode;
			    });
		
		$('input[name="to"]').click(function(){
			$('input[name="to"]').val("")
		})
		$('input[name="to"]').typeahead(null, {
		  name: 'to',
		  display: 'airportName',
		  source: airports
		}).on('typeahead:selected', function(event, data){            
			        console.log(data.airportCode);   
							to_code =	data.airportCode;     
		});
		
		// DATEPICKER
    var datep = $('input[name="daterange"]').daterangepicker({
			 singleDatePicker: true,
			minDate : new Date(),
			startDate : new Date(),
			locale: {
			      format: 'YYYY-MM-DD'
			},
		});

		
});

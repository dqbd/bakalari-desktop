app.factory("Utils", function() {
	return {
		subjectToColor: function(input) {
			hash = 0;
	        for(var x = 0; x < input.length; x++) {
	            hash = input.charCodeAt(x) + ((hash << 5) - hash);
	        }

	        var color = ((hash>>24)&0xFF).toString(16) +
	            ((hash>>16)&0xFF).toString(16) +
	            ((hash>>8)&0xFF).toString(16) +
	            (hash&0xFF).toString(16);

	        return {"background-color": "#"+color.substr(0, 6)};
		},
		formatDate: function(input) {
	    	var days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
	    	var date = new Date(input*1000);

	    	return days[date.getDay()]+" "+date.getDate() + ". "+ (date.getMonth()+1) + ". "+date.getFullYear();
	    },
		shortenSubject: function(subject) {
	    	var addIn = ["i", "y", "í", "ý"];
	    	var exceptions = {"čjl": "Čj", "ehv":"Eh", "evv": "Ev"};

	        var words = (subject.charAt(0).toUpperCase() + subject.slice(0)).split(" ");

	        var shortened = "";
	        if(words.length > 1) {
	    		shortened = words.map(function(e) {
	    			return (e.length > 1) ? e.charAt(0) : "";
	    		}).join("");
	        } else {
	        	shortened = subject.charAt(0);
	        	if(addIn.indexOf(subject.charAt(1)) > -1) {
	        		shortened += subject.charAt(1);
	        	} else if (shortened == "C" && subject.charAt(1) == "h") {
	                shortened += "h";
	            }
	        }

	        return (exceptions[shortened.toLowerCase()]) ? exceptions[shortened.toLowerCase()] : shortened;
	    }

	};
});


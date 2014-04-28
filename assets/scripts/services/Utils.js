app.factory("Utils", function() {
	

	this.subjectToColor = function(input) {
		hash = 0;
        for(var x = 0; x < input.length; x++) {
            hash = input.charCodeAt(x) + ((hash << 5) - hash);
        }

        var color = ((hash>>24)&0xFF).toString(16) +
            ((hash>>16)&0xFF).toString(16) +
            ((hash>>8)&0xFF).toString(16) +
            (hash&0xFF).toString(16);

        return {"background-color": "#"+color.substr(0, 6)};
	}

	this.formatDate = function(input) {
    	var days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
    	var date = new Date(input*1000);

    	return days[date.getDay()]+" "+date.getDate() + ". "+ (date.getMonth()+1) + ". "+date.getFullYear();
    }

	this.shortenSubject = function(subject) {
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

    this.capitalize = function(input, avoid) {
    	avoid = (avoid) ? avoid : ["a", "v", "z", "do", "od", "ve", "na", "i"];
    	input = input.toLowerCase().split(" ");

    	input.forEach(function(word, pos) {
    		if(avoid.indexOf(word) < 0 || pos > 0) {
    			input[pos] = input[pos].charAt(0).toUpperCase() + input[pos].slice(1);
    		}
    	});
    	return input.join(" ");
    }

    this.sortCzech = function(input, key){ //http://diskuse.jakpsatweb.cz/?action=vthread&forum=8&topic=70520#18, fakt se mi nechtělo
    	var _chars = ' aáäaaâbcćčdďeéěëeefghhiíiiîjklĺľmnńňnoóôooöőpqrŕřsśštťuúuůüuuvwxyýzźž0123456789'.toUpperCase();

    	var map = {};
	    var index;

	    for (var i = 0, item; i < input.length; i++) { 
	        index = []; 
	        item = (typeof key !== "undefined") ? input[i][key] : input[i];

	        item.replace("/\s+/g", " ");

	        for (var j = 0, ch, pos; j < item.length; j++) {
	            ch = item.substr(j, 1).toUpperCase();
	            if (j + 1 < item.length && ch == "C" && item.substr(j + 1, 1).toUpperCase() == "H") {
	                pos = 22; 
	                j++;
	            } else { 
	                pos = _chars.indexOf(ch);
	            }
	 
	            index.push(pos < 10? "0" + pos : pos); 
	        }

	        map[item] = index.join("");
	    }
	 
	    
	    return input.sort(function(a, b) {
	        
	        a = (typeof key !== "undefined") ? a[key] : a;
	        b = (typeof key !== "undefined") ? b[key] : b;
	        
	        var a2 = map[a];
	        var b2 = map[b];
	 
	        if (a2 > b2) { return 1;}
	        if (a2 < b2) { return -1;}
	        return 0;
	    });
	}

	return this;
});


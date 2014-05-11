/* Nic zde nenajdeš, jen promněné, které jsou docela důležité... */
var new_win = {
    "frame":true,
    "icon": "./assets/img/logo-hat.png",
    "toolbar":false,
    "width": 800,
    "height": 500,
    "focus": true,
    "show": false,
    "resizable": false
};

var host = "duong.cz";

var pages = [
    { "name": "znamky", "title": "Známky", "show": true }, 
    { "name": "rozvrh","title": "Rozvrh", "show": true }, 
    { "name": "suplovani","title": "Suplování", "show": true }, 
    { "name": "plan","title": "Plán akcí", "show": true }, 
    { "name": "predmety","title": "Předměty", "show": true }, 
    { "name": "vyuka","title": "Výuka", "show": true }, 
    { "name": "absence","title": "Absence", "show": true }, 
    { "name": "ukoly","title": "Domácí úkoly", "show": true },
    { "name": "options", "title": "Nastavení", "show": false }
];

var colors = ["default", "night", "blue",  "green", "gray", "yellow", "red", "pink", "purple"];
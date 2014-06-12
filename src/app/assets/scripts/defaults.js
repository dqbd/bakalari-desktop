/* Nic zde nenajdeš, jen promněné, které jsou docela důležité... */

var GLOBALS = {
    host: "duong.cz",
    adduser_win: {
        "frame":true,
        "icon": "./assets/img/logo-hat.png",
        "toolbar":true,
        "width": 800,
        "height": 500,
        "focus": true,
        "show": false,
        "focus": true,
        "resizable": false
    },
    notify_win: {
        "frame": false,
        "toolbar": false,
        "always-on-top":true,
        "resizable": false,
        "show": false,
        "width": 300,
        "max_height": 60,
        "height": 60
    },
    pages: [
        { "name": "znamky", "title": "Známky", "show": true, "api": "znamky" }, 
        { "name": "rozvrh","title": "Rozvrh", "show": true, "api": "rozvrh" }, 
        { "name": "suplovani","title": "Suplování", "show": true, "api": "suplovani" }, 
        { "name": "plan","title": "Plán akcí", "show": true, "api": "akce"}, 
        { "name": "predmety","title": "Předměty", "show": true, "api": "predmety" }, 
        { "name": "vyuka","title": "Výuka", "show": true, "api": "vyuka" }, 
        { "name": "absence","title": "Absence", "show": true, "api": "absence" }, 
        { "name": "ukoly","title": "Domácí úkoly", "show": true, "api": "ukoly" },
        { "name": "options", "title": "Nastavení", "show": false }
    ],
    colors: ["default", "night", "blue",  "green", "gray", "yellow", "red", "pink", "purple"]
};
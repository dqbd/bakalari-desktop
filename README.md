#Školář-Desktop
**_Žákovská knížka, která vypadá hezky_**

###Požadavky
Pro kompilaci je nutné mít nainstalované tyto aplikace

* `nodejs` a `npm` (ten je s nodejs zabudovaný)
* `python` 2.7.x, **nikoliv** 3.x.x

* Unix:
    * `make` 
    * GCC toolchain pro C++/C, nejlépe `gcc`
* Windows
    * Microsoft Visual Studio C++ 2010 (< Windows 8), 2012 u Windows 8 a výš
    
###Jak zkompilovat
Nejprve stáhni celý tento git. Poté v příkazovém řádku s CWD u složky zadej  
```
$ npm install grunt nw-gyp -g
$ npm install
$ grunt init
$ grunt start
```
###Příprava k publikaci
```
$ grunt publish
```
Veškeré soubory se budou nacházet ve složce `builds`
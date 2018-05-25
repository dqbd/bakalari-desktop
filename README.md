# Školář-Desktop
**_Alternative UI for school grades system Bakaláři_**
This project is now defunct, most of the interface of Bakaláři has changed. 

![Screenshot of the App](screenshot.gif)

### Requirements for compilation

* `nodejs` a `npm`
* `python` 2.7.x

* Unix:
    * `make` 
    * GCC toolchain for C++/C, `gcc` preferably
* Windows
    * Microsoft Visual Studio C++ 2010
    
### How to compile 
```
$ npm install grunt -g
$ npm install
$ grunt init
```
App will be found in `src`. For publishing type:
```
$ grunt
```
App will be packaged in directory `builds`.

# uitc
UI Test Common 

# Installation
1. go to your cypress project dir
2. run `npm install --save-dev @cypress/browserify-preprocessor`
3. run `npm install git+ssh://git@github.com:avia-sb/uitc.git`


if the installation went without any errors you can just import uitc to your project
`import { Auth } from 'uitc'`

# Functionalities
 1. UIlogin(username, password, url)
 2. createUUID()
 
 # Example
 ```
 import { Auth } from 'uitc'
 Auth.UIlogin('admin', '1qaz@WSX', 'localhost:9000')
 ```

# Troubleshooting
1. if you're getting 'import export' error do as follows:
   * Install browserify: `npm install -g browserify`
   * Install babel: `npm install --save-dev browserify babelify babel-preset-es2015 babel-preset-stage-0 babel-preset-env`
   * Install babel/core: `npm install @babel/core --save`
   * Add these lines at the end of package.json:
       ```
       ,
         "browserify": {
           "transform": [
             [
               "babelify",
               {
                 "presets": [
                   "@babel/preset-env"
                 ]
               }
             ]
           ]
         }
         ```

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
 ```import { Auth } from 'uitc'
    Auth.UIlogin('admin', '1qaz@WSX', 'localhost:9000')```

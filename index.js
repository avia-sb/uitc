// exports.login = function(username, password, url){
//       cy.visit(url)
//       cy.get('#username').type(username)
//       cy.get('#password').type(password)
//       cy.get('[name="login"]').click()
//   }


var Auth = require('./src/Utils/auth.js');

class UITC{
    constructor(){
        this.auth = Auth
    }
};

module.exports = UITC 


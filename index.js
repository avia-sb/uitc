// exports.login = function(username, password, url){
//       cy.visit(url)
//       cy.get('#username').type(username)
//       cy.get('#password').type(password)
//       cy.get('[name="login"]').click()
//   }


import Auth from './Utils/Auth'

class UITC{
    auth = Auth
};

export { UITC }


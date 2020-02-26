export function login(username, password, url){
    cy.visit(url)
    cy.get('#username').type(username)
    cy.get('#password').type(password)
    cy.get('[name="login"]').click()
}


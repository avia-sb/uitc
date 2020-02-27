class Auth{

    UIlogin(username, password, url){
        cy.visit(url)
        cy.get('#username').type(username)
        cy.get('#password').type(password)
        cy.get('[name="login"]').click()
    }

    submitLoginForm(response){
        const isAlreadyLoggedIn = cy.find("#kc-form-login").length > 0;
        if (isAlreadyLoggedIn) {
          return;
        }
        return cy.request({
          form: true,
          method: "POST",
          url: loginForm[0].action,
          followRedirect: false,
          body: {
            username: Cypress.env("keycloak_user"),
            password: Cypress.env("keycloak_password"),
          },
        });
      };
      
    createUUID(){
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
      };
      
    //   Cypress.Commands.add("login", (url) => {
    //     return cy.get("@isLoggedIn").then((isLoggedIn) => {
    //       if (isLoggedIn) {
    //         return;
    //       }
      
    //       const loginPageRequest = {
    //         url: `${Cypress.env("keycloak_host")}/realms/${Cypress.env("keycloak_realm")}/protocol/openid-connect/auth`,
    //         qs: {
    //           client_id: Cypress.env("keycloak_client_id"),
    //           redirect_uri: url,
    //           state: createUUID(),
    //           nonce: createUUID(),
    //           response_mode: "fragment",
    //           response_type: "code",
    //           scope: "openid",
    //         },
    //       };
      
    //       return cy
    //         .request(loginPageRequest)
    //         .then(submitLoginForm)
    //         .then(() => cy.wrap(true).as("isLoggedIn"));
    //     });
    //   });
      
    //   Cypress.Commands.add("authenticate", (isAdmin = false) => {
    //     return cy
    //       .request({
    //         form: true,
    //         method: "POST",
    //         body: {
    //           username: isAdmin ? Cypress.env("keycloak_admin_user") : Cypress.env("keycloak_user"),
    //           grant_type: "password",
    //           password: isAdmin ? Cypress.env("keycloak_admin_password") : Cypress.env("keycloak_password"),
    //           client_id: Cypress.env("keycloak_client_id"),
    //         },
    //         url: `${Cypress.env("keycloak_host")}/realms/${Cypress.env("keycloak_realm")}/protocol/openid-connect/token`,
    //       })
    //       .then((res) => cy.wrap(res.body.access_token).as(isAdmin ? "adminToken" : "token"));
    //   });
      
    //   Cypress.Commands.add("getToken", (isAdmin = false) => {
    //     return cy.get(isAdmin ? "@adminToken" : "@token").then((token) => {
    //       if (token) {
    //         return token;
    //       } else {
    //         return cy.authenticate(isAdmin).then(() => cy.getToken(isAdmin));
    //       }
    //     });
    //   });
      
    //   Cypress.Commands.add("authAndRequest", (requestOptions) => {
    //     cy.getToken().then(token => {
    //       requestOptions.auth = {
    //         bearer: token
    //       };
      
    //       return cy.request(requestOptions);
    //     });
    //   });
      
    //   beforeEach(() => {
    //     cy.wrap(null).as("token");
    //     cy.wrap(null).as("adminToken");
    //     cy.wrap(false).as("isLoggedIn");
    //     cy.wrap(false).as("isServerEnabled");
    //   });

}

module.exports = Auth
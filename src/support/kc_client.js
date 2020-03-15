// from aiautomation import config as cf
import axios from 'axios'
import assert from 'assert'
import settings from 'settings'

class KeyCloak {
    static keycloakSettings(dpIp){
        /**
         * Return a dict with Keycloak settings read from the public Discovery endpoint.
         *Typical answer: {"serverUrl":"http://localhost:8080/auth","clientId":"discovery-backend","realm":"sparkbeyond",
         *   "enabled":true,"sdkClientId":"discovery-sdk"}
         */
        let port = cf.isNginx ? '' : '9000'
        kcSettings = axios.get(`http://${dpIp}:${port}/keycloak/settings`);
        // if the frontchannelUrl parameter is empty in platform.conf
        kcSettings['serverUrl'] = kcSettings['serverUrl'] ? kcSettings['serverUrl'] : `http://${dpIp}/auth`
        return kcSettings
    }

    static createUser(kcSettings, accessToken, realm, username, password, email, firstName, lastName, isAdmin=True){
        let user = this.userRepresentation(username, password, email, firstName, lastName, isAdmin)
        let headers = this.getRequestHeader(accessToken)
        axios.post(new URL(kcSettings.serverUrl, `/auth/admin/realms/${realm}/users`).href, user, {headers: headers})
             .then(function(res) {
                assert(res.status == 201 || res.status == 409)
             })
        let createdUser = this.getUser(kcSettings, username, realm, accessToken)
        if (isAdmin) {
            let response =  axios.get(new URL(kcSettings.serverUrl, `/auth/admin/realms/${realm}/users`), {headers: headers})
            assert(response.statusText == 200)
            for (role of response.data){
                if (role.name == "discovery_admin"){
                    var adminRole = role
                    break
                }
            }
            axios.post(new URL(kcSettings.serverUrl, `/auth/admin/realms/${realm}/users/${createdUser.id}/role-mappings/realm`),
                       adminRole, {headers: headers})
                       .then((res) =>{
                           assert(res.status == 200)
                       })
        }
        if (username.includes("request_runner")){
            this.setRolesForPb(kcSettings, accessToken, realm, createdUser)
        }
    }

    static userRepresentation(username, password, email, firstName, lastName, isAdmin){
        /**
         * Create a user dict compatible with Keycloak API
         * See: https://www.keycloak.org/docs-api/4.6/rest-api/index.html#_userrepresentation
         */
        return {
            "username": username,
            "email": email,
            "emailVerified": true,
            "enabled": true,
            "firstName": firstName,
            "lastName": lastName,
            ...isAdmin && { realmRoles: ["discovery_admin"]},
            "credentials": [{
                "type": "password",
                "value": password,
            }],  
        }
    }

    static getRequestHeader(accessToken){
        return {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    }

    static getUser(kcSettings, username, realm, accessToken){
        let headers = this.getRequestHeader(accessToken)
        axios.get(new URL(kcSettings.serverUrl, `/auth/admin/realms/${realm}/users?briefRepresentation=true&max=500`).href, {headers: headers})
             .then((res) => {
                 assert(res.status == 200)
                 for (user of res.data){
                     if (user.username == username){ return user}
                 }
             })
    }

    static setRolesForPb(kcSettings, accessToken, realm, createdUser){
        let headers = this.getRequestHeader(accessToken)
        var res = axios.get(new URL(kcSettings.serverUrl, `auth/admin/realms/sparkbeyond/clients`).href, {headers: headers})
        assert(res.status == 200)
        for(client of res.data){
            if (client["clientId"] == "eps-public-client"){
                var clientId = client["id"]
                break
            }
        }
        res = axios.get(new URL(kcSettings.serverUrl, `auth/admin/realms/sparkbeyond/clients/${clientId}/roles`).href, {headers: headers})
        assert(res.status == 200)
        var epsRoles = []
        for(client of res.data){
            if(["eps_consumer", "eps_admin"].includes(client["name"])){
                epsRoles.push(client)
            }
        }
        res = axios.post(new URL(kcSettings.serverUrl, `/auth/admin/realms/${realm}/users/${createdUser.id}/role-mappings/clients/${clientId}`).href, epsRoles, {headers: headers})
                   .then(function(res) {
                        assert(res.status == 200 || res.status == 204)
        })
    }

    static authenticate(kcSettings, realm, clientId, username, password, scope=null){
        let data = {
            "client_id": clientId,
            "grant_type": 'password',
            "username": username,
            "password": password,
            "scope": scope,
        } 
        let res = axios.post(new URL(kcSettings.serverUrl, `/auth/realms/${realm}/protocol/openid-connect/token`).href, data, {headers: headers})                    
        assert(res.status == 200)                            
        return res.data
    }

    static getUserToken(dpIp, username){
        let kcSettings = this.keycloakSettings(dpIp)
        let adminCliToken = this.authenticate(kcSettings, realm="master", clientId="admin-cli", username="admin", password=cf.kcPassword)
        let accessToken = adminCliToken.accessToken
        let isAdmin = username == "sdk_runner" ? true : false
        let mailAddress = `${username}@sparkbeyond.com`
        if (!username.includes(".") || !username.includes("_")) username += "."
        username = username.replace(".", "_")
        this.createUser(kcSettings, 
                        accessToken, 
                        cf.realm, 
                        mailAddress, 
                        cd.dpPassword, 
                        mailAddress, 
                        username.split("_")[0], 
                        username.split("_")[1], isAdmin)
        let clientId = username == 'request_runner' ? "eps-consumer-app" : "discovery-sdk"
        return this.authenticate(
            kcSettings=kcSettings,
            realm=cf.realm,
            clientId=clientId,
            username=mailAddress,
            password=cf.dp_password,
            scope='offline_access',
        )
    }   

    static generateRefreshToken(ipAddress, username){
        let username = `${username}@sparkbeyond.com`
        let port = cf.isNginx ? "" : `:${cf.epsPort}`
        var requestHeaders = {"Referer": `http://${ipAddress}${port}/predbox/auth/consumerAppApiKey`}
        let res = axios.get(`${requestHeaders.Referer}?origin=http://${ipAddress}${port}`)
        requestHeaders.Cookie = res.headers.Set-Cookie
        for (i of res.history){
            var locationHeader = i.headers["Location"]
        }
        let actionRes = axios.get(locationHeader, {headers: requestHeaders})
        for (act of actionRes.data.match("/(?<=action=\").{100,350}(?=\" method=\"post)/g")){
            var action = act
        }
        for (i of res.history){
            var location = i.headers["Location"]
        }
        var referer = location.split("/").slice(3,).join("/")
        requestHeaders.Referer = new URL(`http://${ipAddress}/${referer}`)
        requestHeaders.Host = ipAddress.split(":")[0]
        let refreshToken = axios.post(unescape(action),date={"username": username, "password": cf.dpPassword} ,{"headers": requestHeaders})
        return refreshToken.data
    }
}

class DpApiKey{
    constructor(dpIp=null, token=null){
        if (dpIp != null && token == null){
            var offlineToken = KeyCloak.getUserToken(dpIp, "sdk_runner")
            this.dpToken = offlineToken.refresh_token
        }
        else if (token != null){
            this.dpToken = token
        }
    }
}
    

class PbApiKey{
    constructor(dpIp=null, token=null){
        if (dpIp != null && token == null){
            KeyCloak.getUserToken(dpIp, "request_runner")
            this.pbToken = KeyCloak.generateRefreshToken(dpIp, "request_runner")
        }
        else if (token != null){
            this.pbToken = token
        }
    }
}


export { KeyCloak, DpApiKey, PbApiKey }
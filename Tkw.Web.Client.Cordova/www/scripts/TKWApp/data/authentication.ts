module TKWApp.Data {
    // these classes handle authentication for online work
    // we will see how this will work for offline work... probably just not use authentication at all

    /// Authentication token - keeps all token attributes
    export class AuthenticationToken {
        Token: string = null;
        TokenType: string = null;
        ExpiresIn: number = 0;
        Username: string = null;
        UserId: string = null;
        UserType: string = null;
        Culture: string = null;
        IssuedAt: Date = null;
        ExpiresAt: Date = null;
        Roles: string = null;
        Tenant: string = null;

        // create a new token from a token data
        constructor(tokenData: any) {
            this.Token = tokenData.access_token;
            this.Username = tokenData.userName;
            this.Roles = tokenData.roles;
            this.UserType = tokenData.userType;
            this.Tenant = tokenData.tenant;
            // save token to local storage
            window.localStorage.setItem("AuthenticationToken", JSON.stringify(tokenData));
        }

        /// create a token from local storage save
        static fromLocalstorage(): AuthenticationToken {
            var str = window.localStorage.getItem("AuthenticationToken");
            if (!str) return null;
            else {
                var tokenData = JSON.parse(str);
                return new AuthenticationToken(tokenData);
            }
        }

        // returs the token string
        getToken(): string {
            return this.Token;
        }
        getUserName(): string {
            return this.Username;
        }
        getTenant(): string {
            return this.Tenant;
        }
        getUserType(): string {
            return this.UserType;
        }
        dispose() {
            window.localStorage.removeItem("AuthenticationToken");
        }
    }

    /// Authentication manager class - handles authentication and any other operations that need
    /// to set up our system with the authorization tokens.
    export class AuthenticationManagerClass {
        Adapter: TKWApp.Data.JQueryAjaxODATAAdater;
        public AuthenticationToken: AuthenticationToken = null;
        constructor() {
            var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/Token";
            this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
        }

        setDefaultOptions() {
            //TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions.headers["content-type"] = "application/json;charset=UTF-8";
            TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions.headers["Authorization"] = "Bearer " + this.AuthenticationToken.getToken();
        }

        isAuthenticated() {
            if (this.AuthenticationToken == null) {
                this.AuthenticationToken = AuthenticationToken.fromLocalstorage();
                if (this.AuthenticationToken) {
                    this.setDefaultOptions();
                }
            }
            return this.AuthenticationToken != null;
        }

        logOff() {
            if (this.AuthenticationToken) {
                var self = this;
                var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/Logout";
                this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
                this.Adapter.post(null, {
                    headers: {
                        "Authorization": "Bearer " + this.AuthenticationToken.getToken(),
                    }
                }).then((data) => {

                    if (this.AuthenticationToken)
                        this.AuthenticationToken.dispose();
                    else {
                        this.AuthenticationToken = AuthenticationToken.fromLocalstorage();
                        if (this.AuthenticationToken)
                            this.AuthenticationToken.dispose();
                    }
                    TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
                }, (err) => {
                    if (err.status === 401) {
                        TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
                    }
                });

            }
            window.localStorage.removeItem("AuthenticationToken");
            this.AuthenticationToken = null;
        }

        authenticate(username: string, password: string, onSuccessCallback: any, onErrorCallback: any) {
            var token = AuthenticationToken.fromLocalstorage();
            if (token != null) {
                this.AuthenticationToken = token;
                // set the adapter default options
                this.setDefaultOptions();
                if (onSuccessCallback) onSuccessCallback(token);
                return;
            }
            var data : any= {
                "grant_type": "password",
                "username": username,
                "password": password
            };

            var self = this;
            this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(TKWApp.Configuration.ConfigurationManager.ServerUri + "/Token");
            this.Adapter.postWithoutSuffixes(data, {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    }
            }).then((data) => {
                self.AuthenticationToken = new AuthenticationToken(data);
                    // set the adapter default options
                    self.setDefaultOptions();
                    if (onSuccessCallback) onSuccessCallback(self.AuthenticationToken);
                }, (err) => {
                    if (onErrorCallback) onErrorCallback(err);
            });
        }

        resetPasswordRequest(email: string, onSuccessCallback: any, onErrorCallback: any) {
            debugger
            var self = this;
            var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/RequestResetPassword";
            this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
            var ForgotPasswordViewModel = { Email: email }
            this.Adapter.post(ForgotPasswordViewModel).then(
                (succes) => {
                    if (onSuccessCallback)
                        onSuccessCallback(succes);
                    else {
                        alert("Succes");
                    }
                }, (error) => {
                    if (onErrorCallback)
                        onErrorCallback(error);
                    else {
                        alert(JSON.stringify(error));
                    }
                });
        };

        resetPassword(data: any, onSuccessCallback: any, onErrorCallback: any) {
            debugger
            var self = this;
            var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/ResetPassword";
            this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
            this.Adapter.post(data).then(
                (succes) => {
                    if (onSuccessCallback)
                        onSuccessCallback(succes);
                    else {
                        alert("Succes");
                    }
                }, (error) => {
                    if (onErrorCallback)
                        onErrorCallback(error);
                    else {
                        alert(JSON.stringify(error));
                    }
                });
        };

        authenticateRoot(username: string, password: string, onSuccessCallback: any, onErrorCallback: any) {
            if (this.AuthenticationToken)
                this.AuthenticationToken.dispose();
            window.localStorage.removeItem("AuthenticationToken");
            this.AuthenticationToken = null;
            this.authenticate(username, password, onSuccessCallback, onErrorCallback);
        }

        isInRole(role: string): boolean {
            var roles = window.localStorage.getItem("AuthenticationToken");
            if (!roles)
                return false;
            if ((<any>roles).indexOf(role) >= 0)
                return true;
            else
                return false;
        }
    }

    /// Singleton instance of authentication manager - to be used in the site.
    export var AuthenticationManager = new AuthenticationManagerClass();
}


var TKWApp;
(function (TKWApp) {
    var Data;
    (function (Data) {
        // these classes handle authentication for online work
        // we will see how this will work for offline work... probably just not use authentication at all
        /// Authentication token - keeps all token attributes
        var AuthenticationToken = (function () {
            // create a new token from a token data
            function AuthenticationToken(tokenData) {
                this.Token = null;
                this.TokenType = null;
                this.ExpiresIn = 0;
                this.Username = null;
                this.UserId = null;
                this.UserType = null;
                this.Culture = null;
                this.IssuedAt = null;
                this.ExpiresAt = null;
                this.Roles = null;
                this.Tenant = null;
                this.Token = tokenData.access_token;
                this.Username = tokenData.userName;
                this.Roles = tokenData.roles;
                this.UserType = tokenData.userType;
                this.Tenant = tokenData.tenant;
                // save token to local storage
                window.localStorage.setItem("AuthenticationToken", JSON.stringify(tokenData));
            }
            /// create a token from local storage save
            AuthenticationToken.fromLocalstorage = function () {
                var str = window.localStorage.getItem("AuthenticationToken");
                if (!str)
                    return null;
                else {
                    var tokenData = JSON.parse(str);
                    return new AuthenticationToken(tokenData);
                }
            };
            // returs the token string
            AuthenticationToken.prototype.getToken = function () {
                return this.Token;
            };
            AuthenticationToken.prototype.getUserName = function () {
                return this.Username;
            };
            AuthenticationToken.prototype.getTenant = function () {
                return this.Tenant;
            };
            AuthenticationToken.prototype.getUserType = function () {
                return this.UserType;
            };
            AuthenticationToken.prototype.dispose = function () {
                window.localStorage.removeItem("AuthenticationToken");
            };
            return AuthenticationToken;
        })();
        Data.AuthenticationToken = AuthenticationToken;
        /// Authentication manager class - handles authentication and any other operations that need
        /// to set up our system with the authorization tokens.
        var AuthenticationManagerClass = (function () {
            function AuthenticationManagerClass() {
                this.AuthenticationToken = null;
                var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/Token";
                this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
            }
            AuthenticationManagerClass.prototype.setDefaultOptions = function () {
                //TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions.headers["content-type"] = "application/json;charset=UTF-8";
                TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions.headers["Authorization"] = "Bearer " + this.AuthenticationToken.getToken();
            };
            AuthenticationManagerClass.prototype.isAuthenticated = function () {
                if (this.AuthenticationToken == null) {
                    this.AuthenticationToken = AuthenticationToken.fromLocalstorage();
                    if (this.AuthenticationToken) {
                        this.setDefaultOptions();
                    }
                }
                return this.AuthenticationToken != null;
            };
            AuthenticationManagerClass.prototype.logOff = function () {
                var _this = this;
                if (this.AuthenticationToken) {
                    var self = this;
                    var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/Logout";
                    this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
                    this.Adapter.post(null, {
                        headers: {
                            "Authorization": "Bearer " + this.AuthenticationToken.getToken(),
                        }
                    }).then(function (data) {
                        if (_this.AuthenticationToken)
                            _this.AuthenticationToken.dispose();
                        else {
                            _this.AuthenticationToken = AuthenticationToken.fromLocalstorage();
                            if (_this.AuthenticationToken)
                                _this.AuthenticationToken.dispose();
                        }
                        TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
                    }, function (err) {
                        if (err.status === 401) {
                            TKWApp.HardRouting.ApplicationRoutes.redirect("Login");
                        }
                    });
                }
                window.localStorage.removeItem("AuthenticationToken");
                this.AuthenticationToken = null;
            };
            AuthenticationManagerClass.prototype.authenticate = function (username, password, onSuccessCallback, onErrorCallback) {
                var token = AuthenticationToken.fromLocalstorage();
                if (token != null) {
                    this.AuthenticationToken = token;
                    // set the adapter default options
                    this.setDefaultOptions();
                    if (onSuccessCallback)
                        onSuccessCallback(token);
                    return;
                }
                var data = {
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
                }).then(function (data) {
                    self.AuthenticationToken = new AuthenticationToken(data);
                    // set the adapter default options
                    self.setDefaultOptions();
                    if (onSuccessCallback)
                        onSuccessCallback(self.AuthenticationToken);
                }, function (err) {
                    if (onErrorCallback)
                        onErrorCallback(err);
                });
            };
            AuthenticationManagerClass.prototype.resetPasswordRequest = function (email, onSuccessCallback, onErrorCallback) {
                debugger;
                var self = this;
                var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/RequestResetPassword";
                this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
                var ForgotPasswordViewModel = { Email: email };
                this.Adapter.post(ForgotPasswordViewModel).then(function (succes) {
                    if (onSuccessCallback)
                        onSuccessCallback(succes);
                    else {
                        alert("Succes");
                    }
                }, function (error) {
                    if (onErrorCallback)
                        onErrorCallback(error);
                    else {
                        alert(JSON.stringify(error));
                    }
                });
            };
            ;
            AuthenticationManagerClass.prototype.resetPassword = function (data, onSuccessCallback, onErrorCallback) {
                debugger;
                var self = this;
                var getTokenUri = TKWApp.Configuration.ConfigurationManager.ServerUri + "/api/niv/Account/ResetPassword";
                this.Adapter = new TKWApp.Data.JQueryAjaxODATAAdater(getTokenUri);
                this.Adapter.post(data).then(function (succes) {
                    if (onSuccessCallback)
                        onSuccessCallback(succes);
                    else {
                        alert("Succes");
                    }
                }, function (error) {
                    if (onErrorCallback)
                        onErrorCallback(error);
                    else {
                        alert(JSON.stringify(error));
                    }
                });
            };
            ;
            AuthenticationManagerClass.prototype.authenticateRoot = function (username, password, onSuccessCallback, onErrorCallback) {
                if (this.AuthenticationToken)
                    this.AuthenticationToken.dispose();
                window.localStorage.removeItem("AuthenticationToken");
                this.AuthenticationToken = null;
                this.authenticate(username, password, onSuccessCallback, onErrorCallback);
            };
            AuthenticationManagerClass.prototype.isInRole = function (role) {
                var roles = window.localStorage.getItem("AuthenticationToken");
                if (!roles)
                    return false;
                if (roles.indexOf(role) >= 0)
                    return true;
                else
                    return false;
            };
            return AuthenticationManagerClass;
        })();
        Data.AuthenticationManagerClass = AuthenticationManagerClass;
        /// Singleton instance of authentication manager - to be used in the site.
        Data.AuthenticationManager = new AuthenticationManagerClass();
    })(Data = TKWApp.Data || (TKWApp.Data = {}));
})(TKWApp || (TKWApp = {}));
//# sourceMappingURL=authentication.js.map
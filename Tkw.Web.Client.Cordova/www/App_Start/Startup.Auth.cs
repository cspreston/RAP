using BusinessObjects;
using Common;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using Web.Client.Net.Providers;

namespace Web.Client.Net
{
    public partial class Startup
    {
        public static OAuthAuthorizationServerOptions OAuthOptions { get; private set; }
        public static string PublicClientId { get; private set; }

       public void ConfigureAuth(IAppBuilder app)
       {

           //app.UseCookieAuthentication(new CookieAuthenticationOptions
           //{
           //    AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
           //    LoginPath = new PathString("/Auth/Account/Login"),
           //    CookieName = "MMM",
           //    SlidingExpiration = true,
           //    ExpireTimeSpan = System.TimeSpan.FromMinutes(20),
           //    Provider = new CookieAuthenticationProvider
           //    {
           //        OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<UserManager, User>(
           //            validateInterval: TimeSpan.FromMinutes(20),
           //            regenerateIdentity: (manager, user) => user.GenerateUserIdentityAsync(manager, DefaultAuthenticationTypes.ApplicationCookie)),
           //    },
           //});
           //app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

           // Enables the application to remember the second login verification factor such as phone or email.
           // Once you check this option, your second step of verification during the login process will be remembered on the device where you logged in from.
           // This is similar to the RememberMe option when you log in.
           app.UseTwoFactorRememberBrowserCookie(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);

           // Configure the application for OAuth based flow
           PublicClientId = "self";
           app.UseOAuthBearerTokens(new OAuthAuthorizationServerOptions
           {
               TokenEndpointPath = new PathString("/Token"),
               Provider = new ApplicationOAuthProvider(PublicClientId),
               AuthorizeEndpointPath = new PathString("/api/Account/ExternalLogin"),
               AccessTokenExpireTimeSpan = TimeSpan.FromDays(14),
               AllowInsecureHttp = true
           });

           // Enable the application to use bearer tokens to authenticate users
           app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
        }
    }
}
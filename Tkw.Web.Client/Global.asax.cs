using System.Diagnostics.Tracing;
using System.Web.Configuration;
using Common.Domain;
using Elmah;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.SessionState;
using Tools.Logger;
using Tools.Common;
using Tools;
using Microsoft.Practices.EnterpriseLibrary.SemanticLogging;
using Web.Client.Net;
using Web.Client.Net.Code;
using BusinessObjects;
using System.Web.Http.ModelBinding;
using System.Security.Claims;
using Newtonsoft.Json.Serialization;

namespace Web.Client.Net
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            HtmlHelper.ClientValidationEnabled = true;
            HtmlHelper.UnobtrusiveJavaScriptEnabled = true;
            this.SetJsonConfiguration();
            MvcHandler.DisableMvcResponseHeader = true;
#if DEBUG
            StackExchange.Profiling.MiniProfiler.Settings.SqlFormatter = new StackExchange.Profiling.SqlFormatters.InlineFormatter();
            StackExchange.Profiling.EntityFramework6.MiniProfilerEF6.Initialize();
#endif
        }

        protected void Application_BeginRequest()
        {
#if DEBUG
            StackExchange.Profiling.MiniProfiler.Start();
#endif
            if (Context.Request.FilePath == Context.Request.ApplicationPath) Context.RewritePath("index.html");
            if (Context.Request.FilePath.EndsWith("/dashboard")) Context.RewritePath("dashboard.html");
            if (Context.Request.FilePath.EndsWith("/login")) Context.RewritePath("login.html");
            if (Context.Request.FilePath.EndsWith("/building")) Context.RewritePath("building.html");
            if (Context.Request.FilePath.EndsWith("/site")) Context.RewritePath("site.html");
            if (Context.Request.FilePath.EndsWith("/plan")) Context.RewritePath("plan.html");
            if (Context.Request.FilePath.EndsWith("/plan-edit")) Context.RewritePath("plan-edit.html");
            if (Context.Request.FilePath.EndsWith("/copy-site")) Context.RewritePath("copy-site.html");
            if (Context.Request.FilePath.EndsWith("/plan-bulk-create")) Context.RewritePath("plan-bulk-create.html");
            if (Context.Request.FilePath.EndsWith("/filemanager")) Context.RewritePath("filemanager.html");
            if (Context.Request.FilePath.EndsWith("/reset-password")) Context.RewritePath("reset-password.html");
        }

        protected void Application_AcquireRequestState(object sender, EventArgs e)
        {
            if (Request.Url.Segments.Count() > 1 && Request.Url != null && !Request.Url.LocalPath.ToLower().Contains("auth/account/login")  && !Tools.DefaultValues.ExceptUrls.Contains(Request.Url.Segments[1].ToLower().TrimEnd('/')))
            { 
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                if (principal.Identity.IsAuthenticated)
                {
                        ValidateSession(principal);
                }
                if (HttpContext.Current != null && HttpContext.Current.Session != null)
                {
                    if (System.Web.HttpContext.Current.Session[Tools.DefaultValues.SESSION_USERCULTURE] == null)
                    {
                        using (var helper = new Tools.Helper())
                        {
                            CultureInfo cultureInfo = CultureInfo.GetCultureInfo(helper.GetCurrentCulture());
                            System.Web.HttpContext.Current.Session[Tools.DefaultValues.SESSION_USERCULTURE] = cultureInfo;
                        }
                    }
                    System.Threading.Thread.CurrentThread.CurrentCulture = System.Web.HttpContext.Current.Session[Tools.DefaultValues.SESSION_USERCULTURE] as CultureInfo;
                }
            }
      }

        protected void Application_EndRequest()
        {
#if DEBUG
            StackExchange.Profiling.MiniProfiler.Stop();
#endif
        }

        void Application_AuthenticateRequest(Object sender, EventArgs e)
        {
            HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
        }
        void Application_PostAuthenticateRequest(Object sender, EventArgs e)
        {
        }

        protected void Application_PostAuthorizeRequest()
        {
            HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
        }

        public void ErrorLog_Filtering(object sender, ExceptionFilterEventArgs e)
        {
            var httpException = e.Exception as HttpException;
            if (httpException != null && httpException.GetHttpCode() == 404)
            {
                e.Dismiss();
            }
        }

        private void SetJsonConfiguration()
        {
            //var json = GlobalConfiguration.Configuration.Formatters.JsonFormatter;
            //json.SerializerSettings.Formatting = Newtonsoft.Json.Formatting.Indented;
            //json.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
            //json.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.Objects;
            //json.SerializerSettings.DateFormatHandling = Newtonsoft.Json.DateFormatHandling.MicrosoftDateFormat;
            //json.SerializerSettings.Culture = Thread.CurrentThread.CurrentCulture;
            //json.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
        }

        protected void Application_Error()
        {
           // var exception = Server.GetLastError();

           // //Click2PayEventSource.Log.Failure(exception.GetFullInfo());

           // var httpException = exception as HttpException;
           // Response.Clear();
           // Server.ClearError();
           // var routeData = new RouteData();
           // routeData.Values["controller"] = "CustomErrorController";
           // routeData.Values["action"] = "GenericError";
           // routeData.Values["exception"] = exception;
           //// Response.StatusCode = 500;
           // if (httpException != null)
           // {
           //     Response.StatusCode = httpException.GetHttpCode();
           //     switch (Response.StatusCode)
           //     {
           //         case 403:
           //             routeData.Values["action"] = "Http403";
           //             break;
           //         case 404:
           //             routeData.Values["action"] = "Http404";
           //             break;
           //     }
           // }

           // IController errorsController = new Web.Client.Net.Controllers.CustomErrorController();
           // var rc = new RequestContext(new HttpContextWrapper(Context), routeData);
           // errorsController.Execute(rc);
        }

        public override void Dispose()
        {
            base.Dispose();
        }

        protected void Session_Start(object sender, EventArgs e)
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal.Identity.IsAuthenticated)
            {
                string sessionId = principal.Claims.Any(x => x.Type == "SessionId") ? principal.Claims.FirstOrDefault(x => x.Type == "SessionId").Value : string.Empty;
                var userId = principal.Claims.Any(x => x.Type == "UserId") ? principal.Claims.FirstOrDefault(x => x.Type == "UserId").Value : string.Empty;

                Application.SetApplicationState("UserSession", userId + "#" + sessionId);
            }
        }

        protected void Session_End(object sender, EventArgs e)
        {
        }

        private void ValidateSession(ClaimsPrincipal principal)
        {
            string lastSessionId = principal.Claims.Any(x => x.Type == "SessionId") ? principal.Claims.FirstOrDefault(x => x.Type == "SessionId").Value : string.Empty;
            var userId = principal.Claims.Any(x => x.Type == "UserId") ? principal.Claims.FirstOrDefault(x => x.Type == "UserId").Value : string.Empty;
            if (principal.Identity.IsAuthenticated && Request.Url != null && !Request.Url.LocalPath.ToLower().Contains("home/sessionend"))
            {
                var applicationSession = Application.GetSetApplicationState(userId);
                if (applicationSession == null)
                    Application.SetApplicationState(userId, lastSessionId);
                else if (applicationSession != null && lastSessionId != applicationSession.ToString())
                {
                    using (var service = new Common.Service())
                    {
                        var userSessionService = service.GetService<Common.Core.IUserSessionService>();
                        var currentSession = userSessionService.GetAll().FirstOrDefault(x => x.UserId == userId && x.LoggedIn);
                        if (currentSession == null)
                        {
                            Response.Redirect("~/Home/SessionEnd");
                        }
                        else if (currentSession.SessionId != lastSessionId.ToString())
                        {
                            Application.SetApplicationState(userId, currentSession.SessionId);
                            if (System.Web.HttpContext.Current.Session == null)
                            {
                                Response.Redirect("~/Home/SessionEnd");
                            }
                            else
                            {
                                System.Web.HttpContext.Current.Session["SessionEnd"] = currentSession;
                                Response.Redirect("~/Home/SessionEnd");
                            }
                        }
                        else
                        {
                            Application.SetApplicationState(userId, currentSession.SessionId);
                        }
                    }
                }
            }
            else if (Request.Url != null && !Request.Url.LocalPath.ToLower().Contains("home/sessionend"))
            {
                Application.RemoveApplicationState(userId);
            }
        }
    }
}
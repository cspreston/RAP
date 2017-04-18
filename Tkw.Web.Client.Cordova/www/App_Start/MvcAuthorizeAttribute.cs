using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace Web.Client.Net
{
    public class MvcAuthorizeAttribute : System.Web.Mvc.AuthorizeAttribute
    {
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (!principal.IsInRole(Tools.DefaultValues.ROLE_ROOT))
            {
                var context = filterContext.HttpContext;
                var request = context.Request;
                var response = context.Response;
                if (!request.IsAjaxRequest() && request.Url.Segments.Count() > 1 &&
                    !request.Url.PathAndQuery.ToLower().Contains("account") &&
                    !request.Url.PathAndQuery.ToLower().Contains("home") &&
                    !request.Url.PathAndQuery.ToLower().Contains("error") &&
                    !request.Url.PathAndQuery.ToLower().Contains("registertenant") &&
                    !request.Url.PathAndQuery.ToLower().Contains("forgotpassword") &&
                    !request.Url.PathAndQuery.ToLower().Contains("resetpassword") &&
                    !request.Url.PathAndQuery.ToLower().Contains("sessionend") &&
                     !request.Url.PathAndQuery.ToLower().Contains("help"))
                {
                    base.OnAuthorization(filterContext);
                }
            }
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            var authroized = base.AuthorizeCore(httpContext);
            if (!authroized)
                return false;
            return true;
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            var context = filterContext.HttpContext;
            var request = context.Request;
            if (!request.IsAuthenticated)
            {
                UrlHelper urlHelper = new UrlHelper(filterContext.RequestContext);
                filterContext.Result = new RedirectResult(urlHelper.Action("Login", "Account", new { Area = "Auth" }));
            }
            else
            {
                UrlHelper urlHelper = new UrlHelper(filterContext.RequestContext);
                filterContext.Result = new RedirectResult(urlHelper.Action("Login", "Account", new { Area = "" }));
            }
        }
    }
}
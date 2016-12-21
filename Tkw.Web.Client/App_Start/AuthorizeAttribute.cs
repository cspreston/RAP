using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using Web.Client.Net.Areas.Auth.Models;
using System.Web.Mvc;

namespace Web.Client.Net
{
    public class AuthorizeAttribute : System.Web.Http.AuthorizeAttribute
    {
        protected override bool IsAuthorized(HttpActionContext actionContext)
        {
            if (actionContext == null)
            {
                throw new ArgumentNullException("actionContext");
            }
            if (SkipAuthorization(actionContext))
            {
                return true;
            }
            return base.IsAuthorized(actionContext);
        }

        protected override void HandleUnauthorizedRequest(HttpActionContext actionContext)
        {
            base.HandleUnauthorizedRequest(actionContext);
        }

        private bool SkipAuthorization(HttpActionContext actionContext)
        {
            using (var helper = new Tools.Helper())
            {
                return helper.IsRoot();
            }
        }
    }
}

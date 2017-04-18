using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;

namespace Web.Client.Net
{
    public class DelegatingHandler : System.Net.Http.DelegatingHandler
    {
        protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            //if (!request.RequestUri.AbsolutePath.ToLower().Contains("initializeapplication"))
            //{
            //    bool isCsrf = true;
            //    try
            //    {
            //        ValidateRequestHeader(request);
            //        isCsrf = false;
            //    }
            //    catch (Exception ex)
            //    {
            //        return request.CreateResponse(HttpStatusCode.Forbidden);
            //    }
            //    if (isCsrf)
            //    {
            //        return request.CreateResponse(HttpStatusCode.Forbidden);
            //    }
            //}
            return await base.SendAsync(request, cancellationToken);
        }

        void ValidateRequestHeader(HttpRequestMessage request)
        {
            string cookieToken = "";
            string formToken = "";

            IEnumerable<string> tokenHeaders;
            if (request.Headers.TryGetValues("RequestVerificationToken", out tokenHeaders))
            {
                string[] tokens = tokenHeaders.First().Split(':');
                if (tokens.Length == 2)
                {
                    cookieToken = tokens[0].Trim();
                    formToken = tokens[1].Trim();
                }
            }
            AntiForgery.Validate(cookieToken, formToken);
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Dispatcher;

namespace Web.Client.Net
{
    public class ApiControllerSelector : DefaultHttpControllerSelector
    {
        private HttpConfiguration _config;
        public ApiControllerSelector(HttpConfiguration config)
            : base(config)
        {
            _config = config;
        }

        public override HttpControllerDescriptor SelectController(HttpRequestMessage request)
        {
            var controllers = GetControllerMapping(); //Will ignore any controls in same name even if they are in different namepsace

            var routeData = request.GetRouteData();

            var controllerName = routeData.Values["controller"] != null ? routeData.Values["controller"].ToString() : null;
            if (controllerName == null)
            {
                return null;
            }
            HttpControllerDescriptor controllerDescriptor;

            if (controllers.TryGetValue(controllerName, out controllerDescriptor))
            {
                var versionedControllerName = GetVersionFromAcceptHeaderVersion(request);
                HttpControllerDescriptor versionedControllerDescriptor;
                if (controllers.TryGetValue(controllerName + versionedControllerName, out versionedControllerDescriptor))
                {
                    return versionedControllerDescriptor;
                }
                return controllerDescriptor;
            }
            return null;
        }

        private string GetVersionFromAcceptHeaderVersion(HttpRequestMessage request)
        {
            var acceptHeader = request.Headers.Accept;

            foreach (var mime in acceptHeader)
            {
                if (mime.MediaType == "application/json")
                {
                    var version = mime.Parameters
                    .Where(v => v.Name.Equals("version", StringComparison.OrdinalIgnoreCase)).FirstOrDefault();

                    if (version != null)
                    {
                        return version.Value;
                    }
                    return "";
                }
            }
            return "";
        }
    }
}
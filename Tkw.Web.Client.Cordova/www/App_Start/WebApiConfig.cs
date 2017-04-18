using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.ModelBinding;
using System.Web.Http.Dispatcher;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;

namespace Web.Client.Net
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            //Web API configuration and services

            //Configure Web API to use only bearer token authentication, please uncomment bellow line
            //config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));
            // Web API routes
            config.MapHttpAttributeRoutes();
            config.EnableCors();
            config.Routes.MapHttpRoute(
                name: "API Area Default",
                routeTemplate: "api/niv/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            //config.Formatters.JsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            //register custom web api filters
            config.Filters.Add(new AuthorizeAttribute());
            config.MessageHandlers.Add(new DelegatingHandler());
            config.Services.Replace(typeof(IExceptionHandler), new GlobalExceptionHandler());
            config.AddODataQueryFilter();
            var appXmlType = config.Formatters.XmlFormatter.SupportedMediaTypes.FirstOrDefault(t => t.MediaType == "application/xml");
            config.Formatters.XmlFormatter.SupportedMediaTypes.Remove(appXmlType);

            //config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(new Web.Client.Net.Code.DateTimeConvertor());
            //config.Formatters.JsonFormatter.SerializerSettings.Converters.Add(new Web.Client.Net.Code.DecimalConverter());
            //config.Services.Replace(typeof(IHttpControllerSelector), new ApiControllerSelector((config)));
        }
    }
}

using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Web.Client.Net.Areas;
using Common.Core;
using Common.Domain;
using Common;


namespace Web.Client.Net.Controllers
{
    [RoutePrefix("api/home")]
    [AllowAnonymous]
    public class HomeController : BaseApiController
    {

        [HttpGet]
        public IHttpActionResult InitializeApplication()
        {
            return Ok();
        }

        [HttpGet]
        public IHttpActionResult Index()
        {

            return Redirect("Index.html");
        }

    }
}
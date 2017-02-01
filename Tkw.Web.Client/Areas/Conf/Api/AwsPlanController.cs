using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace Web.Client.Net.Areas.Conf.Api
{
    [AllowAnonymous]
    public class AwsPlanController : BaseApiController
    {
        [HttpPost]
        public async Task<HttpResponseMessage> AddPlan(dynamic fileInfo)
        {
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
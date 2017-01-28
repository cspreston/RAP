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
    public class AwsFileController : BaseApiController
    {
        [HttpPost]
        public async Task<HttpResponseMessage> Post()
        {
            return Request.CreateResponse(HttpStatusCode.OK);
        }
    }
}
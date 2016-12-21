using BusinessObjects;
using Common;
using Common.Core;
using Common.Domain;
using Common.Independent;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;
using System.Xml;
using System.Xml.Linq;
using WebApi.OutputCache.V2;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class HotspotActionTypeController : BaseApiController
    {
        /// <summary>
        /// Return all the Building from the database with IsActive=true
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<HotspotActionTypeDto>> GetAll()
        {
            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotActionTypeService>())
            {
                var result = serviceManager.GetAll().Where(a => a.IsActive)
                    .Select(a => new HotspotActionTypeDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Description = a.Description
                    });

                return result;
            }       
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using BusinessObjects;
using Common;
using Common.Domain;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class AwsPricingInfoController : BaseApiController
    {
        [ResponseType(typeof(IList<PricingInfoDto>))]
        public async Task<IHttpActionResult> Post([FromBody] IList<PricingInfo> pricingInfo)
        {
            try
            {
                var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>();
                var newInfos = new List<PricingInfo>();

                foreach (var info in pricingInfo)
                {
                    PricingInfo newInfo = serviceManager.Create();

                    newInfo.Id = Guid.NewGuid().ToString();
                    newInfo.BuildingId = info.BuildingId;
                    newInfo.Name = info.Name;
                    newInfo.Description = info.Description;
                    newInfo.UnitPrice = info.UnitPrice;
                    newInfo.Quantity = info.Quantity;
                    newInfo.Units = info.Units;

                    await serviceManager.AddAsync(newInfo);

                    newInfos.Add(newInfo);
                }

                var response = newInfos.Select(e => new PricingInfoDto()
                {
                    Id = e.Id,
                    BuildingId = e.BuildingId,
                    Name = e.Name,
                    Description = e.Description,
                    UnitPrice = e.UnitPrice,
                    Quantity = e.Quantity,
                    Units = e.Units
                });

                return Ok(response.ToList());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
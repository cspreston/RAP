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
    public class PricingInfoController : BaseApiController
    {
        /// <summary>
        /// Gets all pricing infoes for a specified building.
        /// </summary>
        /// <param name="buildingId"></param>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<PricingInfoDto>> GetAll(/*string buildingId*/)
        {
            //if (buildingId == null) return null;

            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>())
            {
                var result = serviceManager.GetAll().Where(a => a.IsActive).
                       //Where(a => a.BuildingId == buildingId).
                       Select(a => new PricingInfoDto
                       {
                           BuildingId = a.BuildingId,
                           Id = a.Id,
                           Description = a.Description,
                           Name = a.Name,
                           Quantity = a.Quantity,
                           UnitPrice = a.UnitPrice,
                           Units = a.Units
                       });
                return result;
            }
                
        }

        /// <summary>
        /// Get the pricing info with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [EnableQuery]
        [ResponseType(typeof(PricingInfoDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>())
                {
                    var result = await serviceManager.GetAll().Where(a => a.IsActive)
                            .Select(a => new PricingInfoDto
                            {
                                BuildingId = a.BuildingId,
                                Id = a.Id,
                                Description = a.Description,
                                Name = a.Name,
                                Quantity = a.Quantity,
                                UnitPrice = a.UnitPrice,
                                Units = a.Units
                            }).FirstOrDefaultAsync(a => a.Id == id);
                    if (result == null)
                    {
                        return BadRequest("Item not found");
                    }
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Modify the pricing info.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(PricingInfoDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] PricingInfoDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>())
                {
                    PricingInfo pi = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);

                    pi.Name = dto.Name;
                    pi.Quantity = dto.Quantity;
                    pi.UnitPrice = dto.UnitPrice;
                    pi.Description = dto.Description;
                    pi.BuildingId = dto.BuildingId;
                    pi.Units = dto.Units;


                    await serviceManager.UpdateAsync(pi);

                    dto = await serviceManager.GetAll().Where(a => a.IsActive).
                        //Where(a => a.BuildingId == buildingId).
                        Select(a => new PricingInfoDto
                        {
                            BuildingId = a.BuildingId,
                            Id = a.Id,
                            Description = a.Description,
                            Name = a.Name,
                            Quantity = a.Quantity,
                            UnitPrice = a.UnitPrice,
                            Units = a.Units
                        }).FirstOrDefaultAsync(c => c.Id == id);
                    
                    if (dto == null)
                    {
                        return BadRequest("Item not found");
                    }
                    return Ok(dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Creates a new Pricing Info object from the request 
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] PricingInfoDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>())
                {
                    if (dto != null)
                    {
                        PricingInfo pi = serviceManager.Create();
                        pi.Id = Guid.NewGuid().ToString();
                        pi.BuildingId = dto.BuildingId;
                        pi.Name = dto.Name;
                        pi.Description = dto.Description;
                        pi.Quantity = dto.Quantity;
                        pi.UnitPrice = dto.UnitPrice;
                        pi.Units = dto.Units;

                        await serviceManager.AddAsync(pi);
                        dto.Id = pi.Id;
                        return Created<PricingInfoDto>(Request.RequestUri, dto);
                    }
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>())
                {
                    PricingInfo pi = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(c => c.Id == id);
                    
                    await serviceManager.SetDeletedAsync(pi);
                    if (pi == null)
                    {
                        return NotFound();
                    }
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
        
        [HttpPost]
        [ResponseType(typeof(IList<PricingInfoDto>))]
        public async Task<IHttpActionResult>  PostFile()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return BadRequest("Unsupported Media Type");
            try
            {
                string root = HttpContext.Current.Server.MapPath("~/App_Data");
                var provider = new MultipartFormDataStreamProvider(root);
                await Request.Content.ReadAsMultipartAsync(provider);

                // Get the needed dates.
                string buildingId = provider.FormData["BuildingId"];
                string fileName = provider.FormData["Name"];

                var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>();

                var destinationDirectory = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + "/" + "ExcelFiles" + "/" + buildingId + "/" + fileName.Substring(0, fileName.LastIndexOf('.')));
                if (!System.IO.Directory.Exists(destinationDirectory))
                    System.IO.Directory.CreateDirectory(destinationDirectory);
                var destinationPath = destinationDirectory + "/" + fileName;
                if (File.Exists(destinationPath))
                    File.Delete(destinationPath);

                foreach (MultipartFileData fileData in provider.FileData)
                    File.Move(fileData.LocalFileName, destinationPath);
                var response = await serviceManager.ImportFromFile(buildingId, destinationPath);

                File.Delete(destinationPath);

                return Ok(response);
            }
            catch (System.Exception e)
            {
                return BadRequest(e.InnerException.ToString());
            }
        }
    }
}
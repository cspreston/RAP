
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
    using BusinessObjects;
    [Authorize]
    public class ClientController : BaseApiController
    {

        /// <summary>
        /// Return all the Clients from the database.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IList<ClientDto>> GetAll()
        {  
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var result = await serviceManager.GetService<IActorService>().GetAll().Where(x => x.IsActive)
                                      .Where(x => x.Type == ActorType.Company )
                                      .OrderBy(x => x.Name).Select(a => new ClientDto
                                      {
                                          Id = a.Id,
                                          ActorId = a.Id,
                                          FirstName = a.Name
                                      }).ToListAsync();
                return result;
            }  
        }

        /// <summary>
        /// Get Client with specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(ClientDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var clientManager = new Service(DataBaseId, UserId).GetService<IClientService>())
                {
                    var result = await clientManager.GetAll().Include("Actor").Where(a => a.IsActive)
                        .Select(a => new ClientDto
                        {
                            Id = a.Id,
                            ActorId = a.ActorId,
                            Address = a.Address,
                            Email = a.Email,
                            Fax = a.Fax,
                            FirstName = a.FirstName,
                            LastName = a.LastName,
                            PhoneNumber = a.PhoneNumber,
                            Actor = new ActorDto()
                            {
                                Id = a.Actor.Id,
                                Type = a.Actor.Type,
                                Name = a.Actor.Name
                            }
                        }).FirstOrDefaultAsync(a => a.Id == id);

                    if (result == null)
                    {
                        return BadRequest("Item not found");
                    }
                    else
                    {
                        return Ok(result);
                    }
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));

        }

        /// <summary>
        /// Modify the client with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(ClientDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] ClientDto dto)
        {
            if (ModelState.IsValid)
            {

                using (var clientService = new Service(DataBaseId, UserId).GetService<IClientService>())
                {
                    Client cl = await clientService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);

                    if (cl == null)
                    {
                        return BadRequest("Item not found");
                    }
                    cl.ActorId = dto.ActorId;
                    cl.Address = dto.Address;
                    cl.Email = dto.Email;
                    cl.Fax = dto.Fax;
                    cl.FirstName = dto.FirstName;
                    cl.LastName = dto.LastName;

                    await clientService.UpdateAsync(cl);

                    var result = await clientService.GetAll().Include("Actor").Where(a => a.IsActive)
                        .Select(a => new ClientDto
                        {
                            Id = a.Id,
                            ActorId = a.ActorId,
                            Address = a.Address,
                            Email = a.Email,
                            Fax = a.Fax,
                            FirstName = a.FirstName,
                            LastName = a.LastName,
                            PhoneNumber = a.PhoneNumber,
                            Actor = new ActorDto()
                            {
                                Id = a.Actor.Id,
                                Type = a.Actor.Type,
                                Name = a.Actor.Name
                            }
                        }).FirstOrDefaultAsync(a => a.Id == id);
                    if (result == null)
                    {
                        return BadRequest("Item not found");
                    }
                    else
                    {
                        return Ok(result);
                    }
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Add a new client to the database.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] ClientDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var clientService = new Service(DataBaseId, UserId).GetService<IClientService>())
                {

                    Client cl = clientService.Create();

                    cl.Id = Guid.NewGuid().ToString();
                    cl.ActorId = dto.ActorId;
                    cl.Address = dto.Address;
                    cl.Email = dto.Email;
                    cl.Fax = dto.Fax;
                    cl.LastName = dto.LastName;
                    cl.FirstName = dto.FirstName;
                    cl.PhoneNumber = dto.PhoneNumber;


                    await clientService.AddAsync(cl);
                    dto.Id = cl.Id;
                    return Created<ClientDto>(Request.RequestUri, dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Delete the client with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {

                using (var clientController = new Service(DataBaseId, UserId).GetService<IClientService>())
                {
                    var serviceManager = new Service(DataBaseId, UserId);
                    var serviceBuildings = new Service(DataBaseId, UserId).GetService<IBuildingService>();

                    Client cl = await clientController.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
                    if (cl == null)
                    {
                        return NotFound();
                    }
                    var ActorBuildings = serviceBuildings.GetAll().Where(a => a.IsActive).Where(a => a.ActorId == id).Include("BuildingImages").
                        Include("BuildingFiles").Include("BuildingDisasterInfos").Include("BuildingPlans").ToList();

                    await clientController.SetDeletedAsync(cl);
                    foreach (var building in ActorBuildings)
                    {
                        await serviceBuildings.SetDeletedAsync(building);
                    }
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));

        }
    }
}
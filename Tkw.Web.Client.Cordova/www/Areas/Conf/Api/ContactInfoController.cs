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
    public class ContactInfoController : BaseApiController
    {
        /// <summary>
        /// Gets all contacts infoes for a specified building.
        /// </summary>
        /// <param name="buildingId"></param>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<ContactInfoDto>> GetAll(/*string buildingId*/)
        {
            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>())
            {
                var result = serviceManager.GetAll().Where(a => a.IsActive).
                    //Where(a => a.BuildingId == buildingId).
                    Select(a => new ContactInfoDto
                    {
                        BuildingId = a.BuildingId,
                        Id = a.Id,
                        Title = a.Title,
                        FirstName = a.FirstName,
                        LastName = a.LastName,
                        EmailAddress = a.EmailAddress,
                        MobilePhone = a.MobilePhone,
                        Phone = a.Phone,
                        Role = a.Role,
                        Address = a.Address,
                        City = a.City,
                        SecondAddress = a.SecondAddress,
                        State = a.State,
                        Zip = a.Zip
                    });
                return result;
            }      
        }

        /// <summary>
        /// Return the ContactInfo with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(ContactInfoDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {

                using (var contactInfoService = new Service(DataBaseId, UserId).GetService<IContactInfoService>())
                {

                    var result = await contactInfoService.GetAll().Where(a => a.IsActive)
                        .Select(a => new ContactInfoDto
                        {
                            BuildingId = a.BuildingId,
                            Id = a.Id,
                            Title = a.Title,
                            FirstName = a.FirstName,
                            LastName = a.LastName,
                            EmailAddress = a.EmailAddress,
                            MobilePhone = a.MobilePhone,
                            Phone = a.Phone,
                            Role = a.Role,
                            Address = a.Address,
                            City = a.City,
                            SecondAddress = a.SecondAddress,
                            State = a.State,
                            Zip = a.Zip
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
        /// Modify the specified ContactInfo with the dates from the given dto.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(ContactInfoDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] ContactInfoDto dto)
        {

            if (ModelState.IsValid)
            {
                using (var contactInfoService = new Service(DataBaseId, UserId).GetService<IContactInfoService>())
                {
                    ContactInfo ci = await contactInfoService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(c => c.Id == id);

                    if (ci == null)
                    {
                        return BadRequest("Item not found");
                    }
                    ci.Address = dto.Address;
                    ci.SecondAddress = dto.SecondAddress;
                    ci.BuildingId = dto.BuildingId;
                    ci.EmailAddress = dto.EmailAddress;
                    ci.FirstName = dto.FirstName;
                    ci.LastName = dto.LastName;
                    ci.Phone = dto.Phone;
                    ci.Role = dto.Role;
                    ci.MobilePhone = dto.MobilePhone;
                    ci.Title = dto.Title;
                    ci.City = dto.City;
                    ci.State = dto.State;
                    ci.Zip = dto.Zip;

                    await contactInfoService.UpdateAsync(ci);

                    var result = await contactInfoService.GetByIdAsync(new object[] { id });
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
        /// Creates a new Contact Info object from the request body dto.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] ContactInfoDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>())
                {

                    ContactInfo ci = serviceManager.Create();
                    ci.Id = Guid.NewGuid().ToString();
                    ci.BuildingId = dto.BuildingId;
                    ci.Title = dto.Title;
                    ci.FirstName = dto.FirstName;
                    ci.LastName = dto.LastName;
                    ci.EmailAddress = dto.EmailAddress;
                    ci.MobilePhone = dto.MobilePhone;
                    ci.Phone = dto.Phone;
                    ci.Address = dto.Address;
                    ci.SecondAddress = dto.SecondAddress;
                    ci.Role = dto.Role;
                    ci.City = dto.City;
                    ci.State = dto.State;
                    ci.Zip = dto.Zip;

                    await serviceManager.AddAsync(ci);
                    dto.Id = ci.Id;
                    return Created<ContactInfoDto>(Request.RequestUri, dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }


        /// <summary>
        /// Delete the Contact Info with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>())
                {
                    ContactInfo ci = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(c => c.Id == id);

                    if (ci == null)
                    {
                        return NotFound();
                    }
                    await serviceManager.SetDeletedAsync(ci);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }


        [HttpPost]
        [ResponseType(typeof(IList<ContactInfoDto>))]
        public async Task<IHttpActionResult> PostFile()
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

                var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>();

                var destinationDirectory= HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + "/" + "ExcelFiles" + "/"+buildingId + "/" + fileName.Substring(0, fileName.LastIndexOf('.')));
                if (!System.IO.Directory.Exists(destinationDirectory))
                    System.IO.Directory.CreateDirectory(destinationDirectory);
                var destinationPath = destinationDirectory + "/" + fileName;
                if (File.Exists(destinationPath))
                    File.Delete(destinationPath);

                foreach (MultipartFileData fileData in provider.FileData)
                    File.Move(fileData.LocalFileName, destinationPath);

               var response= await serviceManager.ImportFromFile(buildingId, destinationPath);

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
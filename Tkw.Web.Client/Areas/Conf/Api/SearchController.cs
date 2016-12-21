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
    public class SearchController : BaseApiController
    {
        /// <summary>
        /// Get the BuildingPlan with the specified id.
        /// </summary>
        /// <param name="searchText"></param>
        /// <returns></returns>
        [EnableQuery]
        [ResponseType(typeof(SearchResultDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    string searchText = id;
                    SearchResultDto dto = new SearchResultDto();
                    // get buildings
                    var buildings = await serviceManager.GetService<IBuildingService>().GetAll()
                                                        .Include(x => x.ActorBuildingPermissions)
                                                        .Include(x => x.Actor)
                                                        .Include(x => x.ContactInfo)
                                                        .Include("BuildingImages.File.FileBucket")
                                                        .Include("BuildingFiles.File.FileBucket")
                                                        .Where(a => a.IsActive && (a.Name.Contains(searchText) ||
                                                                                   a.Description.Contains(searchText) ||
                                                                                   a.Actor.Name.Contains(searchText) ||
                                                                                   a.Address.Contains(searchText) ||
                                                                                   a.EmergencyEmail.Contains(searchText) ||
                                                                                   a.BuildingFiles.Any(t=>t.File.Name.Contains(searchText) || t.File.Description.Contains(searchText)) ||
                                                                                   a.BuildingImages.Any(t => t.File.Name.Contains(searchText) || t.File.Description.Contains(searchText)) ||
                                                                                   a.ContactInfo.Any(t => t.FirstName.Contains(searchText) || t.LastName.Contains(searchText)) 
                                                                                   )).ToListAsync();

                    dto.Buildings = buildings.Select(a => new BuildingDto
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Description = a.Description,
                        FeaturedImageId = a.FeaturedImageId,
                        BuildingImages = a.BuildingImages != null ? a.BuildingImages.Select(b => new BuildingImageDto
                        {
                            Id = b.Id,
                            BucketName = b.File != null && b.File.FileBucket != null ? b.File.FileBucket.Name : "",
                            BucketPath = b.File != null && b.File.FileBucket != null ? b.File.FileBucket.PhysicalPath : "",
                            FileName = b.File.Name,
                            FileDescription = b.File.Description
                        }).ToList() : new List<BuildingImageDto>()
                    }).Distinct().ToList();

                    // get files
                    dto.Files = buildings.SelectMany(t => t.BuildingFiles)
                        .Select(a => new FileWithButcketDTO
                        {
                            Id = a.Id,
                            FileName = a.File.Name,
                            FileDescription = a.File.Description,
                            BucketName = a.File.FileBucket.Name,
                            BucketPath = a.File.FileBucket.PhysicalPath
                        }).Distinct().ToList();

                    // get users
                    var users = buildings.SelectMany(x => x.ActorBuildingPermissions)
                        .Select(a =>
                        new ContactInfoDto
                        {
                            BuildingId = a.BuildingId,
                            FirstName = a.Actor.Name,
                            LastName = a.Building.Name,
                            Role = "User",
                        }).ToList();

                    var contacts = buildings.SelectMany(x => x.ContactInfo)
                        .Select(a =>
                        new ContactInfoDto
                        {
                            BuildingId = a.BuildingId ,
                            LastName=a.Building.Name,
                            FirstName = a.FirstName + " " + a.LastName,
                            Role = "Contact",
                        }).ToList();
                    dto.Contacts = users.Union(contacts).ToList().Distinct().ToList();
                    return Ok(dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
    }
}
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
    public class BuildingDisasterInfoController : BaseApiController
    {
        /// <summary>
        /// Add a new Disaster info to the building.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<HttpResponseMessage> Post()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            try
            {
                string root = HttpContext.Current.Server.MapPath("~/App_Data");
                var provider = new MultipartFormDataStreamProvider(root);
                await Request.Content.ReadAsMultipartAsync(provider);

                // Get all needed data.
                string buildingId = provider.FormData["BuildingId"];
                string fileName = provider.FormData["Name"];
                string fileDescription = provider.FormData["Description"];
                string diTitle = provider.FormData["Title"];
                string diDescription = provider.FormData["DisasterInfoDescription"];

                // get the fileBucket
                var serviceManager = new Service(DataBaseId, UserId);
                
                // get the building
                Building building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include("BuildingDisasterInfos.File").FirstOrDefault(a => a.Id == buildingId);
                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);
                Actor actor = serviceManager.GetService<IActorService>().GetAll().FirstOrDefault(a => a.Id == building.ActorId);
                // get the bucket
                FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/DisasterInfos");
                if (bucket == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                // Create the file for the disaster info
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileName;
                file.Description = fileDescription;
                file.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(file);

                // Create a new disaster info object and fill with the correct dates.
                BuildingDisasterInfo buildingDisasterInfo = new BuildingDisasterInfo();
                buildingDisasterInfo.Id = Guid.NewGuid().ToString();
                buildingDisasterInfo.FileId = file.Id;
                buildingDisasterInfo.BuildingId = buildingId;
                buildingDisasterInfo.Description = diDescription;
                buildingDisasterInfo.Title = diTitle;

                // Add the new object to the building and save the changes.
                building.BuildingDisasterInfos.Add(buildingDisasterInfo);
                serviceManager.Commit();

                var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);

                // This illustrates how to get the file names.
                foreach (MultipartFileData fileData in provider.FileData)
                {
                    File.Move(fileData.LocalFileName, destinationPath);

                }
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        /// <summary>
        /// Return the list with all the buildingDisasterInfo and convert it to a list of BuildingDisasterInfoDto.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<BuildingDisasterInfoDto>> GetAll(ODataQueryOptions<BuildingDisasterInfoDto> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var result =  serviceManager.GetService<IBuildingDisasterInfoService>().GetAll().Include("File.FileBucket").Select(a => new BuildingDisasterInfoDto()
                {
                    BuildingId = a.BuildingId,
                    Description = a.Description,
                    FileId = a.FileId,
                    Id = a.Id,
                    Title = a.Title,
                    File = new FileWithButcketDTO()
                    {
                        Id = a.File.Id,
                        BucketName = a.File.FileBucket.Name,
                        BucketPath = a.File.FileBucket.PhysicalPath,
                        FileDescription = a.File.Description,
                        FileName = a.File.Name
                    }
                });

                return result;
            }
        }

        [HttpPut]
        [ResponseType(typeof(BuildingDisasterInfoDto))]
        public async Task<IHttpActionResult> Put([FromBody] BuildingDisasterInfoDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingDisasterInfoService>())
                {
                    BuildingDisasterInfo bf = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == dto.Id);
                    if (bf == null)
                        return NotFound();
                    bf.Title = dto.Title;
                    bf.Description = dto.Description;
                    await serviceManager.UpdateAsync(bf);
                    return Ok(dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Get the BuildingDisasterInfo with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(BuildingDisasterInfoDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingDisasterInfoService>();
                var result = serviceManager.GetAll().Include("File.FileBucket").Select(a => new BuildingDisasterInfoDto()
                {
                    BuildingId = a.BuildingId,
                    Description = a.Description,
                    FileId = a.FileId,
                    Id = a.Id,
                    Title = a.Title,
                    File = new FileWithButcketDTO()
                    {
                        Id = a.File.Id,
                        BucketName = a.File.FileBucket.Name,
                        BucketPath = a.File.FileBucket.PhysicalPath,
                        FileDescription = a.File.Description,
                        FileName = a.File.Name
                    }
                }).FirstOrDefault(a => a.Id == id);
                if (result == null)
                {
                    return NotFound();
                }
                else
                {
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
        
        /// <summary>
        /// Delete the disaster info with the specified Id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var buildingdisasterservice = new Service(DataBaseId, UserId).GetService<IBuildingDisasterInfoService>())
                {

                    // Get the needed disaster info from the database.
                    BuildingDisasterInfo bdi = await buildingdisasterservice.GetByIdAsync(new object[] { id });

                    if (bdi == null)
                    {
                        return BadRequest("Item not found");
                    }

                    await buildingdisasterservice.SetDeletedAsync(bdi);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
    }
}
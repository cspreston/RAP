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
    public class BuildingFileController : BaseApiController
    {
        /// <summary>
        /// Add a new building file to the building.
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

                // Get the needed dates.
                string buildingId = provider.FormData["BuildingId"];
                string fileName = provider.FormData["Name"];
                string fileDescription = provider.FormData["Description"];
                string bfTitle = provider.FormData["Title"];
                string bfDescription = provider.FormData["BuildingFileDescription"];
                string bfType = provider.FormData["Type"];
               // get the fileBucket
               var serviceManager = new Service(DataBaseId, UserId);

                BuildingFileType _type = BuildingFileType.Files;
                if (!string.IsNullOrEmpty(bfType))
                {
                    Enum.TryParse(bfType, out _type);
                }

                // get the building
                Building building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include("BuildingFiles.File").Include(x=>x.Actor).FirstOrDefault(a => a.Id == buildingId);
                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);
                // get the bucket
                FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == building.Actor.Name + "/Buildings/" + building.Id + "/Files");
                if (bucket == null) throw new HttpResponseException(HttpStatusCode.Conflict);


                fileName = Path.GetFileName(Tools.Helper.SetFileNameVersion(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + fileName)));

                // Create the file for the building file.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileName;
                file.Description = fileDescription;
                file.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(file);

                // Create the building file object and fill it with the correspond dates.
                BuildingFile buildingFile = new BuildingFile();
                buildingFile.Id = Guid.NewGuid().ToString();
                buildingFile.FileId = file.Id;
                buildingFile.BuildingId = buildingId;
                buildingFile.Title = bfTitle;
                buildingFile.Description = bfDescription;
                buildingFile.Type = _type;
                
                // Add the new object to the bulding file list and save the changes.
                building.BuildingFiles.Add(buildingFile);
                serviceManager.Commit();

               
                var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);

                if (!Directory.Exists(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/")))
                    Directory.CreateDirectory(destinationPath);

                // Copy the file from disk to the server in the correct folder.
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

        [HttpPut]
        [ResponseType(typeof(BuildingDto))]
        public async Task<IHttpActionResult> Put([FromBody] BuildingFileDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingFileService>())
                {
                    BuildingFile bf = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == dto.Id);
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
        /// Return the list with all the buildingFile and convert it to a list of BuildingFileDto.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<BuildingFileDto>> GetAll()
        {
            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingFileService>())
            {
                var result = serviceManager.GetAll().Include("File.FileBucket").Select(a => new BuildingFileDto()
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


        /// <summary>
        /// Get the BuildingFile with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [EnableQuery]
        [ResponseType(typeof(BuildingFileDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingFileService>())
                {
                    var result = await serviceManager.GetAll().Include("File.FileBucket").Select(a => new BuildingFileDto()
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
        /// Delete the specified building file from the database.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        [ResponseType(typeof(BuildingFileDto))]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingFileService>())
                {
                    BuildingFile bf = await serviceManager.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
                    // Set the building file in order to be deleted and save the changes.

                    if (bf == null)
                    {
                        return NotFound();
                    }
                    await serviceManager.SetDeletedAsync(bf);

                    var result = new BuildingFileDto()
                    {
                        Id = bf.Id,
                        BuildingId = bf.BuildingId,
                        Description = bf.Description,
                        FileId = bf.FileId,
                        Title = bf.Title
                    };
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
    }
}
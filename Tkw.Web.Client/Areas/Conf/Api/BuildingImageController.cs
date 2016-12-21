using BusinessObjects;
using Common;
using Common.Domain;
using Common.Independent;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class BuildingImageController : BaseApiController
    {

        /// <summary>
        /// Get a list of Building Image dtos of all building image from the database.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<BuildingImageDto>> GetAll()
        {    
            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingImageService>())
            {
                var result = serviceManager.GetAll().Include("File.FileBucket").Select(a => new BuildingImageDto()
                {
                    BuildingId = a.BuildingId,
                    FileId = a.FileId,
                    Id = a.Id,
                    BucketName = a.File.FileBucket.Name,
                    BucketPath = a.File.FileBucket.PhysicalPath,
                    FileDescription = a.File.Description,
                    FileName = a.File.Name
                });
                return result;
            } 
        }

        /// <summary>
        /// Get the building image with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(BuildingImageDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingImageService>())
                {
                    var result = serviceManager.GetAll().Include("File.FileBucket").Select(a => new BuildingImageDto()
                    {
                        BuildingId = a.BuildingId,
                        FileId = a.FileId,
                        Id = a.Id,
                        BucketName = a.File.FileBucket.Name,
                        BucketPath = a.File.FileBucket.PhysicalPath,
                        FileDescription = a.File.Description,
                        FileName = a.File.Name
                    }).FirstOrDefault(a => a.Id == id);

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
        /// Add a new building image to the building.
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

                // Get needed dates.
                string buildingId = provider.FormData["BuildingId"];
                string fileName = provider.FormData["Name"];
                string fileDescription = provider.FormData["Description"];
                int? width, height;
                int val = 0;
                width = int.TryParse(provider.FormData["Width"], out val) ? val : (int?)null;
                height = int.TryParse(provider.FormData["Height"], out val) ? val : (int?)null;
                bool keepAspectRatio = false;
                bool.TryParse(provider.FormData["KeepAspectRatio"], out keepAspectRatio);

                // get the filyBucket
                var serviceManager = new Service(DataBaseId, UserId);

                // get the building
                Building building = serviceManager.GetService<IBuildingService>().GetAll()
                        .Include("BuildingImages.File").Include(x => x.Actor).FirstOrDefault(a => a.Id == buildingId);
                if (building == null)
                    throw new HttpResponseException(HttpStatusCode.Conflict);

                // get the bucket
                FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == building.Actor.Name + "/Buildings/" + building.Id + "/Images");
                if (bucket == null)
                    throw new HttpResponseException(HttpStatusCode.Conflict);
                fileName = Path.GetFileName(Tools.Helper.SetFileNameVersion(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + fileName)));
                // Create the file for the image.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileName;
                file.Description = fileDescription;
                file.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(file);

                // Create the new object.
                BuildingImage buildingImage = new BuildingImage();
                buildingImage.Id = Guid.NewGuid().ToString();
                buildingImage.FileId = file.Id;
                buildingImage.BuildingId = buildingId;
                buildingImage.Order = building.BuildingImages.Any() ? building.BuildingImages.Max(t => t.Order) + 1 : 0;

                // Add to the building and save the chnages.
                building.BuildingImages.Add(buildingImage);
                serviceManager.Commit();

                var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);

                if (!Directory.Exists(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/")))
                    Directory.CreateDirectory(destinationPath);
                // Copy the file from disk in the correct folder.
                // This illustrates how to get the file names.
                foreach (MultipartFileData fileData in provider.FileData)
                    File.Move(fileData.LocalFileName, destinationPath);

                serviceManager.GetService<IResizeImageService>().ResizeImageFile(destinationPath, width, height, keepAspectRatio);

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        /// <summary>
        /// Delete the building image with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            var serviceManager = new Service(DataBaseId, UserId);

            var service = serviceManager.GetService<IBuildingImageService>();
            BuildingImage bimg = await service.GetAll().Include(t => t.Building.BuildingImages).Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
            if (bimg == null)
                return NotFound();

            if (bimg.Building.FeaturedImageId == bimg.Id)
            {
                bimg.Building.FeaturedImageId = null;
                var image = bimg.Building.BuildingImages.FirstOrDefault(x => x.IsActive && x.Id != id);
                if (image != null)
                    bimg.Building.FeaturedImageId = image.Id;

            }
            await service.SetDeletedAsync(bimg);
            return Ok();
        }

        /// <summary>
        /// Delete the building image with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        public async Task<IHttpActionResult> Put(BuildingImageDto item)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var service = serviceManager.GetService<IBuildingImageService>();
                BuildingImage bimg = await service.GetAll().Include(x => x.File).Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == item.Id);
                if (bimg == null)
                    return NotFound();
                bimg.File.Description = item.FileDescription;
                await service.UpdateAsync(bimg);
                return Ok();
            }
        }

        [HttpPost]
        public async Task<IHttpActionResult> SetMainImage(string id)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var service = serviceManager.GetService<IBuildingImageService>();
                BuildingImage bimg = await service.GetAll().Include(t => t.Building).Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
                if (bimg == null)
                    return NotFound();
                bimg.Building.FeaturedImageId = bimg.Id;
                await service.UpdateAsync(bimg);
                return Ok();
            }
        }

        public async Task<IHttpActionResult> SetOrder([FromBody] BuildingImageDto[] dtos)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                if (dtos == null || dtos.Count() == 0)
                    return Ok();
                var ids = dtos.Select(t => t.Id).ToList();
                var buildingImageService = service.GetService<IBuildingImageService>();
                var items = await buildingImageService.GetAll().Where(t => ids.Contains(t.Id)).ToListAsync();
                List<BuildingImage> results = new List<BuildingImage>(items.Count);
                for (int i = 0; i < dtos.Count(); i++)
                {
                    var item = items.FirstOrDefault(x => x.Id == dtos[i].Id);
                    if (item != null)
                    {
                        item.Order = i;
                        results.Add(item);
                        buildingImageService.Update(item);
                    }
                }
                await service.CommitAsync();
            }
            return Ok();
        }
    }
}
 
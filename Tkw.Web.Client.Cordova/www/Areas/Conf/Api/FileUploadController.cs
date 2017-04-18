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
    public class FileUploadController : BaseApiController
    {
        [HttpPost]
        public async Task<HttpResponseMessage> UploadNewBuildingImage()
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
                string fileName = Tools.Helper.SetFileNameVersion(provider.FormData["Name"]); 
                string fileDescription = provider.FormData["Description"];

                // get the fileBucket
                var serviceManager = new Service(DataBaseId, UserId);
                // get the bucket
                FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == buildingId + "/Building/Images");
                if (bucket == null) throw new HttpResponseException(HttpStatusCode.Conflict);
                // get the building
                Building building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include("BuildingImages.File").FirstOrDefault(a => a.Id == buildingId);
                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                // create the new file object
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileName;
                file.Description = fileDescription;
                file.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(file);

                // create the new building image file object
                BuildingImage buildingImage = new BuildingImage();
                buildingImage.Id = Guid.NewGuid().ToString();
                buildingImage.FileId = file.Id;
                buildingImage.BuildingId = buildingId;

                // add the building image file to the building and save the change database
                building.BuildingImages.Add(buildingImage);
                serviceManager.Commit();

                // Move the copy to the correct destination path
                var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);

                // This illustrates how to get the file names.
                foreach (MultipartFileData fileData in provider.FileData)
                {
                    File.Move(fileData.LocalFileName, destinationPath);
                }

                // Return and ok response
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (System.Exception e)
            {

                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IBuildingImageService>())
                {
                    BuildingImage bi = await serviceManager.GetAll().Include(a => a.File.FileBucket).Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);

                    if (bi == null)
                    {
                        return NotFound();
                    }
                    await serviceManager.SetDeletedAsync(bi);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
    }
}

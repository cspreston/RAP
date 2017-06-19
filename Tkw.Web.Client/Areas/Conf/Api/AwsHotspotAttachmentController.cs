using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
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
    public class AwsHotspotAttachmentController : BaseApiController
    {
        [ResponseType(typeof(FileWithButcketDTO))]
        public async Task<IHttpActionResult> Post([FromBody] HotspotDto hotspotDto)
        {
            var newBucket = false;
            var serviceManager = new Service(DataBaseId, UserId);
            var service = serviceManager.GetService<IHotspotService>();

            var id = hotspotDto.Id;
            var fileDto = hotspotDto.Files.First();

            // Get the hotspot where to attach the new file from the disk.
            Hotspot hp = service.GetAll().Where(a => a.IsActive)
                .Include("Files")
                .Include("Building.Actor").FirstOrDefault(a => a.Id == id);

            if ((hp != null) && (hp.HotspotActionType.AllowAttachment))
            {
                // Get the bucket
                var bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + hp.BuildingPlanId);

                if (bucket == null)
                {
                    newBucket = true;
                    bucket = new FileBuckets()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + hp.BuildingPlanId,
                        FileBucketTypeId = 2,
                        IsActive = true,
                        PhysicalPath = fileDto.FileUrl
                    };
                };

                // Create the file record.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileDto.FileName;
                file.Description = fileDto.FileDescription;
                file.FileBucketId = bucket.Id;
                file.Url = fileDto.FileUrl;
                file.ThumbUrl = fileDto.ThumbUrl;

                // Insert records
                serviceManager.GetService<IFilesService>().Add(file);
                if (newBucket) serviceManager.GetService<IFileBucketsService>().Add(bucket);

                hp.Files.Add(file);

                serviceManager.Commit();

                // Update the model
                fileDto.Id = file.Id;
                fileDto.BucketName = bucket.Name;
                fileDto.BucketPath = bucket.PhysicalPath;

                return Ok(fileDto);
            }

            throw new HttpResponseException(HttpStatusCode.Unauthorized);
        }
    }
}
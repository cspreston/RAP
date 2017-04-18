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
    public class AwsBuildingImageController : BaseApiController
    {
        [ResponseType(typeof(BuildingImageDto))]
        public async Task<IHttpActionResult> Post([FromBody] BuildingImageDto imageDto)
        {
            try
            {
                var newBucket = false;
                var serviceManager = new Service(DataBaseId, UserId);

                // get the building
                var building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include(a => a.Actor)
                    .Include("BuildingImages.File")
                    .FirstOrDefault(a => a.Id == imageDto.BuildingId);

                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                var actor = building.Actor;

                // Get the bucket
                var bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/Images");

                if (bucket == null)
                {
                    newBucket = true;
                    bucket = new FileBuckets()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = actor.Name + "/Buildings/" + building.Id + "/Images",
                        FileBucketTypeId = 1,
                        IsActive = true,
                        PhysicalPath = imageDto.Url
                    };
                };

                // Create the file for the image.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = imageDto.FileName;
                file.Description = imageDto.FileDescription;
                file.FileBucketId = bucket.Id;
                file.Url = imageDto.Url;
                file.ThumbUrl = imageDto.ThumbUrl;

                // Create the new object.
                BuildingImage buildingImage = new BuildingImage();
                buildingImage.Id = Guid.NewGuid().ToString();
                buildingImage.FileId = file.Id;
                buildingImage.BuildingId = building.Id;
                buildingImage.Order = building.BuildingImages.Any() ? building.BuildingImages.Max(t => t.Order) + 1 : 0;

                // Insert records
                serviceManager.GetService<IFilesService>().Add(file);
                if (newBucket) serviceManager.GetService<IFileBucketsService>().Add(bucket);
                building.BuildingImages.Add(buildingImage);

                serviceManager.Commit();

                // Update the model
                imageDto.Id = buildingImage.Id;
                imageDto.BuildingId = building.Id;
                imageDto.FileId = file.Id;
                imageDto.BucketName = bucket.Name;
                imageDto.BucketPath = bucket.PhysicalPath;

                return Ok(imageDto);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
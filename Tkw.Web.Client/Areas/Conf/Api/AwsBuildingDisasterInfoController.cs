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
    public class AwsBuildingDisasterInfoController : BaseApiController
    {
        [ResponseType(typeof(BuildingDisasterInfoDto))]
        public async Task<IHttpActionResult> Post([FromBody] BuildingDisasterInfoDto infoDto)
        {
            try
            {
                var newBucket = false;
                var serviceManager = new Service(DataBaseId, UserId);

                // get the building
                var building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include(a => a.Actor)
                    .Include("BuildingDisasterInfos.File")
                    .FirstOrDefault(a => a.Id == infoDto.BuildingId);

                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                var actor = building.Actor;

                // Get the bucket
                var bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/Files");

                if (bucket == null)
                {
                    newBucket = true;
                    bucket = new FileBuckets()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = actor.Name + "/Buildings/" + building.Id + "/Files",
                        FileBucketTypeId = 1,
                        IsActive = true,
                        PhysicalPath = infoDto.File.FileUrl
                    };
                };

                // Create the file record.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = infoDto.File.FileName;
                file.Description = infoDto.File.FileDescription;
                file.FileBucketId = bucket.Id;
                file.Url = infoDto.File.FileUrl;

                // Create the new building disaster info object.
                BuildingDisasterInfo buildingFile = new BuildingDisasterInfo();
                buildingFile.Id = Guid.NewGuid().ToString();
                buildingFile.FileId = file.Id;
                buildingFile.BuildingId = building.Id;
                buildingFile.Title = infoDto.Title;
                buildingFile.Description = infoDto.Description;

                // Insert records
                serviceManager.GetService<IFilesService>().Add(file);
                if (newBucket) serviceManager.GetService<IFileBucketsService>().Add(bucket);
                building.BuildingDisasterInfos.Add(buildingFile);

                serviceManager.Commit();

                // Update the model
                infoDto.Id = buildingFile.Id;
                infoDto.BuildingId = building.Id;
                infoDto.FileId = file.Id;
                infoDto.File.BucketName = bucket.Name;
                infoDto.File.BucketPath = bucket.PhysicalPath;

                return Ok(infoDto);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
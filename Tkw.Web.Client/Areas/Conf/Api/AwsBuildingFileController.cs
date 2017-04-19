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
    public class AwsBuildingFileController : BaseApiController
    {
        [ResponseType(typeof(BuildingFileDto))]
        public async Task<IHttpActionResult> Post([FromBody] BuildingFileDto fileDto)
        {
            try
            {
                var newBucket = false;
                var serviceManager = new Service(DataBaseId, UserId);

                // get the building
                var building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include(a => a.Actor)
                    .Include("BuildingFiles.File")
                    .FirstOrDefault(a => a.Id == fileDto.BuildingId);

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
                        PhysicalPath = fileDto.File.FileUrl
                    };
                };

                // Create the file record.
                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileDto.File.FileName;
                file.Description = fileDto.File.FileDescription;
                file.FileBucketId = bucket.Id;
                file.Url = fileDto.File.FileUrl;

                // Create the new building file object.
                BuildingFile buildingFile = new BuildingFile();
                buildingFile.Id = Guid.NewGuid().ToString();
                buildingFile.FileId = file.Id;
                buildingFile.BuildingId = building.Id;
                buildingFile.Title = fileDto.Title;
                buildingFile.Description = fileDto.Description;
                buildingFile.Type = BuildingFileType.Files;

                // Insert records
                serviceManager.GetService<IFilesService>().Add(file);
                if (newBucket) serviceManager.GetService<IFileBucketsService>().Add(bucket);
                building.BuildingFiles.Add(buildingFile);

                serviceManager.Commit();

                // Update the model
                fileDto.Id = buildingFile.Id;
                fileDto.BuildingId = building.Id;
                fileDto.FileId = file.Id;
                fileDto.File.BucketName = bucket.Name;
                fileDto.File.BucketPath = bucket.PhysicalPath;

                return Ok(fileDto);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
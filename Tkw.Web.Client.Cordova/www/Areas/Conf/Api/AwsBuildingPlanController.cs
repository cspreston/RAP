using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
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
    public class AwsBuildingPlanController : BaseApiController
    {
        [ResponseType(typeof(BuildingPlanDto))]
        public async Task<IHttpActionResult> Post([FromBody] BuildingPlanDto planDto)
        {
            try
            {
                var newBucket = false;
                var serviceManager = new Service(DataBaseId, UserId);

                // get the building
                var building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include(a => a.Actor)
                    .Include("BuildingPlans.PlanFile")
                    .FirstOrDefault(a => a.Id == planDto.BuildingId);

                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                var actor = building.Actor;

                // Get the bucket
                var bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/Plans");

                if (bucket == null)
                {
                    newBucket = true;
                    bucket = new FileBuckets()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = actor.Name + "/Buildings/" + building.Id + "/Plans",
                        FileBucketTypeId = 1,
                        IsActive = true,
                        PhysicalPath = planDto.PlanFile.FileUrl
                    };
                };

                // Create the plan file
                var planFile = serviceManager.GetService<IFilesService>().Create();
                planFile.Id = Guid.NewGuid().ToString();
                planFile.Name = planDto.PlanFile.FileName;
                planFile.Description = planDto.PlanFile.FileDescription;
                planFile.Url = planDto.PlanFile.FileUrl;
                planFile.ThumbUrl = planDto.PlanFile.ThumbUrl;
                planFile.ZoomUrl = planDto.PlanFile.ZoomUrl;
                planFile.FileBucketId = bucket.Id;

                // Create the plan thumb file
                var thumbFile = serviceManager.GetService<IFilesService>().Create();
                thumbFile.Id = Guid.NewGuid().ToString();
                thumbFile.Name = planDto.PlanThumbnailFile.FileName;
                thumbFile.Description = planDto.PlanThumbnailFile.FileDescription;
                thumbFile.Url = planDto.PlanThumbnailFile.FileUrl;
                thumbFile.ThumbUrl = planDto.PlanThumbnailFile.ThumbUrl;
                thumbFile.ZoomUrl = planDto.PlanThumbnailFile.ZoomUrl;
                thumbFile.FileBucketId = bucket.Id;

                // Create the plan zoom file
                var zoomFile = serviceManager.GetService<IFilesService>().Create();
                zoomFile.Id = Guid.NewGuid().ToString();
                zoomFile.Name = planDto.PlanZoomFile.FileName;
                zoomFile.Description = planDto.PlanZoomFile.FileDescription;
                zoomFile.Url = planDto.PlanZoomFile.FileUrl;
                zoomFile.ThumbUrl = planDto.PlanZoomFile.ThumbUrl;
                zoomFile.ZoomUrl = planDto.PlanZoomFile.ZoomUrl;
                zoomFile.FileBucketId = bucket.Id;

                // Create the plan
                var buildingPlan = new BuildingPlan();
                buildingPlan.Id = Guid.NewGuid().ToString();
                buildingPlan.PlanFileId = planFile.Id;
                buildingPlan.PlanThumbnailFileId = thumbFile.Id;
                buildingPlan.PlanZoomFileId = zoomFile.Id;
                buildingPlan.BuildingId = planDto.BuildingId;
                buildingPlan.Name = planDto.Name;
                buildingPlan.Description = planDto.Description;
                buildingPlan.Order = building.BuildingPlans.Any() ? building.BuildingPlans.Max(t => t.Order) + 1 : 0;

                // Insert records
                serviceManager.GetService<IFilesService>().Add(planFile);
                serviceManager.GetService<IFilesService>().Add(thumbFile);
                serviceManager.GetService<IFilesService>().Add(zoomFile);
                if(newBucket) serviceManager.GetService<IFileBucketsService>().Add(bucket);
                building.BuildingPlans.Add(buildingPlan);

                serviceManager.Commit();

                // Update the model
                planDto.Id = buildingPlan.Id;
                planDto.PlanFileId = planFile.Id;
                planDto.PlanFile.Id = planFile.Id;
                planDto.PlanFile.BucketName = bucket.Name;
                planDto.PlanFile.BucketPath = bucket.PhysicalPath;
                planDto.PlanThumbnailFileId = thumbFile.Id;
                planDto.PlanThumbnailFile.Id = thumbFile.Id;
                planDto.PlanThumbnailFile.BucketName = bucket.Name;
                planDto.PlanThumbnailFile.BucketPath = bucket.PhysicalPath;
                planDto.PlanZoomFileId = zoomFile.Id;
                planDto.PlanZoomFile.Id = zoomFile.Id;
                planDto.PlanZoomFile.BucketName = bucket.Name;
                planDto.PlanZoomFile.BucketPath = bucket.PhysicalPath;

                return Ok(planDto);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
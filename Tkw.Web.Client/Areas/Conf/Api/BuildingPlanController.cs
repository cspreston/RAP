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
using Web.Client.Net.Areas.Auth.Models;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class BuildingPlanController : BaseApiController
    {
        /// <summary>
        /// Return the list with all the buildingPlan and convert it to a list of BuildingPlanDto.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<BuildingPlanDto>> GetAll()
        {
            using (var buildingPlanService = new Service(DataBaseId, UserId).GetService<IBuildingPlanService>())
            {
                var result = buildingPlanService.GetAll()
                    .Include("PlanFile.FileBucket")
                    .Include("PlanThumbnailFile.FileBucket")
                    .Include("PlanZoomFile.FileBucket")
                    .OrderBy(x=>x.Order).
                    ThenBy(x=>x.Name).ThenBy(x=>x.CreateDate)
                    .Where(a => a.IsActive)
                    .Select(a => new BuildingPlanDto()
                    {
                        BuildingId = a.BuildingId,
                        Description = a.Description,
                        Id = a.Id,
                        Name = a.Name,
                        PlanThumbnailFileId = a.PlanThumbnailFileId,
                        PlanFileId = a.PlanFileId,
                        PlanThumbnailFile = new FileWithButcketDTO
                        {
                            Id = a.PlanThumbnailFile.Id,
                            BucketName = a.PlanThumbnailFile.FileBucket.Name,
                            BucketPath = a.PlanThumbnailFile.FileBucket.PhysicalPath,
                            FileName = a.PlanThumbnailFile.Name,
                            FileDescription = a.PlanThumbnailFile.Description
                        },
                        PlanFile = new FileWithButcketDTO
                        {
                            Id = a.PlanFile.Id,
                            BucketName = a.PlanFile.FileBucket.Name,
                            BucketPath = a.PlanFile.FileBucket.PhysicalPath,
                            FileName = a.PlanFile.Name,
                            FileDescription = a.PlanFile.Description
                        }
                    });
                return result;
            }
        }
        /// <summary>
        /// Get the BuildingPlan with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(BuildingPlanDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {

                using (var serviceManager = new Service(DataBaseId, UserId))
                {

                    var buildingPlanService = serviceManager.GetService<IBuildingPlanService>();
                    var item = await buildingPlanService.GetAll().Where(a => a.IsActive)
                                    .Include("PlanFile.FileBucket")
                                    .Include("PlanThumbnailFile.FileBucket")
                                    .Include("PlanZoomFile.FileBucket")
                                    .Include(x => x.Building)
                                    .Include("Hotspots.HotspotDisplayType")
                                    .Include("Hotspots.HotspotActionType")
                                    .Include("Hotspots.Files")
                                    .Include("Hotspots.Files.FileBucket").FirstOrDefaultAsync(a => a.Id == id);
                    if (item == null)
                        return BadRequest("Item not found");

                    var pinnedHps = await serviceManager.GetService<IHotspotService>().GetAll().Where(a => a.IsActive).Where(a => a.Id == id || a.BeaconuuId == id).ToListAsync();

                    var result = new BuildingPlanDto()
                    {
                        BuildingId = item.BuildingId,
                        BuildingName = item.Building.Name,
                        Description = item.Description,
                        Id = item.Id,
                        Name = item.Name,
                        PlanThumbnailFileId = item.PlanThumbnailFileId,
                        PlanFileId = item.PlanFileId,
                        CanUseFullCanvas = item.CanUseFullCanvas,
                        PlanThumbnailFile = new FileWithButcketDTO
                        {
                            Id = item.PlanThumbnailFile.Id,
                            BucketName = item.PlanThumbnailFile.FileBucket.Name,
                            BucketPath = item.PlanThumbnailFile.FileBucket.PhysicalPath,
                            FileName = item.PlanThumbnailFile.Name,
                            FileDescription = item.PlanThumbnailFile.Description
                        },
                        PlanFile = new FileWithButcketDTO
                        {
                            Id = item.PlanFile.Id,
                            BucketName = item.PlanFile.FileBucket.Name,
                            BucketPath = item.PlanFile.FileBucket.PhysicalPath,
                            FileName = item.PlanFile.Name,
                            FileDescription = item.PlanFile.Description
                        },
                        Hotspots = item.Hotspots.Where(b => b.IsActive).OrderBy(x => x.CreateDate).Select(b => new HotspotDto()
                        {
                            BeaconuuId = b.BeaconuuId,
                            BuildingId = b.BuildingId,
                            BuildingPlanId = b.BuildingPlanId,
                            HotspotActionTypeId = b.HotspotActionTypeId,
                            HotspotDisplayTypeId = b.HotspotDisplayTypeId,
                            Name = b.Name,
                            Description = b.Description,

                            HotspotActionType = new HotspotActionTypeDto()
                            {
                                AllowAttachment = b.HotspotActionType.AllowAttachment,
                                Id = b.HotspotActionType.Id,
                                Name = b.HotspotActionType.Name,
                                Description = b.HotspotActionType.Description

                            },
                            HotspotDisplayType = new HotspotDisplayTypeDto()
                            {
                                Id = b.HotspotDisplayType.Id,
                                Name = b.HotspotDisplayType.Name,
                                Description = b.HotspotDisplayType.Description,
                                FileName = b.HotspotDisplayType.FileName,
                                Color = b.HotspotDisplayType.Color,
                                Type = b.HotspotDisplayType.Type
                            },
                            Id = b.Id,
                            DisplayDetails = b.DisplayDetails,
                            Files = b.Files.Where(c => c.IsActive).Select(z => new FileWithButcketDTO()
                            {
                                Id = z.Id,
                                BucketName = z.FileBucket.Name,
                                BucketPath = z.FileBucket.PhysicalPath,
                                FileName = z.Name,
                                FileDescription = z.Description
                            }).ToList()
                        }).ToList()
                    };
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Modify the BuildingPlan with the specified id with the dates from the given BuildingPlanDto.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [ResponseType(typeof(BuildingPlanDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] BuildingPlanDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var buildingPlanService = new Service(DataBaseId, UserId).GetService<IBuildingPlanService>())
                {
                    BuildingPlan bp = await buildingPlanService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);

                    if (bp == null)
                    {
                        return BadRequest("Building plan not found");
                    }

                    bp.BuildingId = dto.BuildingId;
                    bp.Description = dto.Description;
                    bp.Name = dto.Name;

                    await buildingPlanService.UpdateAsync(bp);

                    dto = await buildingPlanService.GetAll().Where(a => a.IsActive)
                        .Select(a => new BuildingPlanDto()
                        {
                            Name = a.Name,
                            Id = a.Id,
                            Description = a.Description,
                            BuildingId = a.BuildingId,
                            PlanThumbnailFileId = a.PlanThumbnailFileId,
                            PlanFileId = a.PlanFileId,
                        }).FirstOrDefaultAsync(a => a.Id == id);

                    if (dto == null)
                    {
                        return BadRequest("Item not found");
                    }
                    else
                    {
                        return Ok(dto);
                    }
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));


        }

        /// <summary>
        /// Add a new BuildingPlan with the dates of the BuildingPlanDto.
        /// </summary>
        /// <param name="dto"></param>
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

                string buildingId = provider.FormData["BuildingId"];
                string fileName = provider.FormData["Name"];
                string fileDescription = provider.FormData["Description"];
                string thumbfileName = provider.FormData["Name"];
                string thumbfileDescription = provider.FormData["Description"];
                string planName = provider.FormData["PlanName"];
                string planDescription = provider.FormData["PlanDescription"];
                int? width, height;
                int val = 0;
                width = int.TryParse(provider.FormData["Width"], out val) ? val : (int?)null;
                height = int.TryParse(provider.FormData["Height"], out val) ? val : (int?)null;
                bool keepAspectRatio = false;
                bool.TryParse(provider.FormData["KeepAspectRatio"], out keepAspectRatio);

                // get the fileBucket
                var serviceManager = new Service(DataBaseId, UserId);


                // get the building
                Building building = serviceManager.GetService<IBuildingService>().GetAll()
                    .Include(a => a.Actor)
                    .Include("BuildingPlans.PlanFile")
                    .Include("BuildingPlans.PlanThumbnailFile")
                    .Include("PlanZoomFile.FileBucket")
                    .FirstOrDefault(a => a.Id == buildingId);
                if (building == null) throw new HttpResponseException(HttpStatusCode.Conflict);

                Actor actor = building.Actor;
                // get the bucket
                FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/Plans");
                if (bucket == null) throw new HttpResponseException(HttpStatusCode.Conflict);
                fileName = Path.GetFileName(Tools.Helper.SetFileNameVersion(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + fileName)));

                Files file = serviceManager.GetService<IFilesService>().Create();
                file.Id = Guid.NewGuid().ToString();
                file.Name = fileName;
                file.Description = fileDescription;
                file.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(file);

                Files thumbFile = serviceManager.GetService<IFilesService>().Create();
                thumbFile.Id = Guid.NewGuid().ToString();
                thumbFile.Name = thumbfileName;
                thumbFile.Description = thumbfileDescription;
                thumbFile.FileBucketId = bucket.Id;
                serviceManager.GetService<IFilesService>().Add(thumbFile);

                BuildingPlan buildingPlan = new BuildingPlan();
                buildingPlan.Id = Guid.NewGuid().ToString();
                buildingPlan.PlanFileId = file.Id;
                buildingPlan.PlanThumbnailFileId = thumbFile.Id;
                buildingPlan.BuildingId = buildingId;
                buildingPlan.Name = planName;
                buildingPlan.Description = planDescription;
                buildingPlan.Order = building.BuildingPlans.Any() ? building.BuildingPlans.Max(t => t.Order) + 1 : 0;
                string folder = Tools.DefaultValues.FILESDIRECTORY;

                var buildingPlanBucket = new FileBuckets()
                {
                    Id = buildingPlan.Id.Substring(0, buildingPlan.Id.Length - 3) + "BPH2",
                    Name = building.Actor.Name + "/Buildings/" + building.Id + "/Plans/" + buildingPlan.Id,
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder
                };
                var folderPlanPhysicalPath = System.Web.HttpContext.Current.Server.MapPath("~/" + buildingPlanBucket.PhysicalPath);
                var bucketFolder = System.IO.Path.Combine(folderPlanPhysicalPath, buildingPlanBucket.Name);
                if (!System.IO.Directory.Exists(bucketFolder))
                    System.IO.Directory.CreateDirectory(bucketFolder);
                serviceManager.GetService<IFileBucketsService>().Add(buildingPlanBucket);
                building.BuildingPlans.Add(buildingPlan);
                serviceManager.Commit();

                var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);

                // This illustrates how to get the file names.
                foreach (MultipartFileData fileData in provider.FileData)
                {
                    File.Move(fileData.LocalFileName, destinationPath);
                }

                serviceManager.GetService<IResizeImageService>().ResizeImageFile(destinationPath, width, height, keepAspectRatio);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        /// <summary>
        /// Delete the BuildingPlan with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var buildingPlanService = service.GetService<IBuildingPlanService>();
                    BuildingPlan bp = await buildingPlanService.GetAll().Include(x => x.PlanFile.FileBucket).Include(x => x.Hotspots)
                               .Include(x => x.PlanThumbnailFile).FirstOrDefaultAsync(x => x.Id == id);

                    if (bp == null)
                        return NotFound();

                    if (bp.PlanFile.FileBucket != null)
                    {
                        var fileBucketService = service.GetService<IFileBucketsService>();
                        fileBucketService.SetDeleted(bp.PlanFile.FileBucket);
                    }
                    if (bp.PlanFile != null)
                    {
                        var fileService = service.GetService<IFilesService>();
                        fileService.SetDeleted(bp.PlanFile);
                    }
                    if (bp.PlanThumbnailFile != null)
                    {
                        var fileService = service.GetService<IFilesService>();
                        fileService.SetDeleted(bp.PlanThumbnailFile);
                    }
                    if (bp.Hotspots != null)
                    {
                        var fileBucketService = service.GetService<IHotspotService>();
                        bp.Hotspots.ToList().ForEach(x => fileBucketService.SetDeleted(x));
                    }

                    await buildingPlanService.SetDeletedAsync(bp);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
        [HttpPost]
        public async Task<IHttpActionResult> EditDetails([FromBody] BuildingPlanDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var buildingPlanService = service.GetService<IBuildingPlanService>();
                    BuildingPlan bp = await buildingPlanService.GetAll().FirstOrDefaultAsync(x => x.Id == dto.Id);

                    if (bp == null)
                        return BadRequest("Item not found");
                    bp.Name = dto.Name;
                    bp.Description = dto.Description;
                    await buildingPlanService.UpdateAsync(bp);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
        [HttpPost]
        public async Task<IHttpActionResult> EditPlan([FromBody]Signature data)
        {
            try
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    string root = HttpContext.Current.Server.MapPath("~/App_Data");
                    byte[] photo = Convert.FromBase64String(data.Value);

                    var buildingPlanService = serviceManager.GetService<IBuildingPlanService>();
                    var plan = await buildingPlanService.GetAll().Where(a => a.IsActive)
                                .Include("PlanFile.FileBucket")
                                .Include("PlanThumbnailFile.FileBucket")
                                .Include("PlanZoomFile.FileBucket")
                                .Include(x => x.Building)
                                .Include(x => x.Hotspots)
                                .Include("Hotspots.Files.FileBucket").FirstOrDefaultAsync(x => x.Id == data.Id);

                    if (plan == null)
                        Request.CreateResponse(HttpStatusCode.NoContent);

                    var planImage = plan.PlanFile;
                    var originalImageVs = HttpContext.Current.Server.MapPath("~/" + planImage.FileBucket.PhysicalPath + "/" + planImage.FileBucket.Name + "/" + planImage.Name);
                    var imageName = Tools.Helper.SetFileNameVersion(originalImageVs);
                    using (System.IO.FileStream fs = System.IO.File.Create(imageName))
                    {
                        fs.Write(photo, 0, photo.Length);
                    }
                    plan.PlanFile.Name = plan.PlanThumbnailFile.Name = Path.GetFileName(imageName);
                    await buildingPlanService.UpdateAsync(plan);
                }
                return Ok();
            }
            catch (System.Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        [ResponseType(typeof(BuildingPlanBulkInsertDto[]))]
        public async Task<IHttpActionResult> BulkPlanInsert([FromBody] BuildingPlanBulkInsertDto[] dtos)
        {
            try
            {
                if (dtos != null)
                {
                    var buildingId = dtos.FirstOrDefault().BuildingId;
                    var serviceManager = new Service(DataBaseId, UserId);
                    Building building = serviceManager.GetService<IBuildingService>().GetAll().Include(a => a.Actor).Include("BuildingPlans.PlanFile")
                            .Include("BuildingPlans.PlanThumbnailFile").FirstOrDefault(a => a.Id == buildingId);

                    if (building == null)
                        return BadRequest("Building not found.");

                    Actor actor = building.Actor;
                    FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == actor.Name + "/Buildings/" + building.Id + "/Plans");
                    if (bucket == null)
                        throw new HttpResponseException(HttpStatusCode.Conflict);

                    foreach (BuildingPlanBulkInsertDto dto in dtos)
                    {
                        if (dto.Import)
                        {
                            var sourcePath = HttpContext.Current.Server.MapPath("~/" + dto.PlanImageSrc);
                            var fileName = Path.GetFileName(Tools.Helper.SetFileNameVersion(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + dto.Name + System.IO.Path.GetExtension(sourcePath))));

                            Files file = serviceManager.GetService<IFilesService>().Create();
                            file.Id = Guid.NewGuid().ToString();
                            file.Name = fileName;
                            file.Description = dto.Description;
                            file.FileBucketId = bucket.Id;
                            serviceManager.GetService<IFilesService>().Add(file);

                            Files thumbFile = serviceManager.GetService<IFilesService>().Create();
                            thumbFile.Id = Guid.NewGuid().ToString();
                            thumbFile.Name = fileName;
                            thumbFile.Description = dto.Description;
                            thumbFile.FileBucketId = bucket.Id;
                            serviceManager.GetService<IFilesService>().Add(thumbFile);

                            BuildingPlan buildingPlan = new BuildingPlan();
                            buildingPlan.Id = Guid.NewGuid().ToString();
                            buildingPlan.PlanFileId = file.Id;
                            buildingPlan.PlanThumbnailFileId = thumbFile.Id;
                            buildingPlan.BuildingId = dto.BuildingId;
                            buildingPlan.Name = dto.Name;
                            buildingPlan.Description = dto.Description;
                            building.BuildingPlans.Add(buildingPlan);
                            await serviceManager.CommitAsync();

                            var destinationPath = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + file.Name);
                            System.IO.File.Copy(sourcePath, destinationPath);
                        }
                    }
                }
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public async Task<HttpResponseMessage> BulkPlanInsertUpload()
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

                string buildingId = provider.FormData["BuildingId"];
                // get the fileBucket
                var serviceManager = new Service(DataBaseId, UserId);
                var tempFolder = HttpContext.Current.Server.MapPath(Tools.DefaultValues.PDFTOIMG + buildingId);
                var tempFolderRel = Tools.DefaultValues.PDFTOIMG + buildingId;
                if (!System.IO.Directory.Exists(tempFolder))
                {
                    System.IO.Directory.CreateDirectory(tempFolder);
                }
                else
                {
                    System.IO.DirectoryInfo downloadedMessageInfo = new DirectoryInfo(tempFolder);
                    foreach (FileInfo file in downloadedMessageInfo.GetFiles())
                        file.Delete();
                    foreach (DirectoryInfo dir in downloadedMessageInfo.GetDirectories())
                        dir.Delete(true);
                }

                var destinationPath = tempFolder + @"\pdf.pdf";

                // This illustrates how to get the file names.
                foreach (MultipartFileData fileData in provider.FileData)
                {
                    File.Move(fileData.LocalFileName, destinationPath);
                }
                // export PDF to TIFF image
                // need to call ghostscript
                string tiffPath = tempFolder + @"\pdf%d.jpg";
                string gsCommand = string.Format("-dNOPAUSE  -sDEVICE=jpeg -r300 -dCOLORSCREEN -dDOINTERPOLATE -o \"{0}\" \"{1}\"", tiffPath, destinationPath);
                //String args = "-dNOPAUSE -sDEVICE=pngalpha -r300 -dBATCH -dSAFER -sOutputFile=" + fileName + "-%03d" + FILEEXTENSION + " " + fileName + ".pdf";
                System.Diagnostics.Process p = new System.Diagnostics.Process();
                p.StartInfo.FileName = System.Configuration.ConfigurationManager.AppSettings["GsPath"];
                p.StartInfo.Arguments = gsCommand;
                p.Start();
                p.WaitForExit();

                string[] files = Directory.GetFiles(tempFolder, "*.jpg");

                List<BuildingPlanBulkInsertDto> result = new List<BuildingPlanBulkInsertDto>();
                if (files != null)
                {
                    for (int i = 1; i <= files.Length; i++)
                    {
                        string searchedFilename = string.Format(tempFolder + "/pdf{0}.jpg", i.ToString());
                        if (File.Exists(searchedFilename))
                        {
                            result.Add(new BuildingPlanBulkInsertDto()
                            {
                                Id = i.ToString(),
                                PlanImageSrc = tempFolderRel.Replace("\\", "/") + "/" + string.Format("pdf{0}.jpg", i.ToString()),
                                BuildingId = buildingId,
                                Name = string.Format("Imported plan {0}", i.ToString()),
                            });
                        }
                    }
                }
                return Request.CreateResponse(HttpStatusCode.OK, result);
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        public async Task<IHttpActionResult> SetOrder([FromBody] BuildingPlanDto[] dtos)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                if (dtos == null || dtos.Count() == 0)
                    return Ok();
                var ids = dtos.Select(t => t.Id).ToList();
                var buildingPlanService = service.GetService<IBuildingPlanService>();
                var items = await buildingPlanService.GetAll().Where(t => ids.Contains(t.Id)).ToListAsync();
                List<BuildingPlan> results = new List<BuildingPlan>(items.Count);
                for (int i = 0; i < dtos.Count(); i++)
                {
                    var item = items.FirstOrDefault(x => x.Id == dtos[i].Id);
                    if (item != null)
                    {
                        item.Order = i;
                        results.Add(item);
                        buildingPlanService.Update(item);
                    }
                }
                await service.CommitAsync();
            }
            return Ok();
        }
    }
}


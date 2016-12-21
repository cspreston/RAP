using BusinessObjects;
using Common;
using Common.Core;
using Common.Domain;
using Common.Independent;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.IO.Compression;
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
using Tools;
using WebApi.OutputCache.V2;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class BuildingController : BaseApiController
    {

        /// <summary>
        /// Return all the Building from the database with IsActive=true
        /// </summary>
        /// <returns></returns>
        [ResponseType(typeof(PageResult<BuildingDto>))]
        public IHttpActionResult GetAll(ODataQueryOptions<Building> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var result = serviceManager.GetService<IBuildingService>().GetAll().Where(a => a.IsActive)
                                            .Include(x => x.Actor)
                                            .Include(x => x.BuildingPlans)
                                            .Include("BuildingImages.File.FileBucket")
                                            .OrderByDescending(x => x.UpdateDate);

                if (options.SelectExpand != null)
                {
                    Request.ODataProperties().SelectExpandClause = options.SelectExpand.SelectExpandClause;
                    return Ok<PageResult<BuildingDto>>(new PageResult<BuildingDto>(result.ToDtos(), null, result.Count()));
                }
                else
                    return Ok<PageResult<BuildingDto>>(new PageResult<BuildingDto>((options.ApplyTo(result.AsQueryable()) as IQueryable<Building>).ToDtos(), null, result.Count()));
            }
        }

        /// <summary>
        /// Get the building in BuildingDto format with the specified id. Remember that the building need to have IsActive=true
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(BuildingDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                var result = await GetBuildingToDto(id, new Service(DataBaseId, UserId).GetService<IBuildingService>());
                if (result == null)
                    return NotFound();
                else
                    return Ok(result);
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Edit the building from DB with the specified id, with the dates from the given BuldingDto.
        /// Afterwards the function return the dto created from the modified build from the DB.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(BuildingDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] BuildingDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var buildingService = service.GetService<IBuildingService>();
                    Building bld = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor)
                              .Include("BuildingImages.File.FileBucket")
                              .Include("BuildingPlans.PlanThumbnailFile.FileBucket")
                              .Include("BuildingPlans.Hotspots.HotspotDisplayType").Include("BuildingDisasterInfos.File.FileBucket")
                              .Include("BuildingFiles.File.FileBucket")
                              .Include(x => x.ActorBuildingPermissions)
                              .Include("ActorBuildingPermissions.Actor.ActorPermissions")
                              .Include(x => x.ContactInfo).Include(x => x.PrinceInfo).FirstOrDefaultAsync(a => a.Id == id);
                    if (bld == null)
                        return BadRequest("Item not found");

                    var actor = bld.Actor;
                    bld.ActorId = dto.ActorId;
                    bld.Address = dto.Address;
                    bld.ZIP = dto.ZIP;
                    bld.BuildingsNo = dto.BuildingsNo;
                    bld.BuildingType = dto.BuildingType;
                    bld.ConstructionType = dto.ConstructionType;
                    bld.Description = dto.Description;
                    bld.EmergencyEmail = dto.EmergencyEmail;
                    bld.EmergencyPhone = dto.EmergencyPhone;
                    bld.FeaturedImageId = dto.FeaturedImageId;
                    bld.Id = dto.Id;
                    bld.Name = dto.Name;
                    bld.UnitsNo = dto.UnitsNo;
                    bld.Geopoints = dto.Geopoints;

                    BuildingDisplayConfiguration val = 0;
                    if (dto.ShowContact)
                        val = BuildingDisplayConfiguration.Contact;
                    if (dto.ShowDisaster)
                        val = val | BuildingDisplayConfiguration.Disaster;
                    if (dto.ShowFiles)
                        val = val | BuildingDisplayConfiguration.Files;
                    if (dto.ShowFolders)
                        val = val | BuildingDisplayConfiguration.Folders;
                    if (dto.ShowPricing)
                        val = val | BuildingDisplayConfiguration.Pricing;
                    bld.DisplayConfiguration = val;

                    bld.ActorBuildingPermissions = bld.ActorBuildingPermissions ?? new List<ActorBuilding>();
                    dto.UserIds = dto.UserIds != null ? dto.UserIds.Where(x => x != null).ToList() : new List<string>();
                    var buildUsers = bld.ActorBuildingPermissions.ToList();


                    foreach (var buildUser in buildUsers.ToList())
                    {
                        if (!dto.UserIds.Contains(buildUser.ActorId))
                        {
                            var roles = await UserManager.GetRolesAsync(buildUser.ActorId);
                            if (roles.Count(t => t == DefaultValues.TENANT || t == DefaultValues.CLIENT_ADMIN) == 0)
                                buildUsers.Remove(buildUser);
                        }
                    }
                    foreach (var user in dto.UserIds)
                    {
                        var newUC = buildUsers.FirstOrDefault(x => x.ActorId == user);
                        if (newUC != null)
                        {
                            if (!newUC.IsActive)
                                newUC.IsActive = true;
                        }
                        else
                        {
                            buildUsers.Add(new ActorBuilding() { BuildingId = bld.Id, ActorId = user, CreateDate = DateTime.UtcNow, CreatedBy = UserId });
                        }
                    }

                    bld.ActorBuildingPermissions = buildUsers;

                    // Save the changes to the DB.
                    await buildingService.UpdateAsync(bld);
                    var removedFromPermissionUserIds = buildUsers.Select(t => t.ActorId).ToList().Where(c => !dto.UserIds.Contains(c)).ToList();

                    if (removedFromPermissionUserIds != null && removedFromPermissionUserIds.Count > 0)
                    {
                        var folderPermissionService = service.GetService<IActorPermissionService>();
                        var perss = folderPermissionService.GetAll().Where(x => removedFromPermissionUserIds.Contains(x.ActorId) && x.Value.Contains(bld.Id) && x.Resource == PermissionResource.Files).ToList();
                        await folderPermissionService.BulkDeleteAsync(perss);
                    }

                    if (actor.Id != dto.ActorId)
                    {
                        var fileBucketsService = service.GetService<IFileBucketsService>();
                        var files = fileBucketsService.GetAll().Where(x => x.Name.Contains(bld.Id)).ToList();
                        if (files.Any())
                        {
                            foreach (var file in files)
                            {
                                file.Name = file.Name.Replace(actor.Name, dto.ActorName);
                                fileBucketsService.Update(file);
                            }
                            await service.CommitAsync();
                        }
                        var sPath = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + "\\" + actor.Name + "\\" + "Buildings\\" + bld.Id);
                        var dPath = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + "\\" + dto.ActorName + "\\" + "Buildings\\" + bld.Id);
                        Tools.Helper.Copy(sPath, dPath);
                        //move bildings files
                    }

                    // Recreate the BuildingDto from the modified building.
                    dto = await GetBuildingToDto(id, buildingService, bld);


                    if (dto == null)
                        return BadRequest("Item not found");
                    else
                        return Ok(dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [OverrideAuthorization]
        [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN + "," + DefaultValues.BUILDING_ADMIN + "," + DefaultValues.BUILDING_VIEWER)]
        /// <summary>
        /// Add a new building to the DB, with the dates from the given BuildingDto, and return the added building.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] BuildingDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    var actorsQuery = serviceManager.GetService<IActorService>().GetAll();

                    if (dto.UserIds != null && dto.UserIds.Count > 0)
                    {
                        actorsQuery = actorsQuery.Where(t => (t.Id == dto.ActorId) || ((dto.UserIds.Contains(t.Id) && t.Type == ActorType.BusinessUser)));
                    }
                    else
                    {
                        actorsQuery = actorsQuery.Where(t => t.Id == dto.ActorId);
                    }
                    var results = await actorsQuery.ToListAsync();
                    Actor tenant = results.FirstOrDefault(a => a.Id == dto.ActorId);

                    if (tenant == null)
                        return BadRequest("Client not found!");

                    var buildingService = serviceManager.GetService<IBuildingService>();

                    Building bld = buildingService.Create();
                    bld.Id = Guid.NewGuid().ToString();
                    bld.Name = dto.Name;
                    bld.ActorId = dto.ActorId;
                    bld.Address = dto.Address;
                    bld.ZIP = dto.ZIP;
                    bld.BuildingsNo = dto.BuildingsNo;
                    bld.BuildingType = dto.BuildingType;
                    bld.ConstructionType = dto.ConstructionType;
                    bld.Description = dto.Description;
                    bld.EmergencyEmail = dto.EmergencyEmail;
                    bld.EmergencyPhone = dto.EmergencyPhone;
                    bld.FeaturedImageId = dto.FeaturedImageId;
                    bld.UnitsNo = dto.UnitsNo;
                    bld.Geopoints = dto.Geopoints;

                    bld.IsActive = true;
                    bld.CreatedBy = UserId;
                    bld.CreateDate = DateTime.Now;
                    bld.UpdateDate = bld.CreateDate;

                    BuildingDisplayConfiguration val = 0;
                    if (dto.ShowContact)
                        val = BuildingDisplayConfiguration.Contact;
                    if (dto.ShowDisaster)
                        val = val | BuildingDisplayConfiguration.Disaster;
                    if (dto.ShowFiles)
                        val = val | BuildingDisplayConfiguration.Files;
                    if (dto.ShowFolders)
                        val = val | BuildingDisplayConfiguration.Folders;
                    if (dto.ShowPricing)
                        val = val | BuildingDisplayConfiguration.Pricing;
                    bld.DisplayConfiguration = val;


                    if (dto.UserIds != null)
                    {
                        bld.ActorBuildingPermissions = new List<ActorBuilding>();
                        var acts = results.Where(t => dto.UserIds.Contains(t.Id)).ToList();
                        var usrIds = dto.UserIds.Except(acts.Select(t => t.Id)).ToList();
                        List<Actor> actors = new List<Actor>();
                        if (usrIds.Count > 0)
                        {
                            var users = serviceManager.GetService<IUserService>().GetAll().Where(t => usrIds.Contains(t.Id) && t.DataBaseId == DataBaseId).ToList();
                            foreach (var user in users)
                            {
                                var act = new Actor();
                                act.Id = user.Id;
                                act.Name = user.UserName;
                                act.Type = ActorType.BusinessUser;
                                act.CreateDate = act.UpdateDate = DateTime.UtcNow;
                                act.IsActive = true;
                                actors.Add(act);
                            }
                            await serviceManager.GetService<IActorService>().AddOrUpdateAsync(x => x.Id, actors);
                        }
                        foreach (var s in dto.UserIds)
                        {
                            var el = acts.FirstOrDefault(x => x.Id == s);
                            if (el == null)
                                el = actors.FirstOrDefault(x => x.Id == s);
                            if (el != null)
                                bld.ActorBuildingPermissions.Add(new ActorBuilding() { BuildingId = bld.Id, ActorId = el.Id, CreateDate = DateTime.UtcNow, CreatedBy = UserId });
                        }
                    }
                    // Creating all the files needed for the building.
                    var buckets = buildingService.CreateSiteFileBucket(tenant.Name, bld.Id);
                    var serviceBuckets = serviceManager.GetService<IFileBucketsService>();
                    await serviceBuckets.AddOrUpdateAsync(a => new { a.Id }, buckets);
                    await buildingService.AddAsync(bld);
                    return Created<BuildingDto>(Request.RequestUri, dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [OverrideAuthorization]
        [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN + "," + DefaultValues.BUILDING_ADMIN + "," + DefaultValues.BUILDING_VIEWER)]

        /// <summary>
        /// Delete the building with specified id from the DB. 
        /// In short words, set the IsActive property of the building to false
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        [ResponseType(typeof(BuildingDto))]
        public async Task<IHttpActionResult> TakeOffLine([FromBody] string ids)
        {
            if (this.ModelState.IsValid)
            {
                var values = JArray.Parse(ids).ToList().Select(c => ((JValue)c).Value.ToString()).ToList();
                using (var buildingService = new Service(DataBaseId, UserId).GetService<IBuildingService>())
                {
                    var buildings = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor.ActorPermissions)
                                        .Include("BuildingImages.File.FileBucket")
                                        .Include("BuildingPlans.PlanThumbnailFile.FileBucket")
                                        .Include("BuildingPlans.Hotspots.HotspotDisplayType")
                                        .Include("BuildingPlans.Hotspots.Files.FileBucket")
                                        .Include("BuildingDisasterInfos.File.FileBucket")
                                        .Include("BuildingFiles.File.FileBucket")
                                        .Include(x => x.ContactInfo).Include(x => x.PrinceInfo).Where(a => values.Contains(a.Id))
                                        .ToListAsync();
                    var response = new List<BuildingDto>();

                    #region convert to dto
                    foreach (var item in buildings)
                    {
                        var dto = new BuildingDto();
                        dto.Id = item.Id;
                        dto.ActorId = item.ActorId;
                        dto.ActorName = item.Actor.Name;
                        dto.Name = item.Name;
                        dto.Description = item.Description;
                        dto.Address = item.Address;
                        dto.ZIP = item.ZIP;
                        dto.BuildingsNo = item.BuildingsNo;
                        dto.Geopoints = item.Geopoints;
                        dto.BuildingType = item.BuildingType;
                        dto.ConstructionType = item.ConstructionType;
                        dto.EmergencyEmail = item.EmergencyEmail;
                        dto.EmergencyPhone = item.EmergencyPhone;
                        dto.UnitsNo = item.UnitsNo;
                        dto.FeaturedImageId = item.FeaturedImageId;
                        dto.ImagesCount = item.BuildingImages != null ? item.BuildingImages.Count(t => t.IsActive) : 0;
                        dto.ViewsCount = item.BuildingPlans != null ? item.BuildingPlans.Count(t => t.IsActive) : 0;
                        dto.DisplayConfiguration = item.DisplayConfiguration;
                        dto.IsOffline = item.IsOffline;
                        dto.ShowContact = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Contact) == BuildingDisplayConfiguration.Contact || !item.DisplayConfiguration.HasValue) ? true : false;
                        dto.ShowDisaster = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Disaster) == BuildingDisplayConfiguration.Disaster || !item.DisplayConfiguration.HasValue) ? true : false;
                        dto.ShowFiles = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Files) == BuildingDisplayConfiguration.Files || !item.DisplayConfiguration.HasValue) ? true : false;
                        dto.ShowFolders = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Folders) == BuildingDisplayConfiguration.Folders || !item.DisplayConfiguration.HasValue) ? true : false;
                        dto.ShowPricing = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Pricing) == BuildingDisplayConfiguration.Pricing || !item.DisplayConfiguration.HasValue) ? true : false;
                        // Convert list of BuildingImage to BuildingImageDto
                        dto.BuildingImages = item.BuildingImages != null ? item.BuildingImages.Where(z => z.IsActive && z.File != null && z.File.FileBucket != null).OrderBy(x => x.Order).ThenBy(x => x.File.Name).ThenBy(x => x.CreateDate).Select(b => new BuildingImageDto
                        {
                            Id = b.Id,
                            BucketName = b.File.FileBucket.Name,
                            BucketPath = b.File.FileBucket.PhysicalPath,
                            FileName = b.File.Name,
                            FileDescription = b.File.Description,
                        }).ToList() : new List<BuildingImageDto>();
                        dto.BuildingDisasterInfos = item.BuildingDisasterInfos != null ? item.BuildingDisasterInfos.Where(z => z.IsActive).Select(b => new BuildingDisasterInfoDto()
                        {
                            Id = b.Id,
                            Description = b.Description,
                            Title = b.Title,
                            BuildingId = b.BuildingId,
                            FileId = b.FileId,
                            File = new FileWithButcketDTO()
                            {
                                Id = b.File.Id,
                                BucketName = b.File.FileBucket.Name,
                                BucketPath = b.File.FileBucket.PhysicalPath,
                                FileName = b.File.Name,
                                FileDescription = b.File.Description
                            }
                        }).ToList() : new List<BuildingDisasterInfoDto>();
                        dto.BuildingFiles = item.BuildingFiles != null ? item.BuildingFiles.Where(z => z.IsActive).Select(b => new BuildingFileDto()
                        {
                            Id = b.Id,
                            Description = b.Description,
                            Title = b.Title,
                            BuildingId = b.BuildingId,
                            FileId = b.FileId,
                            Type = b.Type,
                            File = new FileWithButcketDTO()
                            {
                                Id = b.File.Id,
                                BucketName = b.File.FileBucket.Name,
                                BucketPath = b.File.FileBucket.PhysicalPath,
                                FileName = b.File.Name,
                                FileDescription = b.File.Description
                            }
                        }).ToList() : new List<BuildingFileDto>();
                        var buildingPlanDtos = new List<BuildingPlanDto>();
                        if (item.BuildingPlans != null)
                        {
                            foreach (var buildingPlan in item.BuildingPlans.Where(z => z.IsActive))
                            {
                                var buildingPlanDto = new BuildingPlanDto();
                                buildingPlanDto.Hotspots = buildingPlanDto.Hotspots ?? new List<HotspotDto>();
                                buildingPlanDto.BuildingId = buildingPlan.BuildingId;
                                buildingPlanDto.Description = buildingPlan.Description;
                                buildingPlanDto.Id = buildingPlan.Id;
                                buildingPlanDto.Name = buildingPlan.Name;
                                buildingPlanDto.HotspotsCount = buildingPlan.Hotspots != null ? buildingPlan.Hotspots.Count(v => v.IsActive && (v.HotspotDisplayType.Type != HotspotType.Line && v.HotspotDisplayType.Type != HotspotType.Circle)) : 0;
                                buildingPlanDto.PlanThumbnailFileId = buildingPlan.PlanThumbnailFileId;
                                buildingPlanDto.PlanFileId = buildingPlan.PlanFileId;
                                buildingPlanDto.PlanThumbnailFile = new FileWithButcketDTO
                                {
                                    Id = buildingPlan.PlanThumbnailFile.Id,
                                    BucketName = buildingPlan.PlanThumbnailFile.FileBucket.Name,
                                    BucketPath = buildingPlan.PlanThumbnailFile.FileBucket.PhysicalPath,
                                    FileName = buildingPlan.PlanThumbnailFile.Name,
                                    FileDescription = buildingPlan.PlanThumbnailFile.Description,
                                };
                                buildingPlanDto.PlanFile = new FileWithButcketDTO
                                {
                                    Id = buildingPlan.PlanFile.Id,
                                    BucketName = buildingPlan.PlanFile.FileBucket.Name,
                                    BucketPath = buildingPlan.PlanFile.FileBucket.PhysicalPath,
                                    FileName = buildingPlan.PlanFile.Name,
                                    FileDescription = buildingPlan.PlanFile.Description,
                                };
                                if (buildingPlanDto.HotspotsCount > 0)
                                {
                                    var hps = buildingPlan.Hotspots.Where(x => x.IsActive).ToList();
                                    var dtoHps = new List<HotspotDto>();
                                    foreach (var b in hps)
                                    {
                                        var dtoHp = new HotspotDto()
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
                                            Files = b.Files != null ? b.Files.Where(q => q.IsActive).Select(z => new FileWithButcketDTO()
                                            {
                                                Id = z.Id,
                                                BucketName = z.FileBucket.Name,
                                                BucketPath = z.FileBucket.PhysicalPath,
                                                FileName = z.Name,
                                                FileDescription = z.Description
                                            }).ToList() : new List<FileWithButcketDTO>()
                                        };
                                        dtoHps.Add(dtoHp);
                                    }
                                    buildingPlanDto.Hotspots = dtoHps;
                                }
                                buildingPlanDtos.Add(buildingPlanDto);
                            }
                        };
                        dto.BuildingPlans = buildingPlanDtos;

                        //dto.BuildingPlans = item.BuildingPlans != null ? item.BuildingPlans.Where(z => z.IsActive).OrderBy(x => x.Order).ThenBy(x => x.Name).ThenBy(x => x.CreateDate).Select(c => new BuildingPlanDto()
                        //{
                        //    BuildingId = c.BuildingId,
                        //    Description = c.Description,
                        //    Id = c.Id,
                        //    Name = c.Name,
                        //    HotspotsCount = c.Hotspots != null ? c.Hotspots.Count(v => v.IsActive && (v.HotspotDisplayType.Type != HotspotType.Line && v.HotspotDisplayType.Type != HotspotType.Circle)) : 0,
                        //    PlanThumbnailFileId = c.PlanThumbnailFileId,
                        //    PlanFileId = c.PlanFileId,
                        //    PlanThumbnailFile = new FileWithButcketDTO
                        //    {
                        //        Id = c.PlanThumbnailFile.Id,
                        //        BucketName = c.PlanThumbnailFile.FileBucket.Name,
                        //        BucketPath = c.PlanThumbnailFile.FileBucket.PhysicalPath,
                        //        FileName = c.PlanThumbnailFile.Name,
                        //        FileDescription = c.PlanThumbnailFile.Description,
                        //    },
                        //    PlanFile = new FileWithButcketDTO
                        //    {
                        //        Id = c.PlanFile.Id,
                        //        BucketName = c.PlanFile.FileBucket.Name,
                        //        BucketPath = c.PlanFile.FileBucket.PhysicalPath,
                        //        FileName = c.PlanFile.Name,
                        //        FileDescription = c.PlanFile.Description,
                        //    },
                        //    Hotspots = item.Hotspots != null ? item.Hotspots.Where(b => b.IsActive==true).ToList().OrderBy(x => x.CreateDate).Select(b => new HotspotDto()
                        //    {
                        //        BeaconuuId = b.BeaconuuId,
                        //        BuildingId = b.BuildingId,
                        //        BuildingPlanId = b.BuildingPlanId,
                        //        HotspotActionTypeId = b.HotspotActionTypeId,
                        //        HotspotDisplayTypeId = b.HotspotDisplayTypeId,
                        //        Name = b.Name,
                        //        Description = b.Description,

                        //        HotspotActionType = new HotspotActionTypeDto()
                        //        {
                        //            AllowAttachment = b.HotspotActionType.AllowAttachment,
                        //            Id = b.HotspotActionType.Id,
                        //            Name = b.HotspotActionType.Name,
                        //            Description = b.HotspotActionType.Description

                        //        },
                        //        HotspotDisplayType = new HotspotDisplayTypeDto()
                        //        {
                        //            Id = b.HotspotDisplayType.Id,
                        //            Name = b.HotspotDisplayType.Name,
                        //            Description = b.HotspotDisplayType.Description,
                        //            FileName = b.HotspotDisplayType.FileName,
                        //            Color = b.HotspotDisplayType.Color,
                        //            Type = b.HotspotDisplayType.Type
                        //        },
                        //        Id = b.Id,
                        //        DisplayDetails = b.DisplayDetails,
                        //        Files = b.Files != null ? b.Files.Where(q => q.IsActive).Select(z => new FileWithButcketDTO()
                        //        {
                        //            Id = z.Id,
                        //            BucketName = z.FileBucket.Name,
                        //            BucketPath = z.FileBucket.PhysicalPath,
                        //            FileName = z.Name,
                        //            FileDescription = z.Description
                        //        }).ToList() : new List<FileWithButcketDTO>()
                        //    }).ToList() : new List<HotspotDto>()
                        //}).ToList() : new List<BuildingPlanDto>();
                        // Convert list of PrincingInfo to PrincingInfoDto

                        dto.PricingInfos = item.PrinceInfo != null ? item.PrinceInfo.Where(z => z.IsActive).Select(b => new PricingInfoDto
                        {
                            Id = b.Id,
                            BuildingId = b.BuildingId,
                            Description = b.Description,
                            Quantity = b.Quantity,
                            UnitPrice = b.UnitPrice,
                            Units = b.Units,
                            Name = b.Name
                        }).ToList() : new List<PricingInfoDto>();
                        // Convert list of ContactInfo to ContactInfoDto
                        dto.ContactInfos = item.ContactInfo != null ? item.ContactInfo.Where(z => z.IsActive).Select(b => new ContactInfoDto
                        {
                            Id = b.Id,
                            BuildingId = b.BuildingId,
                            Address = b.Address,
                            SecondAddress = b.SecondAddress,
                            EmailAddress = b.EmailAddress,
                            FirstName = b.FirstName,
                            LastName = b.LastName,
                            MobilePhone = b.MobilePhone,
                            Phone = b.Phone,
                            Role = b.Role,
                            Title = b.Title,
                            City = b.City,
                            State = b.State,
                            Zip = b.Zip
                        }).ToList() : new List<ContactInfoDto>();
                        response.Add(dto);
                    }
                    #endregion
                    return Ok(response);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        public async Task<IHttpActionResult> SyncFromOffLine([FromBody] BuildingDto dto)
        {
            try
            {
                if (this.ModelState.IsValid)
                {
                    #region Sync building
                    using (var serviceManager = new Service(DataBaseId, UserId))
                    {
                        var buildingService = serviceManager.GetService<IBuildingService>();
                        var imageService = serviceManager.GetService<IBuildingImageService>();
                        var planService = serviceManager.GetService<IBuildingPlanService>();
                        var fileBucketsService = serviceManager.GetService<IFileBucketsService>();
                        var filesService = serviceManager.GetService<IFilesService>();
                        var hotspotService = serviceManager.GetService<IHotspotService>();
                        //we need to get latest info for curent building
                        Building bld = await buildingService.GetAll().Where(a => a.IsActive)
                                           .Include("BuildingImages.File.FileBucket")
                                           .Include("BuildingPlans.PlanThumbnailFile.FileBucket")
                                           .Include("BuildingPlans.Hotspots.HotspotDisplayType")
                                           .Include("BuildingPlans.Hotspots.Files.FileBucket")
                                           .Include("BuildingDisasterInfos.File.FileBucket")
                                           .Include("BuildingFiles.File.FileBucket")
                                           .Include(x => x.ContactInfo).Include(x => x.PrinceInfo).Where(a => a.Id == dto.Id).FirstOrDefaultAsync();
                        if (bld == null)
                            return BadRequest("Item not found");

                        #region sync building details
                        bld.Address = dto.Address;
                        bld.ZIP = dto.ZIP;
                        bld.BuildingsNo = dto.BuildingsNo;
                        bld.BuildingType = dto.BuildingType;
                        bld.ConstructionType = dto.ConstructionType;
                        bld.Description = dto.Description;
                        bld.EmergencyEmail = dto.EmergencyEmail;
                        bld.EmergencyPhone = dto.EmergencyPhone;
                        bld.FeaturedImageId = dto.FeaturedImageId;
                        bld.Name = dto.Name;
                        bld.UnitsNo = dto.UnitsNo;
                        BuildingDisplayConfiguration val = 0;
                        if (dto.ShowContact)
                            val = BuildingDisplayConfiguration.Contact;
                        if (dto.ShowDisaster)
                            val = val | BuildingDisplayConfiguration.Disaster;
                        if (dto.ShowFiles)
                            val = val | BuildingDisplayConfiguration.Files;
                        if (dto.ShowFolders)
                            val = val | BuildingDisplayConfiguration.Folders;
                        if (dto.ShowPricing)
                            val = val | BuildingDisplayConfiguration.Pricing;
                        bld.DisplayConfiguration = val;
                        // Save the changes to the DB.
                        //we have to remove deleted images from offline
                        foreach (var image in bld.BuildingImages.Where(x => x.IsActive).ToList())
                        {
                            var img = dto.BuildingImages.FirstOrDefault(x => x.Id == image.Id);
                            if (img == null)
                            {
                                image.IsActive = false;
                                image.Order = 0;
                            }
                        }
                        //we have to remove deleted plans from offline
                        foreach (var plan in bld.BuildingPlans.Where(x => x.IsActive).ToList())
                        {
                            var dtoPlan = dto.BuildingPlans.FirstOrDefault(x => x.Id == plan.Id);
                            if (dtoPlan == null)
                            {
                                plan.IsActive = false;
                                plan.Order = 0;
                                plan.Hotspots = plan.Hotspots ?? new List<Hotspot>();
                                plan.Hotspots.ToList().ForEach(x => x.IsActive = false);
                            }
                        }
                        await buildingService.UpdateAsync(bld);
                        #endregion

                        #region sync images
                        FileBuckets bucket = fileBucketsService.GetAll().FirstOrDefault(a => a.Name == bld.Actor.Name + "/Buildings/" + bld.Id + "/Images");
                        var sortCnt = 1;
                        if (bucket != null)
                        {
                            foreach (var image in dto.BuildingImages.Where(x => x.Id.ToLower().StartsWith("new_")).ToList())
                            {
                                Files file = filesService.Create();
                                file.Id = Guid.NewGuid().ToString();
                                // file.Name = image.FileName.Substring(0, image.FileName.LastIndexOf('.')) + image.FileName.Substring(image.FileName.LastIndexOf('.'), 4);
                                file.Name = image.FileName.GetExtension();
                                file.Description = image.FileDescription;
                                file.FileBucketId = bucket.Id;
                                file.IsActive = true;
                                await filesService.AddAsync(file);

                                var buildingImage = imageService.Create();
                                buildingImage.Id = Guid.NewGuid().ToString();
                                buildingImage.File = file;
                                buildingImage.IsActive = true;
                                buildingImage.Building = bld;
                                buildingImage.BuildingId = bld.Id;
                                buildingImage.Order = bld.BuildingImages.Any() ? bld.BuildingImages.Max(t => t.Order) + sortCnt : 0;
                                // Add to the building and save the chnages.
                                await imageService.AddAsync(buildingImage);
                                bld.BuildingImages.Add(buildingImage);
                                sortCnt++;
                            }
                            //save in db
                            //  await serviceManager.CommitAsync();
                            sortCnt = 1;
                        }
                        #endregion

                        #region sync plans
                        bucket = fileBucketsService.GetAll().FirstOrDefault(a => a.Name == bld.Actor.Name + "/Buildings/" + bld.Id + "/Plans");
                        if (bucket != null)
                        {
                            #region update plans
                            foreach (var dtoPlan in dto.BuildingPlans.Where(x => !x.Id.ToLower().StartsWith("plan_")).ToList())
                            {
                                BuildingPlan plan = bld.BuildingPlans.Where(t => t.Id == dtoPlan.Id && t.IsActive == true).FirstOrDefault();
                                if (plan != null)
                                {
                                    plan.Name = dtoPlan.Name;
                                    plan.Description = dtoPlan.Description;
                                    var dtoHps = dtoPlan.Hotspots != null ? dtoPlan.Hotspots.ToList() : new List<HotspotDto>();
                                    var dbHps = plan.Hotspots != null ? plan.Hotspots.Where(x => x.IsActive).ToList() : new List<Hotspot>();
                                    if (dbHps != null && dbHps.Count > 0)
                                    {
                                        var dtoHpIds = dtoPlan.Hotspots.Select(t => t.Id).ToList();
                                        var remHps = dbHps.Where(t => !dtoHpIds.Contains(t.Id)).ToList();
                                        foreach (var remHp in remHps)
                                        {
                                            remHp.IsActive = false;
                                            var pinHps = plan.Hotspots.Where(x => x.BeaconuuId == remHp.Id).ToList();
                                            if (pinHps.Any())
                                            {
                                                pinHps.ForEach(x => x.IsActive = false);
                                            }
                                        }
                                        await planService.UpdateAsync(plan);
                                    }
                                    //get hps bucket
                                    var hpBucket = fileBucketsService.GetAll().FirstOrDefault(a => a.Name == bld.Actor.Name + "/Buildings/" + bld.Id + "/Plans/" + plan.Id);
                                    if (hpBucket == null)
                                    {
                                        hpBucket = fileBucketsService.Create();
                                        hpBucket.Id = Guid.NewGuid().ToString();
                                        hpBucket.Name = plan.Building.Actor.Name + "/Buildings/" + plan.BuildingId + "/Plans/" + plan.Id;
                                        hpBucket.FileBucketTypeId = 2;
                                        hpBucket.IsActive = true;
                                        hpBucket.PhysicalPath = DefaultValues.FILESDIRECTORY.Replace("\\", "");
                                        await fileBucketsService.AddAsync(hpBucket);
                                    }
                                    if (dtoHps.Any())
                                    {
                                        foreach (var dtoHp in dtoHps.ToList())
                                        {
                                            var hp = plan.Hotspots.FirstOrDefault(x => x.Id == dtoHp.Id);
                                            //if is not active, means that someoane has deleted online
                                            //is implemented using client win
                                            if (hp != null)
                                            {
                                                hp.HotspotActionTypeId = dtoHp.HotspotActionTypeId;
                                                hp.HotspotDisplayTypeId = dtoHp.HotspotDisplayTypeId;
                                                hp.DisplayDetails = dtoHp.DisplayDetails;
                                                hp.Name = dtoHp.Name;
                                                hp.Description = dtoHp.Description;
                                                hp.IsActive = true;
                                                hp.Files = hp.Files ?? new List<Files>();
                                                if (dtoHp.Files != null && dtoHp.Files.Count > 0)
                                                {
                                                    foreach (var dtoHpFile in dtoHp.Files)
                                                    {
                                                        var hpFile = hp.Files.FirstOrDefault(x => x.Id == dtoHpFile.Id);
                                                        if (hpFile == null)
                                                        {
                                                            // Create the new file.
                                                            hpFile = filesService.Create();
                                                            hpFile.Id = Guid.NewGuid().ToString();
                                                            hpFile.Name = dtoHpFile.FileName.GetExtension();
                                                            hpFile.Description = "";
                                                            hpFile.FileBucketId = hpBucket.Id;
                                                            hpFile.IsActive = true;
                                                            hp.Files.Add(hpFile);
                                                        }
                                                    }
                                                }
                                                //set deleted files for hp from offline
                                                foreach (var hpFile in hp.Files)
                                                {
                                                    var dtoHpFile = dtoHp.Files.FirstOrDefault(x => x.Id == hpFile.Id);
                                                    if (dtoHpFile == null)
                                                        hpFile.IsActive = false;
                                                }
                                                await hotspotService.UpdateAsync(hp);
                                            }
                                            else
                                            {
                                                hp = hotspotService.Create();
                                                hp.Id = dtoHp.Id;
                                                hp.IsActive = true;
                                                hp.BeaconuuId = dtoHp.BeaconuuId;
                                                hp.BuildingId = bld.Id;
                                                hp.BuildingPlanId = plan.Id;
                                                hp.HotspotActionTypeId = dtoHp.HotspotActionTypeId;
                                                hp.HotspotDisplayTypeId = dtoHp.HotspotDisplayTypeId;
                                                hp.DisplayDetails = dtoHp.DisplayDetails;
                                                hp.Name = dtoHp.Name;
                                                hp.Description = dtoHp.Description;
                                                hp.BeaconuuId = dtoHp.BeaconuuId;
                                                if (dtoHp.Files != null && dtoHp.Files.Count > 0)
                                                {
                                                    foreach (var dtoHpFile in dtoHp.Files)
                                                    {
                                                        // Create the new file.
                                                        Files hpfile = filesService.Create();
                                                        hpfile.Id = Guid.NewGuid().ToString();
                                                        hpfile.Name = dtoHpFile.FileName.GetExtension();
                                                        hpfile.Description = "";
                                                        hpfile.FileBucketId = hpBucket.Id;
                                                        hpfile.IsActive = true;
                                                        hp.Files.Add(hpfile);
                                                    }
                                                }
                                                await hotspotService.AddAsync(hp);
                                            }
                                        }
                                    }
                                }
                            }
                            #endregion

                            #region process new plans
                            foreach (var dtoPlan in dto.BuildingPlans.Where(x => x.Id.ToLower().StartsWith("plan_")).ToList())
                            {
                                Files file = filesService.Create();
                                file.Id = Guid.NewGuid().ToString();
                                //file.Name = plan.PlanFile.FileName.Substring(0, plan.PlanFile.FileName.LastIndexOf('.')) + plan.PlanFile.FileName.Substring(plan.PlanFile.FileName.LastIndexOf('.'), 4);
                                file.Name = dtoPlan.PlanFile.FileName.GetExtension();
                                file.Description = dtoPlan.PlanFile.FileDescription;
                                file.FileBucketId = bucket.Id;
                                file.IsActive = true;
                                await filesService.AddAsync(file);

                                Files thumbFile = filesService.Create();
                                thumbFile.Id = Guid.NewGuid().ToString();
                                // thumbFile.Name = plan.PlanFile.FileName.Substring(0, plan.PlanFile.FileName.LastIndexOf('.')) + plan.PlanFile.FileName.Substring(plan.PlanFile.FileName.LastIndexOf('.'), 4);
                                thumbFile.Name = dtoPlan.PlanFile.FileName.GetExtension();
                                thumbFile.Description = file.Description;
                                thumbFile.FileBucketId = bucket.Id;
                                thumbFile.IsActive = true;
                                await filesService.AddAsync(thumbFile);

                                BuildingPlan buildingPlan = planService.Create();
                                buildingPlan.Id = dtoPlan.Id.Replace("plan_", "");
                                buildingPlan.PlanFileId = file.Id;
                                buildingPlan.PlanThumbnailFileId = thumbFile.Id;
                                buildingPlan.BuildingId = bld.Id;
                                buildingPlan.Name = dtoPlan.Name;
                                buildingPlan.IsActive = true;
                                buildingPlan.Description = dtoPlan.Description;
                                buildingPlan.Order = bld.BuildingPlans.Any() ? bld.BuildingPlans.Max(t => t.Order) + sortCnt : 0;
                                await planService.AddAsync(buildingPlan);
                                var dtoHps = dtoPlan.Hotspots != null ? dtoPlan.Hotspots.ToList() : new List<HotspotDto>();
                                if (dtoHps.Any())
                                {
                                    buildingPlan.Hotspots = buildingPlan.Hotspots ?? new List<Hotspot>();
                                    foreach (var dtoHp in dtoHps.Where(x => x.BeaconuuId == null).ToList())
                                    {
                                        Hotspot hp = hotspotService.Create();
                                        hp.Id = dtoHp.Id;
                                        hp.IsActive = true;
                                        hp.BeaconuuId = dtoHp.BeaconuuId;
                                        hp.BuildingId = bld.Id;
                                        hp.BuildingPlan = buildingPlan;
                                        hp.HotspotActionTypeId = dtoHp.HotspotActionTypeId;
                                        hp.HotspotDisplayTypeId = dtoHp.HotspotDisplayTypeId;
                                        hp.DisplayDetails = dtoHp.DisplayDetails;
                                        hp.Name = dtoHp.Name;
                                        hp.Description = dtoHp.Description;
                                        hp.BeaconuuId = dtoHp.BeaconuuId;
                                        if (dtoHp.Files != null && dtoHp.Files.Count > 0)
                                        {
                                            var hpBucket = fileBucketsService.GetAll().FirstOrDefault(a => a.Name == bld.Actor.Name + "/Buildings/" + bld.Id + "/Plans/" + buildingPlan.Id);
                                            if (hpBucket == null)
                                            {
                                                hpBucket = fileBucketsService.Create();
                                                hpBucket.Id = Guid.NewGuid().ToString();
                                                hpBucket.Name = hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + buildingPlan.Id;
                                                hpBucket.FileBucketTypeId = 2;
                                                hpBucket.IsActive = true;
                                                hpBucket.PhysicalPath = Tools.DefaultValues.FILESDIRECTORY.Replace("\\", "");
                                                await fileBucketsService.AddAsync(hpBucket);
                                            }
                                            foreach (var dtoHpFile in dtoHp.Files)
                                            {
                                                // Create the new file.
                                                Files hpfile = filesService.Create();
                                                hpfile.Id = Guid.NewGuid().ToString();
                                                hpfile.Name = dtoHpFile.FileName.GetExtension();
                                                hpfile.Description = "";
                                                hpfile.FileBucketId = hpBucket.Id;
                                                hpfile.IsActive = true;
                                                hp.Files.Add(hpfile);
                                            }
                                        }
                                    }
                                    foreach (var dtoHp in dtoHps.Where(x => x.BeaconuuId != null).ToList())
                                    {
                                        Hotspot hp = hotspotService.Create();
                                        hp.Id = dtoHp.Id;
                                        hp.IsActive = true;
                                        hp.BeaconuuId = dtoHp.BeaconuuId;
                                        hp.BuildingId = bld.Id;
                                        hp.BuildingPlan = buildingPlan;
                                        hp.HotspotActionTypeId = dtoHp.HotspotActionTypeId;
                                        hp.HotspotDisplayTypeId = dtoHp.HotspotDisplayTypeId;
                                        hp.DisplayDetails = dtoHp.DisplayDetails;
                                        hp.Name = dtoHp.Name;
                                        hp.Description = dtoHp.Description;
                                        hp.BeaconuuId = dtoHp.BeaconuuId;
                                        if (dtoHp.Files != null && dtoHp.Files.Count > 0)
                                        {
                                            var hpBucket = fileBucketsService.GetAll().FirstOrDefault(a => a.Name == bld.Actor.Name + "/Buildings/" + bld.Id + "/Plans/" + buildingPlan.Id);
                                            if (hpBucket == null)
                                            {
                                                hpBucket = fileBucketsService.Create();
                                                hpBucket.Id = Guid.NewGuid().ToString();
                                                hpBucket.Name = hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + buildingPlan.Id;
                                                hpBucket.FileBucketTypeId = 2;
                                                hpBucket.IsActive = true;
                                                hpBucket.PhysicalPath = Tools.DefaultValues.FILESDIRECTORY.Replace("\\", "");
                                                await fileBucketsService.AddAsync(hpBucket);
                                            }
                                            foreach (var dtoHpFile in dtoHp.Files)
                                            {
                                                // Create the new file.
                                                Files hpfile = filesService.Create();
                                                hpfile.Id = Guid.NewGuid().ToString();
                                                hpfile.Name = dtoHpFile.FileName.GetExtension();
                                                hpfile.Description = "";
                                                hpfile.FileBucketId = hpBucket.Id;
                                                hpfile.IsActive = true;
                                                hp.Files.Add(hpfile);
                                            }
                                        }
                                        //await hotspotService.AddAsync(hp);
                                    }

                                    bld.BuildingPlans.Add(buildingPlan);
                                }
                                sortCnt++;
                            }
                            #endregion
                        }
                        #endregion

                        serviceManager.Commit();

                        return Ok();
                    }
                    #endregion
                }
                return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public async Task<HttpResponseMessage> UploadImageFromOffline(string buildingId, string bucketName, string imageName)
        {
            try
            {
                var name = imageName.GetExtension();
                HttpPostedFile file = HttpContext.Current.Request.Files["recFile"];
                if (file == null)
                    throw new Exception("File file is null");
                var destinationPath = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + bucketName + "/" + name);
                if (!Directory.Exists(HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + bucketName)))
                    Directory.CreateDirectory(HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + bucketName));
                file.SaveAs(destinationPath);

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
                using (var buildingService = new Service(DataBaseId, UserId).GetService<IBuildingService>())
                {
                    Building building = await buildingService.GetByIdAsync(new object[] { id });
                    if (building == null)
                        return BadRequest("Item not found");

                    await buildingService.SetDeletedAsync(building);

                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));

        }

        [HttpPost]
        public async Task<IHttpActionResult> Clone([FromBody] BuildingDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var buildingService = new Service(DataBaseId, UserId).GetService<IBuildingService>())
                {
                    var response = await buildingService.CloneAsync(dto);
                    dto.Id = response.Id;
                    return Created<BuildingDto>(Request.RequestUri, dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        public async Task<IHttpActionResult> SendEmergencyEmail(string Id, string message)
        {
            if (this.ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var buildingService = service.GetService<IBuildingService>();
                    Building bld = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor)
                              .FirstOrDefaultAsync(a => a.Id == Id);
                    if (bld == null)
                        return BadRequest("Item not found");
                    if (string.IsNullOrEmpty(bld.EmergencyEmail))
                        return BadRequest("Please provide a least one email address!");
                    var emailService = service.GetService<IEmailService>();
                    var emailObj = emailService.GetEmailSettings(EmailType.AlertTemplate);
                    emailObj.Message = emailObj.Message.Replace("messageParam", message);
                    var error = string.Empty;
                    bool emailSent = emailService.SendEmail(EmailType.AlertTemplate, false, emailObj.SenderUserName, bld.EmergencyEmail, null, null, emailObj.Subject, emailObj.Message, null, out error);
                    if (!emailSent)
                        throw new Exception(error);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpGet]
        [ResponseType(typeof(string))]
        public async Task<IHttpActionResult> DownloadBuildingFiles(string Id)
        {
            if (this.ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var buildingService = service.GetService<IBuildingService>();
                    Building bld = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor)
                              .FirstOrDefaultAsync(a => a.Id == Id);
                    if (bld == null)
                        return BadRequest("Item not found");
                    var directoryPath = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + "/" + bld.Actor.Name + "/Buildings/" + bld.Id);
                    if (Directory.Exists(directoryPath))
                    {
                        var downloadDirectory = GetDownloadDirectory();
                        ClearDirectory(downloadDirectory);
                        string zipPath = Path.Combine(downloadDirectory.FullName, Path.GetFileName("site.zip"));
                        ZipFile.CreateFromDirectory(directoryPath, zipPath);
                        return Ok(DefaultValues.FILESDIRECTORYDOWNLOAD + UserId + "/site.zip");
                    }
                    else
                        return BadRequest("Files can not be saved!");
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        [ResponseType(typeof(IList<PricingInfoDto>))]
        public async Task<IHttpActionResult> PostFile()
        {
            if (!Request.Content.IsMimeMultipartContent())
                return BadRequest("Unsupported Media Type");
            try
            {
                string root = HttpContext.Current.Server.MapPath("~/App_Data");
                var provider = new MultipartFormDataStreamProvider(root);
                await Request.Content.ReadAsMultipartAsync(provider);

                // Get the needed dates.
                string buildingIds = provider.FormData["BuildingIds"];
                string fileName = provider.FormData["Name"];
                string type = provider.FormData["Type"];

                var destinationDirectory = HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + "/" + "ExcelFiles" + "/" + UserId + "/" + fileName.Substring(0, fileName.LastIndexOf('.')));
                if (!Directory.Exists(destinationDirectory))
                    Directory.CreateDirectory(destinationDirectory);
                var destinationPath = destinationDirectory + "/" + fileName;
                if (File.Exists(destinationPath))
                    File.Delete(destinationPath);

                foreach (MultipartFileData fileData in provider.FileData)
                    File.Move(fileData.LocalFileName, destinationPath);
                if (type == "Price")
                {
                    var ids = buildingIds.Split(',').ToList();
                    var serviceManager = new Service(DataBaseId, UserId).GetService<IPricingInfoService>();
                    await serviceManager.BulkDeleteAsync(null, x => ids.Contains(x.BuildingId));
                    foreach (var buildingId in ids)
                    {
                        var response = await serviceManager.ImportFromFile(buildingId, destinationPath);
                    }
                }
                else if (type == "Contact")
                {
                    var ids = buildingIds.Split(',').ToList();
                    var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>();
                    await serviceManager.BulkDeleteAsync(null, x => ids.Contains(x.BuildingId));
                    foreach (var buildingId in ids)
                    {
                        var response = await serviceManager.ImportFromFile(buildingId, destinationPath);
                    }
                }
                else {
                    return BadRequest("Please select correct format!");
                }
                File.Delete(destinationPath);
                return Ok();
            }
            catch (System.Exception e)
            {
                return BadRequest(e.InnerException.ToString());
            }
        }

        #region private methods
        /// <summary>
        /// Returns the building dto witht the specified id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="buildingService"></param>
        /// <returns></returns>
        private async Task<BuildingDto> GetBuildingToDto(string id, IBuildingService buildingService, Building building = null)
        {
            Building item = building;

            if (item == null)
                item = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor.ActorPermissions)
                                  .Include("BuildingImages.File.FileBucket")
                                  .Include("BuildingPlans.PlanThumbnailFile.FileBucket")
                                  .Include("BuildingPlans.Hotspots.HotspotDisplayType").Include("BuildingDisasterInfos.File.FileBucket")
                                  .Include("BuildingFiles.File.FileBucket")
                                  .Include(x => x.ActorBuildingPermissions)
                                  .Include("ActorBuildingPermissions.Actor.ActorPermissions")
                                  .Include(x => x.ContactInfo).Include(x => x.PrinceInfo).FirstOrDefaultAsync(a => a.Id == id);

            if (item == null)
                return null;
            var buildingFolders = new List<BuildingFolderDto>();
            var path = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + "\\" + item.Actor.Name + "\\" + "Buildings\\" + item.Id);
            if (Directory.Exists(path))
            {
                var topDirectories = System.IO.Directory.GetDirectories(path, "*.*", System.IO.SearchOption.TopDirectoryOnly).ToList();
                foreach (var topDirectory in topDirectories)
                {
                    if (DefaultValues.BuildingDefaultFolders.Count(t => topDirectory.ToLower().EndsWith(t.ToLower())) == 0)
                        ParseDirectory(item, topDirectory, ref buildingFolders, loadWithPermission: true);
                }
            }

            var buildingFoldersVisible = new List<BuildingFolderDto>();
            foreach (var it in buildingFolders)
                GetVisibleItems(it, ref buildingFoldersVisible);

            var response = new BuildingDto()
            {
                Id = item.Id,
                ActorId = item.ActorId,
                ActorName = item.Actor.Name,
                Name = item.Name,
                Description = item.Description,
                Address = item.Address,
                ZIP = item.ZIP,
                BuildingsNo = item.BuildingsNo,
                Geopoints = item.Geopoints,
                BuildingType = item.BuildingType,
                ConstructionType = item.ConstructionType,
                EmergencyEmail = item.EmergencyEmail,
                EmergencyPhone = item.EmergencyPhone,
                UnitsNo = item.UnitsNo,
                FeaturedImageId = item.FeaturedImageId,
                ImagesCount = item.BuildingImages != null ? item.BuildingImages.Count(t => t.IsActive) : 0,
                ViewsCount = item.BuildingPlans != null ? item.BuildingPlans.Count(t => t.IsActive) : 0,
                UserIds = item.ActorBuildingPermissions.Where(x => x.IsActive && x.Actor.Type == ActorType.BusinessUser).ToList().Select(t => t.ActorId).ToList(),
                BuildingFolders = buildingFoldersVisible,
                DisplayConfiguration = item.DisplayConfiguration,
                ShowContact = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Contact) == BuildingDisplayConfiguration.Contact || !item.DisplayConfiguration.HasValue) ? true : false,
                ShowDisaster = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Disaster) == BuildingDisplayConfiguration.Disaster || !item.DisplayConfiguration.HasValue) ? true : false,
                ShowFiles = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Files) == BuildingDisplayConfiguration.Files || !item.DisplayConfiguration.HasValue) ? true : false,
                ShowFolders = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Folders) == BuildingDisplayConfiguration.Folders || !item.DisplayConfiguration.HasValue) ? true : false,
                ShowPricing = ((item.DisplayConfiguration & BuildingDisplayConfiguration.Pricing) == BuildingDisplayConfiguration.Pricing || !item.DisplayConfiguration.HasValue) ? true : false,

                // Convert list of BuildingImage to BuildingImageDto
                BuildingImages = item.BuildingImages.Where(z => z.IsActive).OrderBy(x => x.Order).ThenBy(x => x.File.Name).ThenBy(x => x.CreateDate).Select(b => new BuildingImageDto
                {
                    Id = b.Id,
                    BucketName = b.File.FileBucket.Name,
                    BucketPath = b.File.FileBucket.PhysicalPath,
                    FileName = b.File.Name,
                    FileDescription = b.File.Description,
                }).ToList(),
                BuildingDisasterInfos = item.BuildingDisasterInfos != null ? item.BuildingDisasterInfos.Where(z => z.IsActive).Select(b => new BuildingDisasterInfoDto()
                {
                    Id = b.Id,
                    Description = b.Description,
                    Title = b.Title,
                    BuildingId = b.BuildingId,
                    FileId = b.FileId,
                    File = new FileWithButcketDTO()
                    {
                        Id = b.File.Id,
                        BucketName = b.File.FileBucket.Name,
                        BucketPath = b.File.FileBucket.PhysicalPath,
                        FileName = b.File.Name,
                        FileDescription = b.File.Description
                    }
                }).ToList().OrderBy(di => di.File.FileName).ToList() : new List<BuildingDisasterInfoDto>(),
                BuildingFiles = item.BuildingFiles.Where(z => z.IsActive).Select(b => new BuildingFileDto()
                {
                    Id = b.Id,
                    Description = b.Description,
                    Title = b.Title,
                    BuildingId = b.BuildingId,
                    FileId = b.FileId,
                    Type = b.Type,
                    File = new FileWithButcketDTO()
                    {
                        Id = b.File.Id,
                        BucketName = b.File.FileBucket.Name,
                        BucketPath = b.File.FileBucket.PhysicalPath,
                        FileName = b.File.Name,
                        FileDescription = b.File.Description
                    }
                }).ToList(),
                BuildingPlans = item.BuildingPlans.Where(z => z.IsActive).OrderBy(x => x.Order).ThenBy(x => x.Name).ThenBy(x => x.CreateDate).Select(c => new BuildingPlanDto()
                {
                    BuildingId = c.BuildingId,
                    Description = c.Description,
                    Id = c.Id,
                    Name = c.Name,
                    HotspotsCount = c.Hotspots.Count(v => v.IsActive && (v.HotspotDisplayType.Type != HotspotType.Line && v.HotspotDisplayType.Type != HotspotType.Circle)),
                    PlanThumbnailFileId = c.PlanThumbnailFileId,
                    PlanFileId = c.PlanFileId,
                    PlanThumbnailFile = new FileWithButcketDTO
                    {
                        Id = c.PlanThumbnailFile.Id,
                        BucketName = c.PlanThumbnailFile.FileBucket.Name,
                        BucketPath = c.PlanThumbnailFile.FileBucket.PhysicalPath,
                        FileName = c.PlanThumbnailFile.Name,
                        FileDescription = c.PlanThumbnailFile.Description
                    },
                    PlanFile = new FileWithButcketDTO
                    {
                        Id = c.PlanFile.Id,
                        BucketName = c.PlanFile.FileBucket.Name,
                        BucketPath = c.PlanFile.FileBucket.PhysicalPath,
                        FileName = c.PlanFile.Name,
                        FileDescription = c.PlanFile.Description
                    }
                }).ToList(),
                // Convert list of PrincingInfo to PrincingInfoDto
                PricingInfos = item.PrinceInfo.Where(z => z.IsActive).Select(b => new PricingInfoDto
                {
                    Id = b.Id,
                    BuildingId = b.BuildingId,
                    Description = b.Description,
                    Quantity = b.Quantity,
                    UnitPrice = b.UnitPrice,
                    Units = b.Units,
                    Name = b.Name
                }).ToList(),
                // Convert list of ContactInfo to ContactInfoDto
                ContactInfos = item.ContactInfo.Where(z => z.IsActive).Select(b => new ContactInfoDto
                {
                    Id = b.Id,
                    BuildingId = b.BuildingId,
                    Address = b.Address,
                    SecondAddress = b.SecondAddress,
                    EmailAddress = b.EmailAddress,
                    FirstName = b.FirstName,
                    LastName = b.LastName,
                    MobilePhone = b.MobilePhone,
                    Phone = b.Phone,
                    Role = b.Role,
                    Title = b.Title,
                    City = b.City,
                    State = b.State,
                    Zip = b.Zip
                }).ToList(),
            };
            return response;
        }

        private DirectoryInfo GetDownloadDirectory()
        {
            var downloadDirectory = Directory.CreateDirectory(Path.Combine(HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORYDOWNLOAD), UserId));
            return downloadDirectory;
        }
        private static void ClearDirectory(DirectoryInfo directory)
        {
            foreach (FileInfo file in directory.GetFiles())
            {
                file.Delete();
            }
            foreach (DirectoryInfo dir in directory.GetDirectories())
            {
                dir.Delete(true);
            }
        }
        #endregion
    }
}
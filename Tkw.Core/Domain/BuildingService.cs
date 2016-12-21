namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;
    using System.Threading;
    using Common.Core;
    using System.Data.Entity;
    using System;
    using System.Threading.Tasks;
    using System.IO;
    using System.Web;

    public partial class BuildingService : TkwService<Building>, IBuildingService
    {
        public BuildingService(IRepository<Building> repository, Service service)
            : base(repository, service)
        {
        }

        public async Task<Building> CloneAsync(BuildingDto item)
        {
            var building = Create();
            building.Id = Guid.NewGuid().ToString();
            building.Name = string.Concat(item.Name, " Clone");
            building.ActorId = item.ActorId;
            building.Description = item.Description;
            building.Address = item.Address;
            building.EmergencyPhone = item.EmergencyPhone;
            building.EmergencyEmail = item.EmergencyEmail;
            building.BuildingType = item.BuildingType;
            building.ConstructionType = item.ConstructionType;
            building.BuildingsNo = item.BuildingsNo;
            building.UnitsNo = item.UnitsNo;
            building.FeaturedImageId = item.FeaturedImageId;
            building.DisplayConfiguration = item.DisplayConfiguration;
            SetBuildingActorPermissions(item, building);
            SetBuildingPrinceInfo(item, building);
            SetBuildingContactInfo(item, building);
            var buckets = CreateSiteFileBucket(item.ActorName, building.Id);
            var serviceBuckets = _service.GetService<IFileBucketsService>();
            await serviceBuckets.AddOrUpdateAsync(a => a.Id, buckets);
            SetBuildingImages(item, building, buckets);
            SetBuildingFiles(item, building, buckets);
            SetBuildinDisasterInfos(item, building, buckets);

            //add plan to building files
            building.BuildingPlans = building.BuildingPlans ?? new List<BuildingPlan>();
            var planBucket = buckets.FirstOrDefault(a => a.Name == item.ActorName + "/Buildings/" + building.Id + "/Plans");
            var buildingPlanService = _service.GetService<IBuildingPlanService>();
            var planIds = item.BuildingPlans != null ? item.BuildingPlans.Select(t => t.Id).ToList() : new List<string>();
            if (planIds != null && planIds.Count > 0)
            {
                var hotspots = GetAll().Include("BuildingPlans.Hotspots").Where(x => x.BuildingPlans.Count(t => planIds.Contains(t.Id)) > 0)
                                       .SelectMany(t => t.BuildingPlans).SelectMany(v => v.Hotspots).Where(v => v.IsActive).ToList();

                SetBuildingPlans(item, building, buckets, hotspots);
            }
            await _repository.AddAsync(building);
            return building;
        }

        public override IQueryable<Building> GetAll()
        {
            if (Thread.CurrentPrincipal.IsInRole(Tools.DefaultValues.ROLE_ROOT) || Thread.CurrentPrincipal.IsInRole(Tools.DefaultValues.TENANT))
                return base.GetAll();
            else if (Thread.CurrentPrincipal.IsInRole(Tools.DefaultValues.CLIENT_ADMIN))
            {
                var access = this._service.GetService<ICompanyService>().GetAll().Select(t => t.Id).ToList();
                return base.GetAll().Where(x => access.Contains(x.ActorId));
            }
            else
            {
                return base.GetAll().Include(x => x.ActorBuildingPermissions).Where(t => t.ActorBuildingPermissions.Count(c => c.ActorId == _service.UserId) > 0);
            }
        }
        public IQueryable<Building> GetAll(bool isActive)
        {
            return GetAll().Where(x => x.IsActive == isActive);
        }

        public List<FileBuckets> CreateSiteFileBucket(string tenantName, string bldId)
        {
            List<FileBuckets> Buckets = new List<FileBuckets>();
            var folderPhysicalPath = System.Web.HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY);
            string folder = Tools.DefaultValues.FILESDIRECTORY.Replace("\\", "");
            Buckets = new List<FileBuckets>();
            Buckets.Add(new FileBuckets
            {
                Id = bldId.Substring(0, bldId.Length - 3) + "BFB",
                Name = tenantName + "/Buildings/" + bldId + @"/Images",
                FileBucketTypeId = 2,
                IsActive = true,
                PhysicalPath = folder
            });

            // add plans folder for each building
            Buckets.Add(new FileBuckets
            {
                Id = bldId.Substring(0, bldId.Length - 3) + "BPB",
                Name = tenantName + "/Buildings/" + bldId + @"/Plans",
                FileBucketTypeId = 2,
                IsActive = true,
                PhysicalPath = folder
            });
            // add files folder for each building
            Buckets.Add(new FileBuckets
            {
                Id = bldId.Substring(0, bldId.Length - 3) + "BFI",
                Name = tenantName + "/Buildings/" + bldId + @"/Files",
                FileBucketTypeId = 2,
                IsActive = true,
                PhysicalPath = folder
            });


            // add disaster info folder for each building

            Buckets.Add(new FileBuckets
            {
                Id = bldId.Substring(0, bldId.Length - 3) + "BDI",
                Name = tenantName + "/Buildings/" + bldId + @"/DisasterInfos",
                FileBucketTypeId = 2,
                IsActive = true,
                PhysicalPath = folder
            });
            foreach (FileBuckets b in Buckets)
            {
                var bucketFolder = System.IO.Path.Combine(folderPhysicalPath, b.Name);
                if (!System.IO.Directory.Exists(bucketFolder))
                    System.IO.Directory.CreateDirectory(bucketFolder);
            }
            return Buckets;
        }

        #region private methods
        private void SetBuildinDisasterInfos(BuildingDto item, Building building, List<FileBuckets> buckets)
        {
            //add disaster info to building files
            building.BuildingDisasterInfos = building.BuildingDisasterInfos ?? new List<BuildingDisasterInfo>();
            if (item.BuildingDisasterInfos != null)
            {
                var disasterInfoBucket = buckets.FirstOrDefault(a => a.Name == item.ActorName + "/Buildings/" + building.Id + "/DisasterInfos");
                var buildingDisasterInfoService = _service.GetService<IBuildingDisasterInfoService>();
                foreach (var dtoBuildingDisasterInfo in item.BuildingDisasterInfos)
                {
                    var buildingDisasterInfo = buildingDisasterInfoService.Create();
                    buildingDisasterInfo.File = new Files()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = dtoBuildingDisasterInfo.File.FileName,
                        Description = dtoBuildingDisasterInfo.File.FileDescription,
                        FileBucketId = disasterInfoBucket.Id,
                    };
                    buildingDisasterInfo.Id = Guid.NewGuid().ToString();
                    buildingDisasterInfo.Title = dtoBuildingDisasterInfo.Title;
                    buildingDisasterInfo.Description = dtoBuildingDisasterInfo.Description;
                    building.BuildingDisasterInfos.Add(buildingDisasterInfo);

                    var sourcePath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + dtoBuildingDisasterInfo.File.BucketPath + "/" + dtoBuildingDisasterInfo.File.BucketName + "/" + dtoBuildingDisasterInfo.File.FileName;
                    var destinationPath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + Tools.DefaultValues.FILESDIRECTORY + disasterInfoBucket.Name + "/" + buildingDisasterInfo.File.Name;
                    File.Copy(sourcePath, destinationPath, true);
                }
            }
        }

        private void SetBuildingFiles(BuildingDto item, Building building, List<FileBuckets> buckets)
        {
            //add file to building files
            building.BuildingFiles = building.BuildingFiles ?? new List<BuildingFile>();
            if (item.BuildingFiles != null)
            {
                var fileBucket = buckets.FirstOrDefault(a => a.Name == item.ActorName + "/Buildings/" + building.Id + "/Files");
                var buildingFileService = _service.GetService<IBuildingFileService>();
                foreach (var dtoFile in item.BuildingFiles)
                {
                    var buildingFile = buildingFileService.Create();
                    buildingFile.File = new Files()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = dtoFile.File.FileName,
                        Description = dtoFile.File.FileDescription,
                        FileBucketId = fileBucket.Id,
                    };
                    buildingFile.Id = Guid.NewGuid().ToString();
                    buildingFile.Title = dtoFile.Title;
                    buildingFile.Description = dtoFile.Description;
                    building.BuildingFiles.Add(buildingFile);

                    var sourcePath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + dtoFile.File.BucketPath + "/" + dtoFile.File.BucketName + "/" + dtoFile.File.FileName;
                    var destinationPath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") +Tools.DefaultValues.FILESDIRECTORY + fileBucket.Name + "/" + buildingFile.File.Name;
                    File.Copy(sourcePath, destinationPath, true);
                }
            }
        }

        private void SetBuildingPlans(BuildingDto item, Building building, List<FileBuckets> buckets, List<Hotspot> hotspots)
        {
            //add image to building images
            building.BuildingPlans = building.BuildingPlans ?? new List<BuildingPlan>();
            if (item.BuildingPlans != null)
            {
                var planBucket = buckets.FirstOrDefault(a => a.Name == item.ActorName + "/Buildings/" + building.Id + "/Plans");
                var buildingPlanService = _service.GetService<IBuildingPlanService>();
                foreach (var dtoPlan in item.BuildingPlans)
                {
                    var buildingPlan = buildingPlanService.Create();
                    
                    buildingPlan.PlanFile = new Files()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = dtoPlan.PlanFile.FileName,
                        Description = dtoPlan.PlanFile.FileDescription,
                        FileBucketId = planBucket.Id,
                        IsActive=true
                    };
                    buildingPlan.PlanThumbnailFile = new Files()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = dtoPlan.PlanThumbnailFile.FileName,
                        Description = dtoPlan.PlanThumbnailFile.FileDescription,
                        FileBucketId = planBucket.Id,
                        IsActive = true
                    };
                    buildingPlan.Id = Guid.NewGuid().ToString();

                    var planHotspots = hotspots.Where(c => c.BuildingPlanId == dtoPlan.Id).ToList();
                    buildingPlan.Hotspots = buildingPlan.Hotspots ?? new List<Hotspot>();
                    foreach (var planHotspot in planHotspots)
                    {
                        var hotspot = new Hotspot();
                        hotspot.Id = Guid.NewGuid().ToString();
                        hotspot.BuildingId = building.Id;
                        hotspot.Name = planHotspot.Name;
                        hotspot.HotspotDisplayTypeId = planHotspot.HotspotDisplayTypeId;
                        hotspot.HotspotActionTypeId = planHotspot.HotspotActionTypeId;
                        hotspot.DisplayDetails = planHotspot.DisplayDetails;
                        hotspot.BeaconuuId = planHotspot.BeaconuuId;
                        hotspot.Description = planHotspot.Description;
                        hotspot.Files = hotspot.Files ?? new List<Files>();
                        var hotSpotFileBucket = new FileBuckets()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = planBucket.Name + "/" + buildingPlan.Id,
                            FileBucketTypeId = 2,
                            IsActive = true,
                            PhysicalPath = Tools.DefaultValues.FILESDIRECTORY.Replace("\\", "")
                        };
                        if (planHotspot.Files != null && planHotspot.Files.Count>0)
                        {
                            foreach (var phFile in planHotspot.Files.ToList())
                            {
                                var htFile = new Files();
                                htFile.Id = Guid.NewGuid().ToString();
                                htFile.Name = phFile.Name;
                                htFile.Description = phFile.Description;
                                htFile.FileBucket = hotSpotFileBucket;
                                htFile.IsActive = true;
                                hotspot.Files.Add(htFile);
                                var sourcePathHotspot = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + dtoPlan.PlanFile.BucketPath + "/" + dtoPlan.PlanFile.BucketName + "/" + planHotspot.BuildingPlanId + "/"+ phFile.Name;
                                var destinationPathHotspot = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + hotSpotFileBucket.PhysicalPath + "/" + hotSpotFileBucket.Name + "/" + htFile.Name;
                                if (!System.IO.Directory.Exists(destinationPathHotspot.Replace(htFile.Name,"")))
                                    System.IO.Directory.CreateDirectory(destinationPathHotspot.Replace(htFile.Name, ""));
                                File.Copy(sourcePathHotspot, destinationPathHotspot, true);
                            }
                        }
                        else
                        {
                            //create hotSpotFileBucket 
                            var fileBucketsService = _service.GetService<IFileBucketsService>();
                            fileBucketsService.Add(hotSpotFileBucket);
                        }
                        buildingPlan.Hotspots.Add(hotspot);
                    }
                    building.BuildingPlans.Add(buildingPlan);

                    var sourcePath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + dtoPlan.PlanFile.BucketPath + "/" + dtoPlan.PlanFile.BucketName + "/" + dtoPlan.PlanFile.FileName;
                    var destinationPath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + Tools.DefaultValues.FILESDIRECTORY.Replace("\\","") + "/" + planBucket.Name + "/" + buildingPlan.PlanFile.Name;

                    File.Copy(sourcePath, destinationPath, true);
                }
            }
        }

        private void SetBuildingImages(BuildingDto item, Building building, List<FileBuckets> buckets)
        {
            //add image to building images
            building.BuildingImages = building.BuildingImages ?? new List<BuildingImage>();
            if (item.BuildingImages != null)
            {
                var imageBucket = buckets.FirstOrDefault(a => a.Name == item.ActorName + "/Buildings/" + building.Id + "/Images");
                var buildingImageService = _service.GetService<IBuildingImageService>();
                foreach (var dtoImage in item.BuildingImages)
                {
                    var buildingImage = buildingImageService.Create();
                    buildingImage.File = new Files()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = dtoImage.FileName,
                        Description = dtoImage.FileDescription,
                        FileBucketId = imageBucket.Id,
                    };
                    buildingImage.Id = Guid.NewGuid().ToString();
                    building.BuildingImages.Add(buildingImage);
                    var sourcePath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + dtoImage.BucketPath + "/" + dtoImage.BucketName + "/" + dtoImage.FileName;
                    var destinationPath = System.AppDomain.CurrentDomain.BaseDirectory.Replace("\\", "/") + Tools.DefaultValues.FILESDIRECTORY + imageBucket.Name + " /" + buildingImage.File.Name;
                    File.Copy(sourcePath, destinationPath, true);
                }
            }
        }

        private static void SetBuildingContactInfo(BuildingDto item, Building building)
        {
            building.ContactInfo = building.ContactInfo ?? new List<ContactInfo>();
            if (item.ContactInfos != null)
            {
                foreach (var contactInfo in item.ContactInfos)
                    building.ContactInfo.Add(new ContactInfo()
                    {
                        Id = Guid.NewGuid().ToString(),
                        FirstName = contactInfo.FirstName,
                        LastName = contactInfo.LastName,
                        Role = contactInfo.Role,
                        EmailAddress = contactInfo.EmailAddress,
                        Phone = contactInfo.Phone,
                        MobilePhone = contactInfo.MobilePhone,
                        Address = contactInfo.Address,
                        SecondAddress = contactInfo.SecondAddress,
                        City = contactInfo.City,
                        State = contactInfo.State,
                        Zip = contactInfo.Zip
                    });
            }
        }

        private static void SetBuildingPrinceInfo(BuildingDto item, Building building)
        {
            building.PrinceInfo = building.PrinceInfo ?? new List<PricingInfo>();
            if (item.PricingInfos != null)
            {
                foreach (var princeInfo in item.PricingInfos)
                    building.PrinceInfo.Add(new PricingInfo() { Name = princeInfo.Name, Description = princeInfo.Description, IsActive = true, Quantity = princeInfo.Quantity, UnitPrice = princeInfo.UnitPrice, Id = Guid.NewGuid().ToString() });
            }
        }

        private static void SetBuildingActorPermissions(BuildingDto item, Building building)
        {

            building.ActorBuildingPermissions = building.ActorBuildingPermissions ?? new List<ActorBuilding>();
            if (item.UserIds != null)
            {
                foreach (var userId in item.UserIds)
                    building.ActorBuildingPermissions.Add(new ActorBuilding() { ActorId = userId, BuildingId = building.Id });
            }
        }
        #endregion
    }
}
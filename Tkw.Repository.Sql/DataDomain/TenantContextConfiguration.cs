namespace Repository.Sql
{
    using BusinessObjects;
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using Tools;
    using System;
    using System.Web;
    using Common.Core;

    internal sealed class TenantContextConfiguration : DbMigrationsConfiguration<TenantContext>
    {
        public TenantContextConfiguration()
        {

            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = true;

            //AutomaticMigrationsEnabled = true;
            //AutomaticMigrationDataLossAllowed = false;
        }


        protected override void Seed(TenantContext context)
        {
            CreateFileBucketTypes(context);
            CreateHotspotDisplayTypes(context);
            CreateFileBucketTypes(context);
            CreateHotspotActionTypes(context);
            //#if CreateDemoData

            //try
            //{
            //    CreateActorAndSampleBuildings(context);
            //}
            //catch (Exception e)
            //{

            //}
            //CreateHotspotDisplayTypes(context);
            //CreateHotspotActionTypes(context);
            //#endif
            base.Seed(context);
        }

        private void CreateHotspotDisplayTypes(TenantContext context)
        {
            List<HotspotDisplayType> HotspotDisplayTypes = new List<HotspotDisplayType>()
            {
                new HotspotDisplayType() { Id=1, Name="Air Scrubber", Description="" ,IsActive=true, FileName="air_scrubber2.png"},
                new HotspotDisplayType() { Id=2, Name="Air Mover", Description="" ,IsActive=true, FileName="air_mover2.png"},
                new HotspotDisplayType() { Id=3, Name="Moisture Sensor", Description="" ,IsActive=true, FileName="moisture_sensor2.png"},
                new HotspotDisplayType() { Id=4, Name="Power Shutoff", Description="" ,IsActive=true, FileName="power_shutoff2.png"},
                new HotspotDisplayType() { Id=5, Name="Electric Panel", Description="" ,IsActive=true, FileName="electric_panel2.png"},
                new HotspotDisplayType() { Id=6, Name="Comm Panel", Description="" ,IsActive=true, FileName="comm_panel2.png"},
                new HotspotDisplayType() { Id=7, Name="Power Disconnect", Description="" ,IsActive=true, FileName="power_disconnect2.png"},
                new HotspotDisplayType() { Id=8, Name="Video", Description="" ,IsActive=true, FileName="video2.png"},
                new HotspotDisplayType() { Id=9, Name="Electrical Room", Description="" ,IsActive=true, FileName="electrical_room2.png"},
                new HotspotDisplayType() { Id=10, Name="Generator", Description="" ,IsActive=true, FileName="generator2.png"},
                new HotspotDisplayType() { Id=11, Name="Transformer", Description="" ,IsActive=true, FileName="transformer2.png"},
                new HotspotDisplayType() { Id=12, Name="Elevator", Description="" ,IsActive=true, FileName="elevator2.png"},
                new HotspotDisplayType() { Id=13, Name="Backflow Prevent", Description="" ,IsActive=true, FileName="backflow_prevent2.png"},
                new HotspotDisplayType() { Id=14, Name="Dehumidifier", Description="" ,IsActive=true, FileName="dehumidifier2.png"},
                new HotspotDisplayType() { Id=15, Name="Dumpster", Description="" ,IsActive=true, FileName="dumpster2.png"},
                new HotspotDisplayType() { Id=16, Name="Fire Alarm", Description="" ,IsActive=true, FileName="fire_alarm2.png"},
                new HotspotDisplayType() { Id=17, Name="Fire Control Panel", Description="" ,IsActive=true, FileName="fire_control_panel2.png"},
                new HotspotDisplayType() { Id=18, Name="Fire Dept Connection", Description="" ,IsActive=true, FileName="fire_dept_connection2.png"},
                new HotspotDisplayType() { Id=19, Name="Fire Hydrant", Description="" ,IsActive=true, FileName="fire_hydrant2.png"},
                new HotspotDisplayType() { Id=20, Name="Fire Sprinkler Shutoff", Description="" ,IsActive=true, FileName="fire_sprinkler_shutoff2.png"},
                new HotspotDisplayType() { Id=21, Name="Gas Shutoff", Description="" ,IsActive=true, FileName="gas_shutoff2.png"},
                new HotspotDisplayType() { Id=22, Name="Image", Description="" ,IsActive=true, FileName="image2.png"},
                new HotspotDisplayType() { Id=23, Name="Protocol Form", Description="" ,IsActive=true, FileName="protocol_form2.png"},
                new HotspotDisplayType() { Id=24, Name="Smoke Alarm", Description="" ,IsActive=true, FileName="smoke_alarm2.png"},
                new HotspotDisplayType() { Id=25, Name="Sprinkler", Description="" ,IsActive=true, FileName="sprinkler2.png"},
                new HotspotDisplayType() { Id=26, Name="Sprinkler Ctrl Valve", Description="" ,IsActive=true, FileName="sprinkler_ctrl_valve2.png"},
                new HotspotDisplayType() { Id=27, Name="Text", Description="" ,IsActive=true, FileName="text2.png"},
                new HotspotDisplayType() { Id=28, Name="Trash Chute", Description="" ,IsActive=true, FileName="trash_chute2.png"},
                new HotspotDisplayType() { Id=29, Name="Water Heater", Description="" ,IsActive=true, FileName="water_heater2.png"},
                new HotspotDisplayType() { Id=30, Name="Water Shutoff", Description="" ,IsActive=true, FileName="water_shutoff2.png"},
                new HotspotDisplayType() { Id=31, Name="Knox Box", Description="" ,IsActive=true, FileName="knox_box2.png"},
                new HotspotDisplayType() { Id=32, Name="Nitrogen", Description="" ,IsActive=true, FileName="nitrogen2.png"},
                new HotspotDisplayType() { Id=33, Name="Nitrous Oxide", Description="" ,IsActive=true, FileName="nitrous_oxide2.png"},
                new HotspotDisplayType() { Id=34, Name="Notes", Description="" ,IsActive=true, FileName="notes2.png"},
                new HotspotDisplayType() { Id=35, Name="Oxygen", Description="" ,IsActive=true, FileName="oxygen2.png"},

                new HotspotDisplayType() { Id=36, Name="Black", Description="" ,IsActive=true, FileName="black.png", Type = HotspotType.Point, Color="#000000"},
                new HotspotDisplayType() { Id=37, Name="Green", Description="" ,IsActive=true, FileName="green.png", Type = HotspotType.Point, Color="#006400"},
                new HotspotDisplayType() { Id=38, Name="Orange", Description="" ,IsActive=true, FileName="orange.png", Type = HotspotType.Point, Color="#FF8C00"},
                new HotspotDisplayType() { Id=39, Name="Red", Description="" ,IsActive=true, FileName="red.png", Type = HotspotType.Point, Color="#FF0000"},
                new HotspotDisplayType() { Id=40, Name="Blue", Description="" ,IsActive=true, FileName="blue.png", Type = HotspotType.Point, Color="#1E90FF"},

                new HotspotDisplayType() { Id=41, Name="Line", Description="" ,IsActive=true, FileName="", Type = HotspotType.Line},
                new HotspotDisplayType() { Id=42, Name="Circle", Description="" ,IsActive=true, FileName="", Type = HotspotType.Circle},
            };
            context.HotspotDisplayTypes.AddOrUpdate(c => new { c.Id }, HotspotDisplayTypes.ToArray());
        }

        private void CreateHotspotActionTypes(TenantContext context)
        {
            List<HotspotActionType> HotspotActionTypes = new List<HotspotActionType>()
            {
                new HotspotActionType() {Id=1, Name="Basic", Description="Shows a simple text.",AllowAttachment = false, IsActive=true},
                new HotspotActionType() {Id=2, Name="Image", Description="Shows a text and a list of images.", AllowAttachment=true, AllowedFileTypes="image" , IsActive=true},
                new HotspotActionType() {Id=3, Name="Video", Description="Shows a text and a short video." ,AllowAttachment = true, AllowedFileTypes="video", IsActive=true},
                new HotspotActionType() {Id=4, Name="Audio", Description="Shows a text and a short audio." ,AllowAttachment = true, AllowedFileTypes="audio", IsActive=true},
                new HotspotActionType() {Id=5, Name="File", Description="Shows a text and a any kind of files." ,AllowAttachment = true, AllowedFileTypes="image,video,audio", IsActive=true}
            };
            context.HotspotActionTypes.AddOrUpdate(c => new { c.Id }, HotspotActionTypes.ToArray());
        }

        private void CreateFileBucketTypes(TenantContext context)
        {
            // create file bucket types
            List<FileBucketTypes> FileBuckets = new List<FileBucketTypes>()
            {
               new FileBucketTypes() { Id=1, Name="Amazon S3" },
               new FileBucketTypes() { Id=2, Name="File System" },
            };
            context.FileBucketTypes.AddOrUpdate(c => new { c.Id }, FileBuckets.ToArray());
            context.SaveChanges();
        }


        private void CreateActorAndSampleBuildings(TenantContext context)
        {
            Actor tenant = context.Actors.FirstOrDefault(b => b.Type == ActorType.Company);
            string actorId = null;
            if (tenant != null)
            {
                actorId = tenant.Id;
            }
            else
            {
                actorId = Guid.NewGuid().ToString();
                List<Actor> Actors = new List<Actor>()
                {
                    new Actor {Id=actorId, Name="Sample Company", IsActive=true, Type=ActorType.Company}
                };
                context.Actors.AddOrUpdate(c => new { c.Id }, Actors.ToArray());
                context.SaveChanges();
                tenant = Actors[0];
            }

            
            // create 5 buildings
            List<Building> Buildings = new List<Building>()
            {
                new Building { ActorId=actorId, Id=actorId+"11111",Name="Sample Building 1", ConstructionType="Bricks", BuildingType="Shopping Mall", IsActive=true, BuildingsNo=10, Address="Cluj-Napoca, Romania", Description="Trebuie sa ma uit in buletin", EmergencyEmail="e-mail@yahoo.com", EmergencyPhone="074-1234567", UnitsNo=2},
                new Building { ActorId=actorId, Id=actorId+"22222",Name="Sample Building 2", ConstructionType="Steel", BuildingType="Hospital", IsActive=true, BuildingsNo=1, Address="Ajax, Netherland", Description="This is a hospital where people get better when they are unwell.", EmergencyEmail="e-mail@yahoo.com", EmergencyPhone="074-1234567", UnitsNo=2  },
            };
            
            // create file buckets for each building
            var folderPhysicalPath = System.Web.HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY);
            string folder = Tools.DefaultValues.FILESDIRECTORY;
            List<FileBuckets> Buckets = new List<FileBuckets>();
            // add images folder for each building
            foreach (Building b in Buildings)
            {
                Buckets.Add(new FileBuckets
                {
                    Id = b.Id.Substring(0, b.Id.Length - 3) + "BFB",
                    Name = tenant.Name + "/Buildings/" + b.Id + @"/Images",
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder
                });
            }
            // add plans folder for each building
            foreach (Building b in Buildings)
            {
                Buckets.Add(new FileBuckets
                {
                    Id = b.Id.Substring(0, b.Id.Length - 3) + "BPB",
                    Name = tenant.Name + "/Buildings/" + b.Id + @"/Plans",
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder
                });
            }

            // add files folder for each building
            foreach (Building b in Buildings)
            {
                Buckets.Add(new FileBuckets
                {
                    Id = b.Id.Substring(0, b.Id.Length - 3) + "BFI",
                    Name = tenant.Name + "/Buildings/" + b.Id + @"/Files",
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder
                });
            }

            // add disaster info folder for each building
            foreach (Building b in Buildings)
            {
                Buckets.Add(new FileBuckets
                {
                    Id = b.Id.Substring(0, b.Id.Length - 3) + "BDI",
                    Name = tenant.Name + "/Buildings/" + b.Id + @"/DisasterInfos",
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder
                });
            }

            // create directories if not exist
            foreach (FileBuckets b in Buckets)
            {
                var bucketFolder = System.IO.Path.Combine(folderPhysicalPath, b.Name);
                if (!System.IO.Directory.Exists(bucketFolder))
                    System.IO.Directory.CreateDirectory(bucketFolder);
            }
            context.FileBuckets.AddOrUpdate(c => new { c.Id }, Buckets.ToArray());
            context.SaveChanges();


            // create directories if not exist
            foreach (FileBuckets b in Buckets)
            {
                var bucketFolder = System.IO.Path.Combine(folderPhysicalPath, b.Name);
                if (!System.IO.Directory.Exists(bucketFolder))
                {
                    System.IO.Directory.CreateDirectory(bucketFolder);

                }
                string substirng1 = b.Name.Substring(b.Name.Length - 4);
                if (substirng1 == "ages")
                {
                    if (!System.IO.File.Exists(bucketFolder + "/SampleBuilding1.jpg"))
                    {
                        try
                        {
                            System.IO.File.Copy(Tools.DefaultValues.FILESDIRECTORY + "/sampleimages/SampleBuilding1.jpg", bucketFolder + "/SampleBuilding1.jpg");
                        }
                        catch { }
                        try
                        {
                            System.IO.File.Copy(Tools.DefaultValues.FILESDIRECTORY + "/sampleimages/SampleBuilding2.jpg", bucketFolder + "/SampleBuilding2.jpg");
                        }
                        catch { }
                    }
                }
                if (substirng1 == "lans")
                {
                    try
                    {
                        System.IO.File.Copy(Tools.DefaultValues.FILESDIRECTORY + "/sampleimages/SampleView1.png", bucketFolder + "/SampleView1.png");
                    }
                    catch { }
                }
            }

            // add sample images to buildings
            List<Files> Files = new List<Files>();
            List<BuildingImage> BuildingImages = new List<BuildingImage>();
            foreach (Building b in Buildings)
            {
                var bucketId = b.Id.Substring(0, b.Id.Length - 3) + "BFB";
                Files.Add(new BusinessObjects.Files()
                {
                    Id = bucketId + "1",
                    FileBucketId = bucketId,
                    Name = "SampleBuilding1.jpg",
                    Description = "Sample Image 1",
                    IsActive = true
                });
                BuildingImages.Add(new BuildingImage()
                {
                    BuildingId = b.Id,
                    FileId = bucketId + "1",
                    IsActive = true,
                    Id = bucketId + "1"
                });
                b.FeaturedImageId = bucketId + "1";
                Files.Add(new BusinessObjects.Files()
                {
                    Id = bucketId + "2",
                    FileBucketId = bucketId,
                    Name = "SampleBuilding2.jpg",
                    Description = "Sample Image 2",
                    IsActive = true
                });
                BuildingImages.Add(new BuildingImage()
                {
                    BuildingId = b.Id,
                    FileId = bucketId + "2",
                    IsActive = true,
                    Id = bucketId + "2"
                });
            }
            context.Buildings.AddOrUpdate(c => new { c.Id }, Buildings.ToArray());
            context.SaveChanges();

            context.Files.AddOrUpdate(c => new { c.Id }, Files.ToArray());
            context.SaveChanges();
            context.BuildingImages.AddOrUpdate(c => new { c.Id }, BuildingImages.ToArray());
            context.SaveChanges();


            // add building plans
            // add plan images
            List<Files> buildingPlanImages = new List<Files>();
            foreach (Building b in Buildings)
            {
                buildingPlanImages.Add(
                    new Files
                    {
                        Id = b.Id.Substring(0, b.Id.Length - 3) + "BPB1",
                        FileBucketId = b.Id.Substring(0, b.Id.Length - 3) + "BPB",
                        IsActive = true,
                        Name = "SampleView1.png",
                        Description = "A sample view"
                    });

            }
            context.Files.AddOrUpdate(c => new { c.Id }, buildingPlanImages.ToArray());
            context.SaveChanges();
            // add actual plans
            List<BuildingPlan> buildingPlans = new List<BuildingPlan>();
            List<FileBuckets> PlanBuckets = new List<FileBuckets>();
            foreach (Building b in Buildings)
            {
                // add 2 plans for each building
                buildingPlans.Add(new BuildingPlan
                {
                    Id = b.Id + "BP1",
                    BuildingId = b.Id,
                    Name = "Floor 1",
                    Description = "Floor 1 Sample Description",
                    IsActive = true,
                    PlanFileId = b.Id.Substring(0, b.Id.Length - 3) + "BPB1",
                    PlanThumbnailFileId = b.Id.Substring(0, b.Id.Length - 3) + "BPB1",
                });
                PlanBuckets.Add(new FileBuckets()
                {
                    Id = buildingPlans[buildingPlans.Count - 1].Id.Substring(0, b.Id.Length - 3) + "BPH1",
                    Name = tenant.Name + "/Buildings/" + b.Id + @"/Plans/" + buildingPlans[buildingPlans.Count - 1].Id,
                    FileBucketTypeId = 2,
                    IsActive = true,
                    PhysicalPath = folder

                });
            }

            foreach (FileBuckets b in PlanBuckets)
            {
                var folderPlanPhysicalPath =  System.Web.HttpContext.Current.Server.MapPath("~/" + b.PhysicalPath);
                var bucketFolder = System.IO.Path.Combine(folderPlanPhysicalPath, b.Name);
                if (!System.IO.Directory.Exists(bucketFolder))
                {
                    System.IO.Directory.CreateDirectory(bucketFolder);
                }
            }
            context.FileBuckets.AddOrUpdate(c => new { c.Id }, PlanBuckets.ToArray());
            context.BuildingPlans.AddOrUpdate(c => new { c.Id }, buildingPlans.ToArray());
            context.SaveChanges();
        }

     
    }
}

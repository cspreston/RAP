using BusinessObjects;
using Common;
using Common.Core;
using Common.Domain;
using Common.Independent;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Serialization.Json;
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
    public class HotspotController : BaseApiController
    {

        /// <summary>
        /// Return a list with all hotspots as dtos.
        /// </summary>
        /// <returns></returns>
        [EnableQuery]
        public async Task<IQueryable<HotspotDto>> GetAll()
        {
            using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
            {
                var result = serviceManager.GetAll().Where(a => a.IsActive).Select(b => new HotspotDto()
                {
                    BeaconuuId = b.BeaconuuId,
                    BuildingId = b.BuildingId,
                    Name = b.Name,
                    Description = b.Description,
                    BuildingPlanId = b.BuildingPlanId,
                    HotspotActionTypeId = b.HotspotActionTypeId,
                    HotspotDisplayTypeId = b.HotspotDisplayTypeId,
                    Id = b.Id,
                    DisplayDetails = b.DisplayDetails,
                    HotspotActionType = new HotspotActionTypeDto()
                    {
                        AllowAttachment = b.HotspotActionType.AllowAttachment,
                        Description = b.HotspotActionType.Description,
                        Id = b.HotspotActionType.Id,
                        Name = b.HotspotActionType.Name,
                        AllowedFileTypes = b.HotspotActionType.AllowedFileTypes
                    },
                    HotspotDisplayType = new HotspotDisplayTypeDto()
                    {
                        Description = b.HotspotActionType.Description,
                        Id = b.HotspotActionType.Id,
                        Name = b.HotspotActionType.Name,
                        FileName = b.HotspotDisplayType.FileName

                    },
                    Files = b.Files.Where(a => a.IsActive).Select(z => new FileWithButcketDTO()
                    {
                        BucketName = z.FileBucket.Name,
                        BucketPath = z.FileBucket.PhysicalPath,
                        FileDescription = z.Description,
                        FileName = z.Name,
                        Id = z.Id
                    }).ToList()
                });

                return result;
            }
        }

        /// <summary>
        /// Return the dto with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [ResponseType(typeof(HotspotDto))]
        public async Task<IHttpActionResult> Get(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {
                    var result = await serviceManager.GetAll().Where(a => a.IsActive).Select(b => new HotspotDto()
                    {
                        BeaconuuId = b.BeaconuuId,
                        BuildingId = b.BuildingId,
                        BuildingPlanId = b.BuildingPlanId,
                        HotspotActionTypeId = b.HotspotActionTypeId,
                        HotspotDisplayTypeId = b.HotspotDisplayTypeId,
                        Id = b.Id,
                        DisplayDetails = b.DisplayDetails,
                        Name = b.Name,
                        Description = b.Description,
                        HotspotActionType = new HotspotActionTypeDto()
                        {
                            AllowAttachment = b.HotspotActionType.AllowAttachment,
                            AllowedFileTypes = b.HotspotActionType.AllowedFileTypes,
                            Description = b.HotspotActionType.Description,
                            Id = b.HotspotActionType.Id,
                            Name = b.HotspotActionType.Name
                        },
                        HotspotDisplayType = new HotspotDisplayTypeDto()
                        {
                            Description = b.HotspotActionType.Description,
                            Id = b.HotspotActionType.Id,
                            Name = b.HotspotActionType.Name,
                            FileName = b.HotspotDisplayType.FileName
                        },
                        Files = b.Files.Where(z => z.IsActive).Select(z => new FileWithButcketDTO()
                        {
                            BucketName = z.FileBucket.Name,
                            BucketPath = z.FileBucket.PhysicalPath,
                            FileDescription = z.Description,
                            FileName = z.Name,
                            Id = z.Id

                        }).ToList()
                    }).FirstOrDefaultAsync(a => a.Id == id);

                    if (result == null)
                    {
                        return BadRequest("Item not found");
                    }
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));

        }

        /// <summary>
        /// Add a new hotspot to the building.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] HotspotDto dto)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {
                    Hotspot hp = serviceManager.Create();
                    hp.Id = Guid.NewGuid().ToString();
                    hp.BeaconuuId = dto.BeaconuuId;
                    hp.BuildingId = dto.BuildingId;
                    hp.BuildingPlanId = dto.BuildingPlanId;
                    hp.HotspotActionTypeId = dto.HotspotActionTypeId;
                    hp.HotspotDisplayTypeId = dto.HotspotDisplayTypeId;
                    hp.DisplayDetails = dto.DisplayDetails;
                    hp.Name = dto.Name;
                    hp.Description = dto.Description;
                    hp.BeaconuuId = dto.BeaconuuId;

                    await serviceManager.AddAsync(hp);
                    dto.Id = hp.Id;
                    return Created<HotspotDto>(Request.RequestUri, dto);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Edit the hotspot from DB with the specified id, with the dates from the given BuldingDto.
        /// Afterwards the function return the dto created from the modified build from the DB.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(HotspotDto))]
        public async Task<IHttpActionResult> Put(string id, [FromBody] HotspotDto dto)
        {
            if (ModelState.IsValid)
            {
                id = HttpUtility.HtmlDecode(id);
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    // GET the hotspot with the specified Id. This need to have IsActive=true property.
                    Hotspot bld = await serviceManager.GetService<IHotspotService>().GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);

                    if (bld == null)
                    {
                        return BadRequest("Item not found");
                    }
                    // EDIT SESSION
                    if (bld.HotspotActionTypeId != dto.HotspotActionTypeId)
                    {
                        var actype = serviceManager.GetService<IHotspotActionTypeService>().GetAll().Where(a => a.IsActive).FirstOrDefault(b => b.Id == dto.HotspotActionTypeId);
                        var allowfile = actype.AllowedFileTypes;
                        var serviceFile = serviceManager.GetService<IFilesService>();
                        List<Files> deleteFiles = new List<Files>();
                        try
                        {
                            foreach (Files file in bld.Files)
                            {
                                var name = file.Name;
                                string patternImage = @"^.*\.(jpg|jpeg|JPEG|JPG|gif|GIF|doc|DOC|pdf|PDF)$";
                                string patternVideo = @"^.*\.(MP4|mp4|OGG|ogg|WebM|webm)$";
                                string patternAudio = @"^.*\.(MP3|mp3|OGG|ogg|wav|WAV|Wav)$";
                                var currentFileType = "";
                                // The file will be copied only if his content is support by the hotspot
                                // and if is a support format. (eg: video formats are: mp4, ogg and WebM).
                                // Otherwise the function will throw and unsupported media type exception.
                                if (System.Text.RegularExpressions.Regex.IsMatch(name, patternImage))
                                {
                                    currentFileType = "image";
                                }
                                else if (System.Text.RegularExpressions.Regex.IsMatch(name, patternVideo))
                                {
                                    currentFileType = "video";
                                }
                                else if (System.Text.RegularExpressions.Regex.IsMatch(name, patternAudio))
                                {
                                    currentFileType = "audio";
                                }
                                else
                                {
                                    currentFileType = "something else, not good";
                                }

                                if (allowfile.IndexOf(currentFileType, StringComparison.OrdinalIgnoreCase) < 0)
                                {
                                    deleteFiles.Add(file);
                                }
                            }
                            foreach (Files file in deleteFiles)
                            {
                                await serviceFile.SetDeletedAsync(file);
                            }
                        }
                        catch (Exception e)
                        {

                        }
                    }

                    bld.Name = dto.Name;
                    bld.Description = dto.Description;
                    bld.BeaconuuId = dto.BeaconuuId;
                    bld.HotspotDisplayTypeId = dto.HotspotDisplayTypeId;
                    bld.HotspotActionTypeId = dto.HotspotActionTypeId;
                    bld.DisplayDetails = dto.DisplayDetails;


                    // Save the changes to the DB.
                    await serviceManager.GetService<IHotspotService>().UpdateAsync(bld);

                    // Recreate the HotspotDto from the modified hotspot.
                    var result = await serviceManager.GetService<IHotspotService>().GetAll().Where(a => a.IsActive).Select(b => new HotspotDto()
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
                            Description = b.HotspotActionType.Description,
                            Id = b.HotspotActionType.Id,
                            Name = b.HotspotActionType.Name,
                            AllowedFileTypes = b.HotspotActionType.AllowedFileTypes
                        },
                        HotspotDisplayType = new HotspotDisplayTypeDto()
                        {
                            Description = b.HotspotDisplayType.Description,
                            Id = b.HotspotDisplayType.Id,
                            Name = b.HotspotDisplayType.Name,
                            FileName = b.HotspotDisplayType.FileName
                        },
                        Files = b.Files.Where(z => z.IsActive).Select(z => new FileWithButcketDTO()
                        {
                            BucketName = z.FileBucket.Name,
                            BucketPath = z.FileBucket.PhysicalPath,
                            FileDescription = z.Description,
                            FileName = z.Name
                        }).ToList(),
                        DisplayDetails = b.DisplayDetails,
                        Id = b.Id
                    }).FirstOrDefaultAsync(a => a.Id == id);

                    if (result == null)
                    {
                        return BadRequest("Item not found");
                    }
                    return Ok(result);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Attach a file to the specified hotspot.
        /// The file must be according the Hotspot display type of the selected hospot.
        /// Basic = Only Text
        /// Video, Images and Audio.
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public async Task<HttpResponseMessage> UploadFiles()
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

                // Get the needed dates.
                string fileName = provider.FormData["Name"];
                string fileDescription = provider.FormData["Description"];
                string id = provider.FormData["HotspotId"];
                string hotspotActionTypeId = provider.FormData["HotspotActionTypeId"];

                var serviceManager = new Service(DataBaseId, UserId);
                var service = serviceManager.GetService<IHotspotService>();

                // Get the hotspot where to attach the new file from the disk.
                Hotspot hp = service.GetAll().Where(a => a.IsActive)
                    .Include("Files")
                    .Include("Building.Actor").FirstOrDefault(a => a.Id == id);
                if ((hp != null) && (hp.HotspotActionType.AllowAttachment))
                {
                    // get the bucket
                    FileBuckets bucket = serviceManager.GetService<IFileBucketsService>().GetAll().FirstOrDefault(a => a.Name == hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + hp.BuildingPlanId);
                    if (bucket == null)
                    {
                        var fileBucketsService = serviceManager.GetService<IFileBucketsService>();
                        bucket = new FileBuckets()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Name = hp.Building.Actor.Name + "/Buildings/" + hp.BuildingId + "/Plans/" + hp.BuildingPlanId,
                            FileBucketTypeId = 2,
                            IsActive = true,
                            PhysicalPath = Tools.DefaultValues.FILESDIRECTORY.Replace("\\", "")
                        };
                        fileBucketsService.Add(bucket);
                    }

                    // Create the new file.
                    var destinationPath = Tools.Helper.SetFileNameVersion(HttpContext.Current.Server.MapPath(Tools.DefaultValues.FILESDIRECTORY + bucket.Name + "/" + fileName));
                    Files file = serviceManager.GetService<IFilesService>().Create();
                    file.Id = Guid.NewGuid().ToString();
                    file.Name = Path.GetFileName(destinationPath);
                    file.Description = fileDescription;
                    file.FileBucketId = bucket.Id;
                    serviceManager.GetService<IFilesService>().Add(file);

                    // Add the created file to the hotspot and save the changes.
                    hp.Files.Add(file);
                    serviceManager.Commit();


                    // Copy the file from disk in the correct folder.
                    // This illustrates how to get the file names.
                    foreach (MultipartFileData fileData in provider.FileData)
                    {
                        var name = fileData.Headers.ContentDisposition.FileName;
                        var nameTrimmed = name.Remove(name.Length - 1);
                        string patternImage = @"^.*\.(jpg|jpeg|JPEG|JPG|gif|GIF|doc|DOC|pdf|PDF|png|PNG)$";
                        string patternVideo = @"^.*\.(MP4|mp4|OGG|ogg|WebM|webm)$";
                        string patternAudio = @"^.*\.(MP3|mp3|OGG|ogg|wav|WAV|Wav)$";

                        // The file will be copied only if his content is support by the hotspot
                        // and if is a support format. (eg: video formats are: mp4, ogg and WebM).
                        // Otherwise the function will throw and unsupported media type exception.
                        if ((System.Text.RegularExpressions.Regex.IsMatch(nameTrimmed, patternImage) && (hp.HotspotActionType.AllowedFileTypes.IndexOf("Image", StringComparison.OrdinalIgnoreCase) < 0)))
                        {
                            throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                        }
                        else if ((System.Text.RegularExpressions.Regex.IsMatch(nameTrimmed, patternVideo)) && (hp.HotspotActionType.AllowedFileTypes.IndexOf("Video", StringComparison.OrdinalIgnoreCase) < 0))
                        {
                            throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                        }
                        else if ((System.Text.RegularExpressions.Regex.IsMatch(nameTrimmed, patternAudio)) && (hp.HotspotActionType.AllowedFileTypes.IndexOf("Audio", StringComparison.OrdinalIgnoreCase) < 0))
                        {
                            throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
                        }
                        var directory = destinationPath.Replace(file.Name, "");
                        if (!Directory.Exists(directory))
                            Directory.CreateDirectory(directory);
                        File.Move(fileData.LocalFileName, destinationPath);
                    }


                    return Request.CreateResponse(HttpStatusCode.OK);
                }
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
            throw new HttpResponseException(HttpStatusCode.Unauthorized);
        }

        /// <summary>
        /// Delete the hotspot with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                id = HttpUtility.HtmlDecode(id);
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {// Get the needed hotspot from the database.
                    var hps = await serviceManager.GetAll().Where(a => a.IsActive).Where(a => a.Id == id || a.BeaconuuId == id).ToListAsync();
                    if (hps == null || hps.Count == 0)
                    {
                        return NotFound();
                    }
                    // Set the hotspot in order to be deleted and save the changes.
                    await serviceManager.BulkDeleteAsync(hps);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Delete the hotspot with the specified id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> UnPin(string id)
        {
            if (ModelState.IsValid)
            {
                id = HttpUtility.HtmlDecode(id);
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {// Get the needed hotspot from the database.
                    var hps = await serviceManager.GetAll().Where(a => a.IsActive).Where(a => a.BeaconuuId == id).ToListAsync();
                    if (hps == null || hps.Count == 0)
                    {
                        return NotFound();
                    }
                    hps.ForEach(x => x.BeaconuuId = null);
                    await serviceManager.AddOrUpdateAsync(x => new { x.Id }, hps);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        [ResponseType(typeof(List<HotspotDto>))]
        public async Task<IHttpActionResult> UpdateDisplayDetails(HotspotCustomPropertiesDto item)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {// Get the needed hotspot from the database.
                    var hps = await serviceManager.GetAll().Include(x => x.HotspotActionType).Where(a => a.IsActive).Where(a => a.BeaconuuId == item.BeaconuuId)
                                                  .Where(x => x.HotspotDisplayType.Type == HotspotType.Line || x.HotspotDisplayType.Type == HotspotType.Circle).ToListAsync();
                    if (hps == null || hps.Count == 0)
                        return NotFound();

                    foreach (var hp in hps)
                    {
                        var jRootObject = new RootObject();
                        if (hp.HotspotDisplayType.Type == HotspotType.Line)
                        {
                            jRootObject = JsonConvert.DeserializeObject<RootObject>(hp.DisplayDetails);
                            jRootObject.Color = item.LineColor;
                            jRootObject.Size.width = item.LineSize > 0 ? item.LineSize : 1;
                            hp.DisplayDetails = JsonConvert.SerializeObject(jRootObject);
                        }
                        else if (hp.HotspotDisplayType.Type == HotspotType.Circle)
                        {
                            jRootObject = JsonConvert.DeserializeObject<RootObject>(hp.DisplayDetails);
                            if (jRootObject.Size.width > 0)
                            {
                                jRootObject.Color = item.CircleColor;
                                jRootObject.Size.width = item.CircleSize > 0 ? item.CircleSize : 1;
                            }
                            hp.DisplayDetails = JsonConvert.SerializeObject(jRootObject);
                        }
                    }
                    await serviceManager.AddOrUpdateAsync(x => new { x.Id }, hps);
                    var res = hps.Select(b => new HotspotDto()
                    {
                        BeaconuuId = b.BeaconuuId,
                        BuildingId = b.BuildingId,
                        Name = b.Name,
                        Description = b.Description,
                        BuildingPlanId = b.BuildingPlanId,
                        HotspotActionTypeId = b.HotspotActionTypeId,
                        HotspotDisplayTypeId = b.HotspotDisplayTypeId,
                        Id = b.Id,
                        DisplayDetails = b.DisplayDetails
                    });
                    return Ok(res);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        [ResponseType(typeof(HotspotDto))]
        public async Task<IHttpActionResult> UpdateDisplayDetail(HotspotCustomPropertiesDto item)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId).GetService<IHotspotService>())
                {// Get the needed hotspot from the database.
                    var hp = await serviceManager.GetAll().Include(x => x.HotspotActionType).Where(a => a.IsActive).Where(a => a.Id == item.BeaconuuId)
                                                  .Where(x => x.HotspotDisplayType.Type == HotspotType.Line || x.HotspotDisplayType.Type == HotspotType.Circle).FirstOrDefaultAsync();
                    if (hp == null)
                        return NotFound();


                    var jRootObject = new RootObject();
                    jRootObject = JsonConvert.DeserializeObject<RootObject>(hp.DisplayDetails);
                    jRootObject.Color = item.LineColor;
                    jRootObject.Size.width = item.LineSize > 0 ? item.LineSize : 1;
                    hp.DisplayDetails = JsonConvert.SerializeObject(jRootObject);

                    await serviceManager.UpdateAsync(hp);
                    var res = new HotspotDto()
                    {
                        BeaconuuId = hp.BeaconuuId,
                        BuildingId = hp.BuildingId,
                        Name = hp.Name,
                        Description = hp.Description,
                        BuildingPlanId = hp.BuildingPlanId,
                        HotspotActionTypeId = hp.HotspotActionTypeId,
                        HotspotDisplayTypeId = hp.HotspotDisplayTypeId,
                        Id = hp.Id,
                        DisplayDetails = hp.DisplayDetails
                    };
                    return Ok(res);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }
    }
}
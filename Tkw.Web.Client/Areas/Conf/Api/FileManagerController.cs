using BusinessObjects;
using Common;
using Common.Core;
using Common.Domain;
using Common.Independent;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
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
    public class FileManagerController : BaseApiController
    {

        [ResponseType(typeof(BuildingDto))]
        public async Task<IHttpActionResult> GetBuildingFolders(string id)
        {
            if (ModelState.IsValid)
            {
                using (var buildingService = new Service(DataBaseId, UserId).GetService<IBuildingService>())
                {

                    var item = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor.ActorPermissions).Include(x => x.ActorBuildingPermissions)
                                     .Include("ActorBuildingPermissions.Actor.ActorPermissions").FirstOrDefaultAsync(a => a.Id == id);

                    if (item == null)
                        return BadRequest("Building folder not found");

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
                        BuildingsNo = item.BuildingsNo,
                        BuildingType = item.BuildingType,
                        ConstructionType = item.ConstructionType,
                        EmergencyEmail = item.EmergencyEmail,
                        EmergencyPhone = item.EmergencyPhone,
                        UnitsNo = item.UnitsNo,
                        UserIds = item.ActorBuildingPermissions.Where(x => x.IsActive).ToList().Select(t => t.ActorId).ToList(),
                        BuildingFolders = buildingFoldersVisible,
                    };
                    return Ok(response);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        public async Task<IHttpActionResult> CreateFolder(string buildingId, string rootFolder, string folderName)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                var buildingService = service.GetService<IBuildingService>();
                var folderPermissionService = service.GetService<IActorPermissionService>();
                var dto = new BuildingFolderDto();
                var building = await buildingService.GetAll().Where(x => x.Id == buildingId).Include(x => x.Actor).Include(x => x.ActorBuildingPermissions).FirstOrDefaultAsync();
                if (building == null)
                    return BadRequest("Building not found!");


                if (string.IsNullOrEmpty(rootFolder))
                {
                    var path = HttpContext.Current.Server.MapPath(DefaultValues.FILESDIRECTORY + "\\" + building.Actor.Name + "\\" + "Buildings\\" + buildingId);
                    if (Directory.Exists(path))
                    {
                        if (!string.IsNullOrEmpty(rootFolder))
                            path = path + "/" + rootFolder;

                        path = path + "/" + folderName;
                        if (!Directory.Exists(path))
                            Directory.CreateDirectory(path);
                        else
                            return BadRequest("Folder could not be created at provided path. There is another folder with this name!");
                        dto.id = Guid.NewGuid().ToString();
                        dto.BuildingId = buildingId;
                        dto.Name = folderName;
                        dto.ContentPath = path;
                        dto.type = 0;
                        dto.IsBucket = false;
                        dto.spriteCssClass = "folder";
                        dto.CreatedDate = DateTime.Now;
                        dto.items = new List<BuildingFolderDto>();
                        dto.Create = dto.Read = dto.Delete = dto.SetPermission = true;
                    }
                    else
                        return BadRequest("Folder could not be created at provided path!");
                }
                else
                {
                    rootFolder = "~/" + rootFolder.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);
                    var path = HttpContext.Current.Server.MapPath(rootFolder + "/" + folderName);
                    if (!Directory.Exists(path))
                        Directory.CreateDirectory(path);
                    else
                        return BadRequest("Folder could not be created at provided path. There is another folder with this name!");
                    dto.id = Guid.NewGuid().ToString();
                    dto.BuildingId = buildingId;
                    dto.Name = folderName;
                    dto.ContentPath = path.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);
                    dto.type = 0;
                    dto.spriteCssClass = "folder";
                    dto.IsBucket = DefaultValues.BuildingDefaultFolders.Contains(dto.ContentPath) ? true : false;
                    dto.Create = dto.Read = dto.Delete = dto.SetPermission = true;
                    dto.items = new List<BuildingFolderDto>();
                    return Ok(dto);
                }

                //add default permissions
                List<ActorPermission> items = new List<ActorPermission>();
                var actors = building.ActorBuildingPermissions.ToList();
                var actIds = actors.Select(t => t.ActorId).ToList();

                foreach (var actor in actors)
                {
                    var item = folderPermissionService.Create();
                    item.ActorId = actor.ActorId;
                    item.Resource = PermissionResource.Files;
                    item.IsActive = true;
                    item.Value = dto.ContentPath.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty).Replace("/", "\\");
                    //var isViewer = await UserManager.IsInRoleAsync(actor.ActorId, DefaultValues.BUILDING_VIEWER);
                    //if (!isViewer)
                    //    item.Feature = PermissionFeature.Create | PermissionFeature.Read | PermissionFeature.Delete | PermissionFeature.SetPermission;
                    //else
                    //    item.Feature = 0;
                    if (UserId == actor.ActorId)
                        item.Feature = PermissionFeature.Read | PermissionFeature.Create | PermissionFeature.Delete | PermissionFeature.SetPermission;
                    else
                        item.Feature = 0;
                    items.Add(item);
                }
                await AddUsersToPermission(service, folderPermissionService, buildingService, dto, building, items, actIds);
                await folderPermissionService.AddOrUpdateAsync(s => new { s.Id }, items);
                return Ok(dto);
            }
        }

        [HttpPost]
        public async Task<IHttpActionResult> RemoveDirectory(string id, string path)
        {
            if (!string.IsNullOrEmpty(path))
            {
                try
                {
                    path = path.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);
                    var res = path.Replace(Path.GetFileName(path), "");
                    res = res.Remove(res.Length - 1);
                    var destinationPath = HttpContext.Current.Server.MapPath("~/" + path);

                    if (Directory.Exists(destinationPath))
                    {
                        new System.IO.DirectoryInfo(destinationPath).Delete(true);
                        using (var service = new Service(DataBaseId, UserId))
                        {
                            var name = path.Substring(path.LastIndexOf('\\') + 1, path.Length - path.LastIndexOf('\\') - 1);
                            var folderPermissionService = service.GetService<IActorPermissionService>();
                            var fldPermissions = await folderPermissionService.GetAll().Where(x => x.Value.Contains(id) && x.Value.EndsWith(name)).ToListAsync();
                            await folderPermissionService.BulkDeleteAsync(fldPermissions);
                        }
                        res = res.EndsWith(id) ? "root" : res;
                        return Ok(res);
                    }
                    return BadRequest("Directory not found");
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.InnerException.ToString());
                }
            }
            return BadRequest("Directory not found");
        }
        [HttpPost]
        public async Task<HttpResponseMessage> AddFileToFolder()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }
            try
            {
                using (var service = new Service(DataBaseId, UserId))
                {


                    string root = HttpContext.Current.Server.MapPath("~/App_Data");
                    var provider = new MultipartFormDataStreamProvider(root);
                    await Request.Content.ReadAsMultipartAsync(provider);

                    string path = provider.FormData["rootPath"];
                    string fileName = provider.FormData["fileName"];
                    // This illustrates how to get the file names.
                    path = "~/" + path.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);
                    var destinationName = HttpContext.Current.Server.MapPath(path + "/" + fileName);
                    destinationName = Path.GetFileName(Tools.Helper.SetFileNameVersion(destinationName));
                    var dst = HttpContext.Current.Server.MapPath(path + "\\" + destinationName);

                    foreach (MultipartFileData fileData in provider.FileData)
                    {
                        File.Move(fileData.LocalFileName, dst);
                    }

                    var dto = new BuildingFolderDto();
                    dto.id = Guid.NewGuid().ToString();
                    dto.Name = destinationName;
                    dto.ContentPath = dst.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty); ;
                    dto.type = 2;
                    dto.IsBucket = DefaultValues.BuildingDefaultFolders.Contains(dto.ContentPath) ? true : false;
                    dto.spriteCssClass = Helper.GetFileType(dto.Name);
                    dto.CreatedDate = DateTime.Now;
                    //default permission for creator
                    dto.Create = dto.Read = dto.Delete = dto.SetPermission = true;
                    //set permission
                    var q = dto.ContentPath.Split('\\');
                    if (q.Count() > 0)
                    {
                        var s1 = q[3];
                        var s2 = q[4];
                        dto.BuildingId = s1;

                        var buildingService = service.GetService<IBuildingService>();
                        var building = await buildingService.GetAll().Where(x => x.Id == s1).Include(x => x.Actor).Include(x => x.ActorBuildingPermissions).FirstOrDefaultAsync();
                        if (building == null)
                            return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Building not found!");
                        var actors = building.ActorBuildingPermissions.ToList();
                        var actorIds = actors.Select(t => t.ActorId).ToList();
                        var folderPermissionService = service.GetService<IActorPermissionService>();

                        var fldPermissions = await folderPermissionService.GetAll().Where(x => x.Value.Contains(s1) && x.Value.EndsWith(s2) && actorIds.Contains(x.ActorId)).ToListAsync();

                        List<ActorPermission> items = new List<ActorPermission>();
                        foreach (var actor in actors)
                        {
                            var fldPermission = fldPermissions.Where(x => x.ActorId == actor.ActorId).FirstOrDefault();
                            if (fldPermission != null)
                            {
                                PermissionFeature val = 0;
                                if ((fldPermission.Feature & PermissionFeature.Read) == PermissionFeature.Read)
                                    val = val | PermissionFeature.Read;
                                if ((fldPermission.Feature & PermissionFeature.Delete) == PermissionFeature.Delete)
                                    val = val | PermissionFeature.Delete;
                                if ((fldPermission.Feature & PermissionFeature.SetPermission) == PermissionFeature.SetPermission)
                                    val = val | PermissionFeature.SetPermission;
                                var item = folderPermissionService.Create();
                                item.ActorId = actor.ActorId;
                                item.Resource = PermissionResource.Files;
                                item.Value = dto.ContentPath;
                                item.Feature = val;
                                items.Add(item);
                            }
                        }
                        await AddUsersToPermission(service, folderPermissionService, buildingService, dto, building, items, actorIds);
                        await folderPermissionService.AddOrUpdateAsync(s => new { s.Id }, items);
                    }

                    return Request.CreateResponse(HttpStatusCode.OK, dto);
                }
            }
            catch (System.Exception e)
            {
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            }
        }

        [HttpPost]
        public async Task<IHttpActionResult> RemoveFile(string id, string path)
        {
            if (!string.IsNullOrEmpty(path))
            {
                try
                {
                    var res = path.Replace(Path.GetFileName(path), "");
                    res = res.Remove(res.Length - 1);
                    var destinationPath = HttpContext.Current.Server.MapPath("~/" + path);

                    if (File.Exists(destinationPath))
                    {
                        File.Delete(destinationPath);
                        using (var service = new Service(DataBaseId, UserId))
                        {
                            var name = destinationPath.Substring(destinationPath.LastIndexOf('\\') + 1, destinationPath.Length - destinationPath.LastIndexOf('\\') - 1);
                            var folderPermissionService = service.GetService<IActorPermissionService>();
                            var fldPermissions = await folderPermissionService.GetAll().Where(x => x.Value.Contains(id) && x.Value.EndsWith(name)).ToListAsync();
                            await folderPermissionService.BulkDeleteAsync(fldPermissions);
                        }
                        return Ok(res);
                    }
                    return BadRequest("File not found");
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.InnerException.ToString());
                }
            }
            return BadRequest("File not found");
        }

        [ResponseType(typeof(BuildingFolderPermissionDto))]
        public async Task<IHttpActionResult> GetFolderPermission(string id, string path)
        {
            if (ModelState.IsValid)
            {
                using (var buildingService = new Service(DataBaseId, UserId).GetService<IBuildingService>())
                {
                    var item = await buildingService.GetAll().Where(a => a.IsActive).Include(x => x.Actor).Include(x => x.ActorBuildingPermissions)
                                    .Include("ActorBuildingPermissions.Actor.ActorPermissions").FirstOrDefaultAsync(a => a.Id == id);

                    if (item == null)
                        return BadRequest("Building folder not found");

                    path = path.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty).Replace("/", "\\");

                    List<BuildingFolderPermissionDto> response = new List<BuildingFolderPermissionDto>();
                    if (item.ActorBuildingPermissions != null)
                    {
                        BuildingFolderPermissionDto result = null;
                        foreach (var act in item.ActorBuildingPermissions.Where(t => t.IsActive).ToList())
                        {
                            var isViewer = await UserManager.IsInRoleAsync(act.ActorId, DefaultValues.BUILDING_VIEWER);

                            result = new BuildingFolderPermissionDto();
                            result.ActorId = act.ActorId;
                            result.BuildingId = act.BuildingId;
                            result.ActorName = act.Actor.Name;
                            result.IsViewer = isViewer;
                            if (!isViewer)
                                result.Create = result.Delete = result.Read = result.SetPermission = true;
                            else
                                result.Create = result.Delete = result.Read = result.SetPermission = false;

                            result.File = path;
                            response.Add(result);
                        }
                    }

                    var data = item.ActorBuildingPermissions.SelectMany(t => t.Actor.ActorPermissions.Where(v => v.Resource == PermissionResource.Files && v.Value.ToLower().Equals(path.ToLower()))).ToList();
                    foreach (var ap in data)
                    {
                        var act = response.FirstOrDefault(x => x.ActorId == ap.ActorId);
                        if (act != null)
                        {
                            act.Create = (ap.Feature & PermissionFeature.Create) == PermissionFeature.Create ? true : false;
                            act.Read = (ap.Feature & PermissionFeature.Read) == PermissionFeature.Read ? true : false;
                            act.Delete = (ap.Feature & PermissionFeature.Delete) == PermissionFeature.Delete ? true : false;
                            act.SetPermission = (ap.Feature & PermissionFeature.SetPermission) == PermissionFeature.SetPermission ? true : false;
                        }
                    }

                    return Ok(response);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        public async Task<IHttpActionResult> SetPermission(bool recursive, [FromBody]BuildingFolderPermissionDto[] dtos)
        {
            if (ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var folderPermissionService = service.GetService<IActorPermissionService>();
                    var items = new List<ActorPermission>();

                    foreach (var dto in dtos)
                    {

                        var item = folderPermissionService.Create();
                        item.ActorId = dto.ActorId;
                        item.Resource = PermissionResource.Files;
                        item.Value = dto.File.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty).Replace("/", "\\");
                        item.Feature = 0;
                        PermissionFeature val = 0;
                        if (dto.Create)
                            val = PermissionFeature.Create;
                        if (dto.Read)
                            val = val | PermissionFeature.Read;
                        if (dto.Delete)
                            val = val | PermissionFeature.Delete;
                        if (dto.SetPermission)
                            val = val | PermissionFeature.SetPermission;
                        item.Feature = val;
                        items.Add(item);
                        if (recursive)
                        {
                            var buildingFolders = new List<BuildingFolderDto>();
                            var mockBuilding = new Building();
                            dto.File = dto.File.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);
                            dto.File = HttpContext.Current.Server.MapPath("~/" + dto.File);
                            var di = new DirectoryInfo(dto.File);
                            var fileEntries = di.EnumerateFiles().ToList();
                            foreach (var fir in fileEntries)
                            {
                                var child = folderPermissionService.Create();
                                child.ActorId = item.ActorId;
                                child.Resource = PermissionResource.Files;
                                child.Value = fir.FullName.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty).Replace("/", "\\");
                                child.Feature = item.Feature;
                                items.Add(child);
                            }
                            var topDirectories = System.IO.Directory.GetDirectories(dto.File, "*.*", System.IO.SearchOption.TopDirectoryOnly).ToList();
                            foreach (var topDirectory in topDirectories)
                            {
                                if (DefaultValues.BuildingDefaultFolders.Count(t => topDirectory.ToLower().EndsWith(t.ToLower())) == 0)
                                    ParseDirectory(mockBuilding, topDirectory, ref buildingFolders, loadWithPermission: false);
                            }
                            foreach (var fir in buildingFolders)
                            {
                                SetPermissionRecursive(folderPermissionService, item, fir, ref items);
                            }
                        }
                    }

                    await folderPermissionService.AddOrUpdateAsync(x => new { x.ActorId, x.Value }, items);

                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        private void SetPermissionRecursive(IActorPermissionService folderPermissionService, ActorPermission parent, BuildingFolderDto dto, ref List<ActorPermission> items)
        {
            var child = folderPermissionService.Create();
            child.ActorId = parent.ActorId;
            child.Resource = PermissionResource.Files;
            child.Value = dto.ContentPath;
            child.Feature = parent.Feature;
            items.Add(child);
            foreach (var d in dto.items)
            {
                SetPermissionRecursive(folderPermissionService, parent, d, ref items);
            }
        }

        private async Task AddUsersToPermission(Service service, IActorPermissionService folderPermissionService, IBuildingService buildingService,
                                          BuildingFolderDto dto, Building building, List<ActorPermission> items, List<string> actIds)
        {
            var roles = service.GetService<IRoleService>().GetAll().Where(x => x.Name == DefaultValues.TENANT || x.Name == DefaultValues.CLIENT_ADMIN).ToList();
            var roleIds = roles.Select(t => t.Id).ToList();
            //get company admins and client admins for selected client
            var users = service.GetService<IUserService>().GetAll().Include(x => x.UserCompanies)
                .Where(a => !actIds.Contains(a.Id) && a.DataBaseId == DataBaseId)
                .Where(t => t.Roles.Count(c => roleIds.Contains(c.RoleId)) > 0).ToList();
            var ids = new List<string>();
            foreach (var user in users)
            {
                var roleTenant = roles.FirstOrDefault(t => t.Name == DefaultValues.TENANT);
                var roleClientAdmin = roles.FirstOrDefault(t => t.Name == DefaultValues.CLIENT_ADMIN);
                var isInRole = false;
                //check tenant role
                if (roleTenant != null)
                {
                    isInRole = user.Roles.Any(t => t.RoleId == roleTenant.Id);
                }
                if (!isInRole)
                {
                    isInRole = user.Roles.Any(t => t.RoleId == roleClientAdmin.Id);
                    if (isInRole)
                    {
                        var isInClientContext = user.UserCompanies.FirstOrDefault(x => x.CompanyId == building.ActorId);
                        if (roleClientAdmin == null)
                            isInRole = false;
                    }
                }
                if (isInRole)
                {
                    ids.Add(user.Id);
                    var item = folderPermissionService.Create();
                    item.ActorId = user.Id;
                    item.Resource = PermissionResource.Files;
                    item.IsActive = true;
                    item.Value = dto.ContentPath.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty).Replace("/", "\\");
                    if (UserId == user.Id)
                        item.Feature = PermissionFeature.Read | PermissionFeature.Create | PermissionFeature.Delete | PermissionFeature.SetPermission;
                    else
                        item.Feature = 0;
                    items.Add(item);
                }
            }
            //add tenant to bulding permission for better mentaince
            if (ids.Count > 0)
            {
                bool update = false;
                foreach (var id in ids)
                {
                    var newUC = building.ActorBuildingPermissions.FirstOrDefault(x => x.ActorId == id);
                    if (newUC == null)
                    {
                        building.ActorBuildingPermissions.Add(new ActorBuilding() { BuildingId = building.Id, ActorId = id, CreateDate = DateTime.UtcNow, CreatedBy = UserId });
                        if (!update)
                            update = true;
                    }
                }
                if (update)
                    await buildingService.UpdateAsync(building);
            }
        }
    }
}

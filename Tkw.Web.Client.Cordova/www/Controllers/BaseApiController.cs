using Microsoft.AspNet.Identity.Owin;
using System;
using System.Net.Http;
using System.Web.Http;
using Common;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using Tools;
using System.IO;
using System.Collections.Generic;
using Common.Core;
using System.Web.Http.Cors;
using BusinessObjects;
using System.Web;
using Common.Domain;

namespace Web.Client.Net.Areas
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public abstract class BaseApiController : ApiController
    {
        private UserManager _userManager;
        protected UserManager UserManager
        {
            get
            {
                return _userManager ?? new UserManager();
            }
            private set
            {
                _userManager = value;
            }
        }

        protected int DataBaseId
        {
            get
            {
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
                {
                    return principal.Claims.Any(x => x.Type == "DataBaseId") ? int.Parse(principal.Claims.FirstOrDefault(x => x.Type == "DataBaseId").Value) : 0;
                }
                else
                    return 0;
            }
        }

        protected string UserId
        {
            get
            {
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
                {
                    return principal.Claims.Any(x => x.Type == "UserId") ? principal.Claims.FirstOrDefault(x => x.Type == "UserId").Value : string.Empty;
                }
                else
                    return string.Empty;
            }
        }

        protected string UserEmail
        {
            get
            {
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
                {
                    return principal.Claims.Any(x => x.Type == "Email") ? principal.Claims.FirstOrDefault(x => x.Type == "Email").Value : string.Empty;
                }
                else
                    return string.Empty;
            }
        }

        protected string UserBranchId
        {
            get
            {
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
                {
                    return principal.Claims.Any(x => x.Type == "LastUsedCompanyId") ? principal.Claims.FirstOrDefault(x => x.Type == "LastUsedCompanyId").Value : string.Empty;
                }
                else
                    return string.Empty;
            }
        }

        protected override void Initialize(HttpControllerContext requestContext)
        {
            base.Initialize(requestContext);
        }

        public override Task<HttpResponseMessage> ExecuteAsync(HttpControllerContext controllerContext, CancellationToken cancellationToken)
        {
            return base.ExecuteAsync(controllerContext, cancellationToken);
        }

        protected void ParseDirectory(Building item, string topDirectory, ref List<BuildingFolderDto> results, BuildingFolderDto parent = null, bool loadWithPermission = true)
        {
            var di = new DirectoryInfo(topDirectory);
            BuildingFolderDto dto = new BuildingFolderDto();
            dto.BuildingId = item.Id;
            dto.Name = di.Name;
            dto.type = 0;
            if (parent == null)
                dto.IsBucket = DefaultValues.BuildingDefaultFolders.Contains(di.Name) ? true : false;
            else
                dto.IsBucket = parent.IsBucket;
            dto.id = Guid.NewGuid().ToString();
            dto.spriteCssClass = "folder";
            dto.ContentPath = di.FullName.Replace(HttpContext.Current.Request.PhysicalApplicationPath, String.Empty);

            ActorPermission fldPermissions = null;
            if (loadWithPermission && item.ActorBuildingPermissions != null)
            {
                fldPermissions = item.ActorBuildingPermissions.Where(x => x.ActorId == UserId).Where(t => t.Actor.ActorPermissions != null)
                                         .SelectMany(t => t.Actor.ActorPermissions.Where(v => v.Resource == PermissionResource.Files && v.Value.ToLower().Equals(dto.ContentPath.ToLower()))).FirstOrDefault();

                if (fldPermissions != null)
                {
                    dto.Create = (fldPermissions.Feature & PermissionFeature.Create) == PermissionFeature.Create ? true : false;
                    dto.Read = (fldPermissions.Feature & PermissionFeature.Read) == PermissionFeature.Read ? true : false;
                    dto.Delete = (fldPermissions.Feature & PermissionFeature.Delete) == PermissionFeature.Delete ? true : false;
                    dto.SetPermission = (fldPermissions.Feature & PermissionFeature.SetPermission) == PermissionFeature.SetPermission ? true : false;
                    dto.Feature = fldPermissions.Feature;
                    dto.CreatedBy = fldPermissions.CreatedBy;
                    dto.IsVisible = (int)dto.Feature > 0;
                }
                else
                {
                    if (User.IsInRole(DefaultValues.TENANT) || User.IsInRole(DefaultValues.ROLE_ROOT))
                    {
                        dto.Create = dto.Delete = dto.Read = dto.SetPermission = true;
                        dto.IsVisible = true;
                        dto.Feature = PermissionFeature.Create | PermissionFeature.Read | PermissionFeature.Delete | PermissionFeature.SetPermission;
                    }
                    else
                    {
                        dto.IsVisible = false;
                        dto.Create = dto.Delete = dto.Read = dto.SetPermission = false;
                        dto.Feature = PermissionFeature.Create | PermissionFeature.Read | PermissionFeature.Delete | PermissionFeature.SetPermission;
                    }
                }
            }
            dto.items = new List<BuildingFolderDto>();
            var fileEntries = di.EnumerateFiles().ToList();
            foreach (var file in fileEntries)
            {
                var fi = new FileInfo(file.Name);
                BuildingFolderDto dtoFile = new BuildingFolderDto();
                dtoFile.BuildingId = item.Id;
                dtoFile.id = Guid.NewGuid().ToString();
                dtoFile.Name = file.Name;
                dtoFile.type = 2;
                dtoFile.IsBucket = dto.IsBucket;
                dtoFile.spriteCssClass = Tools.Helper.GetFileType(file.Name);
                dtoFile.ContentPath = dto.ContentPath + "\\" + file.Name;
                dtoFile.CreatedDate = file.CreationTime;
                if (loadWithPermission && item.ActorBuildingPermissions != null)
                {
                    //var filePermissions = item.ActorBuildingPermissions.Where(x => x.ActorId == UserId).Where(t => t.Actor.ActorPermissions != null)
                    //                  .SelectMany(t => t.Actor.ActorPermissions.Where(v => v.Resource == PermissionResource.Files && v.Value.ToLower().Equals(dtoFile.ContentPath.ToLower()))).FirstOrDefault();

                    var filePermissions = item.Actor.ActorPermissions.Where(t => t.ActorId == UserId).Where(v => v.Resource == PermissionResource.Files && v.Value.ToLower().Equals(dto.ContentPath.ToLower())).FirstOrDefault();

                    if (filePermissions != null)
                    {
                        dtoFile.Create = (filePermissions.Feature & PermissionFeature.Create) == PermissionFeature.Create ? true : false;
                        dtoFile.Read = (filePermissions.Feature & PermissionFeature.Read) == PermissionFeature.Read ? true : false;
                        dtoFile.Delete = (filePermissions.Feature & PermissionFeature.Delete) == PermissionFeature.Delete ? true : false;
                        dtoFile.SetPermission = (filePermissions.Feature & PermissionFeature.SetPermission) == PermissionFeature.SetPermission ? true : false;
                        dtoFile.Feature = filePermissions.Feature;
                        dtoFile.CreatedBy = filePermissions.CreatedBy;
                        dtoFile.IsVisible = (int)dtoFile.Feature > 0;
                    }
                    else
                    {
                        if (User.IsInRole(DefaultValues.TENANT) || User.IsInRole(DefaultValues.ROLE_ROOT))
                        {
                            dtoFile.Create = dtoFile.Delete = dtoFile.Read = dtoFile.SetPermission = true;
                            dtoFile.IsVisible = true;
                            dtoFile.Feature = PermissionFeature.Read | PermissionFeature.Delete | PermissionFeature.SetPermission;
                        }
                        else
                        {
                            dtoFile.Create = dtoFile.Delete = dtoFile.SetPermission = false;
                            dtoFile.Read = true;
                            dtoFile.IsVisible = true;
                            dtoFile.Feature = PermissionFeature.Read | PermissionFeature.Delete | PermissionFeature.SetPermission;
                        }
                    }
                }
                if (dtoFile.IsVisible)
                {
                    dto.IsVisible = true;
                }
                dto.items.Add(dtoFile);
            }
            if (parent == null)
                results.Add(dto);
            else
                parent.items.Add(dto);

            var subDirs = di.EnumerateDirectories().ToList();
            foreach (var subDir in subDirs)
            {
                ParseDirectory(item, subDir.FullName, ref results, dto, loadWithPermission);
            }
        }


        protected void GetVisibleItems(BuildingFolderDto item, ref List<BuildingFolderDto> results)
        {
            var remItems = new List<BuildingFolderDto>();
            for (var i = 0; i < item.items.Count; i++)
            {
                if (!item.items[i].IsVisible)
                {
                    remItems.Add(item.items[i]);
                }
            }
            item.items = item.items.Except(remItems).ToList();
            if (item.items.Count > 0)
            {
                results.Add(item);
            }
            if (results.Count(x => x.id == item.id) == 0 && item.IsVisible)
            {
                results.Add(item);
            }
        }
    }
}
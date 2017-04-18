using BusinessObjects;
using Common;
using Common.Core;
using Common.Domain;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.OData;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;
using Tools;

namespace Web.Client.Net.Areas.Auth.Api
{
    /// <summary>
    ///User Web Api Controller - Encapsulate the Web Api REST operations for user object
    /// </summary>
    [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN + "," + DefaultValues.BUILDING_ADMIN + "," + DefaultValues.BUILDING_VIEWER)]
    public class UserController : BaseApiController
    {
        /// <summary>
        /// Looks up for users entities from repository
        /// </summary>
        /// <param name="options"> Client query options - odata protocol </param>
        /// <returns>Return all users from repository</returns>
        [EnableQuery]
        public IQueryable<UserDto> GetUsers(ODataQueryOptions<UserDto> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var result = serviceManager.GetService<IUserService>().GetAll()
                                           .Include(x => x.UserProfile)
                                           .Include(x=>x.UserCompanies)
                                           .Include(x => x.DataBase);

                if (options.SelectExpand != null)
                {
                    Request.ODataProperties().SelectExpandClause = options.SelectExpand.SelectExpandClause;
                    return  result.ToDtos().AsQueryable();
                }
                else
                    return options.ApplyTo(result.ToDtos().AsQueryable()) as IQueryable<UserDto>;

            }
        }

        /// <summary>
        /// Looks up for users entities from repository
        /// </summary>
        /// <param name="options"> Client query options - odata protocol </param>
        /// <returns>Return all users from repository</returns>
        [EnableQuery]
        [OverrideAuthorization]
        [Authorize]
        public async Task<IQueryable<UserDto>> GetAll(ODataQueryOptions<UserDto> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var result = serviceManager.GetService<IUserService>().GetAll()
                                           .Include(x => x.UserProfile)
                                           .Include("UserCompanies.Company")
                                           .Include(x => x.DataBase.Companies);

                if (options.SelectExpand != null)
                {
                    Request.ODataProperties().SelectExpandClause = options.SelectExpand.SelectExpandClause;
                    return (await result.ToListAsync()).ToDtos().AsQueryable();
                }
                else
                    return options.ApplyTo((await result.ToListAsync()).ToDtos().AsQueryable()) as IQueryable<UserDto>;

            }
        }

        [EnableQuery]
        [OverrideAuthorization]
        [Authorize]
        public async Task<IList<UserDto>> GetAllByClient(string clientId)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var items = await serviceManager.GetService<IUserCompanyService>().GetAll().Where(t => t.IsActive)
                                          .Where(t => t.CompanyId == clientId && t.User.Type == UserType.BusinessUser).Select(t=>t.User).ToListAsync();

                return items.ToDtos();
            }
        }

        /// <summary> 
        /// Get user by id. 
        /// </summary> 
        /// <param name="id">User id</param> 
        /// <returns>The user with the specified id</returns>
        [ResponseType(typeof(UserDto))]
        [HttpGet]
        public async Task<IHttpActionResult> Get(string id)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                User item = await serviceManager.GetService<IUserService>().GetAll()
                                                .Include(x => x.UserProfile)
                                                .Include(x => x.UserProfile.Address)
                                                .Include(x => x.UserProfile.Address.Country)
                                                .Include(x => x.UserProfile.Globalization)
                                                .FirstOrDefaultAsync(x => x.Id == id);
                if (item == null)
                    return NotFound();
                return Ok(item.ToDto(true, true));
            }
        }

        /// <summary> 
        /// Add a new user. 
        /// </summary> 
        /// <param name="item">User to add.</param> 
        /// <returns>The added user</returns> 
        public async Task<IHttpActionResult> Post(UserDto item)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    var user = await serviceManager.GetService<IUserService>().CreateUserAsync(item, item.Password);
                    return Created<UserDto>(Request.RequestUri, item);
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary> 
        /// Update an existing user. 
        /// </summary> 
        /// <param name="item">User to update</param> 
        /// <returns>The updated user.</returns> 
        [HttpPut]
        public async Task<IHttpActionResult> Put([FromBody]UserDto item)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    var userService = serviceManager.GetService<IUserService>();

                    var user = await serviceManager.GetService<IUserService>().GetAll()
                                           .Include(x => x.UserProfile)
                                           .Include("UserCompanies.Company")
                                           .Include(x => x.DataBase)
                                           .FirstOrDefaultAsync(x=>x.Id== item.Id);
                    if (user == null)
                        return NotFound();
                    user.UserName = item.UserName;
                    user.Email = item.Email;
                    user.UserProfile.FirstName = item.FirstName;
                    user.UserProfile.LastName = item.LastName;
                    user.UserCompanies = user.UserCompanies ?? new List<UserCompany>();

                    var userCompanies = user.UserCompanies.ToList();
                    var ucIds = userCompanies.Where(x => x.Company.Type == CompanyType.Client).Select(t => t.CompanyId).ToList();
                    if (item.ClientIds != null)
                    {
                        userCompanies.Where(t => t.Company.Type == CompanyType.Client && !item.ClientIds.Contains(t.CompanyId)).ToList().ForEach(x => userCompanies.Remove(x));

                        foreach (var s in item.ClientIds)
                        {
                            var newUC = userCompanies.FirstOrDefault(x => x.CompanyId == s);
                            if (newUC != null)
                                newUC.IsActive = true;
                            else
                                userCompanies.Add(new UserCompany() { CompanyId = s, UserId = user.Id });
                        }
                    }
                    else
                    {
                        if (ucIds.Count > 0)
                        {
                            userCompanies.ToList().ForEach(x => userCompanies.Remove(x));
                        }
                    }
                    user.UserCompanies = userCompanies;
                    if (item.TenantId.HasValue() && user.Type== UserType.Root)
                    {
                        var tenant = await serviceManager.GetService<ICompanyService>().GetByIdAsync(new object[] { item.TenantId });
                        if (tenant != null && user.DataBaseId!= tenant.DataBaseId)
                        {
                            user.DataBaseId = tenant.DataBaseId;
                        }
                    }
                    
                    await userService.UpdateAsync(user);
                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpPost]
        public async Task<IHttpActionResult> UpdatePassord([FromBody]UserDto item)
        {
            if (this.ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    var _userManager = UserManager;

                    var result = await _userManager.PasswordValidator.ValidateAsync(item.Password);
                    if (!result.Succeeded)
                        return BadRequest(result.GetErrors());

                    result = await _userManager.RemovePasswordAsync(item.Id);
                    if (!result.Succeeded)
                        return BadRequest(result.GetErrors());

                    result = await _userManager.AddPasswordAsync(item.Id, item.Password);
                    if (!result.Succeeded)
                        return BadRequest(result.GetErrors());

                    return Ok();
                }
            }
            return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            if (ModelState.IsValid)
            {
                using (var serviceManager = new Service(DataBaseId, UserId))
                {
                    var userService = serviceManager.GetService<IUserService>();

                    var user = await serviceManager.GetService<IUserService>().GetAll()
                                                .Include(x => x.UserProfile)
                                                .Include("UserCompanies.Company")
                                                .Include(x=>x.Roles)
                                                .Include(x=>x.LastUsedCompany)
                                                .Include(x => x.UserSessions)
                                                .Include(x => x.UserSubscriptions)
                                                .Include(x => x.DataBase).FirstOrDefaultAsync(x => x.Id == id);
                    if (user == null)
                        return NotFound();
                    if (user.DataBaseId.Value != serviceManager.DatabaseId.Value)
                    {
                        var tenantService = new Service(user.DataBaseId.Value, UserId).GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { user.Id.ToString() });
                        if (actor != null)
                            await tenantService.SetDeletedAsync(actor);
                    }
                    else
                    {
                        var tenantService = serviceManager.GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { user.Id.ToString() });
                        if (actor != null)
                            await tenantService.SetDeletedAsync(actor);
                    }
                    await userService.DeleteAsync(user);
                    return Ok();
                }
            }
            else
                return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        /// <summary>
        /// Looks up for roles based on api controller authorization
        /// </summary>
        /// <param name="options"> Client query options - odata protocol </param>
        /// <param name="userId"> User Id for query roles </param>
        /// <returns>Return all roles from application context</returns>
        [EnableQuery]
        [HttpGet]
        public IQueryable<RoleDto> GetRoles(ODataQueryOptions<RoleDto> options, string userId = null)
        {
            var results = options.ApplyTo(GetApplicationsRoles(userId).AsQueryable().Where(x=>x.Name != Tools.DefaultValues.ROLE_ROOT).OrderBy(x=>x.Name));
            return results as IQueryable<RoleDto>;
        }

        [ResponseType(typeof(RoleDto))]
        [OverrideAuthorization]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetCurentUserRoles()
        {
            var id = User.Identity.GetUserId();
            if (id == null)
                return NotFound();
            var results = await GetApplicationsRoles(User.Identity.GetUserId()).AsQueryable().ToListAsync();
            return Ok(results);
        }

        /// <summary>
        /// Set User Permisions
        /// </summary>
        /// <param name="Id">the Id of the user</param>
        /// <param name="roleIds">the list of Roles Id's separated by comma(,)</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> SetUserPermissions(string Id, [FromBody]string roleIds)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var user = await serviceManager.GetService<IUserService>().GetAll().Include(x => x.Roles).FirstOrDefaultAsync(x => x.Id == Id);
                if (user == null || user.UserName == Tools.DefaultValues.DEFAULT_USERINFO)
                    return NotFound();

                if (string.IsNullOrEmpty(roleIds))
                {
                    user.Roles.ToList().ForEach(x =>
                    {
                        user.Roles.Remove(x);
                    });
                }
                else
                {
                    var selRoleIds = roleIds.Split(',').Select(x => x).ToList();

                    user.Roles.ToList().ForEach(x =>
                    {
                        if (!selRoleIds.Any(t => t == x.RoleId))
                            user.Roles.Remove(x);
                    });

                    selRoleIds.ForEach(x =>
                    {
                        if (!user.Roles.Any(t => t.RoleId == x))
                            user.Roles.Add(new IdentityUserRole() { RoleId = x, UserId = user.Id });
                    });
                }
                serviceManager.GetService<IUserService>().Update(user);
                serviceManager.Commit();
                return Ok();
            }
        }

        /// <summary>
        /// Get all tenants databases itemes
        /// </summary>
        /// <param name="text"> Client query search tenants databases name by text </param>
        /// <param name="initialValue"> Client query search tenants databases name by id </param>
        /// <returns>Return all tenants databases from repository</returns>
        [Authorize(Roles = "Root")]
        public IList<DomainDataBaseDto> GetDataBases(string text, int? initialValue)
        {
            using (var serviceManager = new Service())
            {
                var result = serviceManager.GetService<IDomainDataBaseService>().GetAll();
                if (initialValue.HasValue && string.IsNullOrEmpty(text))//initial Edit Form Case
                    result = result.Where(p => p.Id == initialValue.Value);
                else if (!string.IsNullOrEmpty(text))//Normal Filter of Form
                    result = result.Where(x => x.ScreenName.ToLower().Contains(text.ToLower()))
                        .Take(100)
                        .OrderBy(o => o.ScreenName);
                else
                    result = result.Take(50).OrderByDescending(x => x.Id);
                return result.ToDtos().ToList().AsReadOnly();
            }
        }

        [Authorize(Roles = "Root")]
        public async Task<IHttpActionResult> SetTenant(string id)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var tenant = await serviceManager.GetService<ICompanyService>().GetByIdAsync(new object[] { id });
                if (tenant == null)
                    return NotFound();
                var usr = await serviceManager.GetService<IUserService>().GetByIdAsync(new object[] { UserId });
                usr.DataBaseId = tenant.DataBaseId;
                await serviceManager.CommitAsync();
                return Ok();
            }
        }

        #region Private Methods
        private IList<RoleDto> GetApplicationsRoles(string userId = null)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {
                var roleService = serviceManager.GetService<IRoleService>();
                var dbRoleNames = roleService.GetAll().ToList();

                var ctrlRoleNames = new List<string>() { Tools.DefaultValues.ROLE_ROOT };

                var q = from type in Assembly.GetExecutingAssembly().GetTypes()
                        where type.IsClass && type.IsSubclassOf(typeof(ApiController))
                        select type;
                //find all attributes in controllers
                foreach (Type type in q)
                {
                    var authorizeAttributes = type.GetCustomAttributes<AuthorizeAttribute>();
                    //find authorize attributes for controller class
                    foreach (var authorizeAttribute in authorizeAttributes)
                    {
                        if (authorizeAttribute != null)
                        {
                            var authArray = authorizeAttribute.Roles.Split(',');
                            foreach (var s in authArray)
                            {
                                if (!string.IsNullOrEmpty(s))
                                {
                                    if (!ctrlRoleNames.Contains(s.Trim()))
                                    {
                                        ctrlRoleNames.Add(s.Trim());
                                    }
                                }
                            }
                        }
                    }
                    //find authorize attributes for controller methods
                    foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Instance))
                    {
                        authorizeAttributes = method.GetCustomAttributes<AuthorizeAttribute>();
                        foreach (var authorizeAttribute in authorizeAttributes)
                        {
                            if (authorizeAttribute == null) continue;

                            var authArray = authorizeAttribute.Roles.Split(',');
                            foreach (var s in authArray)
                            {
                                if (!string.IsNullOrEmpty(s))
                                {
                                    if (!ctrlRoleNames.Contains(s.Trim()))
                                    {
                                        ctrlRoleNames.Add(s.Trim());
                                    }
                                }
                            }
                        }
                    }
                }
                //add all controller roles to a sorted list, if role not exist in system, create
                Role newRole = null;
                foreach (string name in ctrlRoleNames)
                {
                    if (!dbRoleNames.Any(x => x.Name.ToLower().Equals(name.ToLower())))
                    {
                        newRole = serviceManager.GetService<IRoleService>().Create();
                        newRole.Name = name;
                        newRole.Id = Guid.NewGuid().ToString();
                        serviceManager.GetService<IRoleService>().Add(newRole);
                        dbRoleNames.Add(newRole);
                    }
                }
                //remove roles from db, if are not any more in controllers roles
                var removedRoles = dbRoleNames.Where(x => !ctrlRoleNames.Contains(x.Name)).ToList();
                var userManager = new UserManager();
                if (removedRoles.Any())
                {
                    removedRoles.ForEach(x =>
                    {
                        //x.Users.ToList().RemoveRange(0, x.Users.Count);
                        dbRoleNames.Remove(x);
                        roleService.Delete(x);
                    });
                }
                serviceManager.Commit();
                if (string.IsNullOrEmpty(userId))
                {
                    if (User.IsInRole(Tools.DefaultValues.ROLE_ROOT))
                        return CoreMapper.ToDtos(dbRoleNames.OrderBy(x => x.Name)).ToList();
                    else
                        return CoreMapper.ToDtos(dbRoleNames.Where(x => x.Name != Tools.DefaultValues.ROLE_ROOT).OrderBy(x => x.Name)).ToList();
                }
                else
                {
                    var systemRoles = dbRoleNames.Select(x => new { x.Name, x.Id }).ToDictionary(t => t.Name, t => t.Id);

                    User _user = serviceManager.GetService<IUserService>().GetAll().Include(x => x.Roles).FirstOrDefault(x => x.Id == userId);
                    var userRoles = dbRoleNames.Where(x => _user.Roles.Select(t => t.RoleId).Contains(x.Id)).ToList();

                    var sortedList = new Dictionary<KeyValuePair<string, string>, RoleDto>();
                    foreach (var item in systemRoles)
                    {
                        sortedList.Add(item, new RoleDto() { Activated = false, Name = item.Key });
                    }

                    foreach (var userRole in userRoles)
                    {
                        var kvp = new KeyValuePair<string, string>(userRole.Name, userRole.Id);

                        if (sortedList.ContainsKey(kvp))
                        {
                            sortedList[kvp].Activated = true;
                        }
                    }
                    foreach (var dtoUserRol in sortedList)
                    {
                        var userRole = dtoUserRol.Key;
                        sortedList[userRole].Id = userRole.Value;
                        sortedList[userRole].RequestedUserName = _user.UserName;
                        if (userRole.Key.Contains("."))
                        {
                            var val = sortedList.Select(x => x.Key).FirstOrDefault(x => x.Key == userRole.Key.Split('.')[0]);
                            if (val.Key != null)
                            {
                                sortedList[val].HasChildren = true;
                                sortedList[userRole].Parent = userRole.Key.Split('.')[0];
                            }
                        }
                    }
                    List<RoleDto> inheracyRoles = new List<RoleDto>();
                    foreach (var dtoUserRol in sortedList.Values.Where(a => a.HasChildren || string.IsNullOrEmpty(a.Parent)))
                    {
                        dtoUserRol.Childs = sortedList.Values.Where(a => a.Parent == dtoUserRol.Name).ToList();
                        dtoUserRol.Activated = dtoUserRol.Childs.Any() && !dtoUserRol.Childs.Any(x => !x.Activated) ? true : dtoUserRol.Activated;
                        inheracyRoles.Add(dtoUserRol);
                    }
                    if (User.IsInRole(Tools.DefaultValues.ROLE_ROOT))
                        return inheracyRoles.ToList().AsReadOnly();
                    else
                        return inheracyRoles.Where(x => x.Name != Tools.DefaultValues.ROLE_ROOT).ToList().AsReadOnly();
                }
            }
        }
        #endregion
    }
}
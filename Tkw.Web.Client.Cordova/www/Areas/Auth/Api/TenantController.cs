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

namespace Web.Client.Net.Areas.Auth.Api
{
    [Authorize(Roles = Tools.DefaultValues.TENANT)]
    public class TenantController : BaseApiController
    {

        /// <summary>
        /// Return all the Building from the database with IsActive=true
        /// </summary>
        /// <returns></returns>

        [EnableQuery]
        [OverrideAuthorization]
        [Authorize]
        public async Task<IQueryable<CompanyDto>> GetAll(ODataQueryOptions<CompanyDto> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {

                var result = serviceManager.GetService<ICompanyService>().GetAll()
                                           .Where(a => a.Type == CompanyType.Tenant)
                                           .Where(a => a.IsActive)
                                           .Include(x=>x.Users)
                                           .Include(x => x.DataBase)
                                           .OrderBy(a => a.CreateDate);
                if (options.SelectExpand != null)
                {
                    Request.ODataProperties().SelectExpandClause = options.SelectExpand.SelectExpandClause;
                    return (await result.Select(a =>
                           new CompanyDto
                           {
                               Id = a.Id,
                               Name = a.Name,
                               Phone = a.Phone,
                               Address = a.Address,                               
                               Website = a.Website,
                               Email = a.Email,
                               UserName = a.Users.Any(t => t.Type == UserType.Tenant) ? a.Users.FirstOrDefault(t=>t.Type==UserType.Tenant).UserName:string.Empty,
                               City = a.City,
                               State = a.State,
                               Zip =a.Zip,
                               DataBase = a.DataBase != null ? a.DataBase.ScreenName.Replace("#", "") : string.Empty,
                               CreateDate = a.CreateDate
                           }).ToListAsync()).AsReadOnly().AsQueryable();
                }
                else
                    return options.ApplyTo((await result.Select(a =>
                           new CompanyDto
                           {
                               Id = a.Id,
                               Name = a.Name,
                               Phone = a.Phone,
                               Address = a.Address,
                               Website = a.Website,
                               UserName = a.Users.Any(t => t.Type == UserType.Tenant) ? a.Users.FirstOrDefault(t => t.Type == UserType.Tenant).UserName : string.Empty,
                               Email = a.Email,
                               City = a.City,
                               State = a.State,
                               Zip = a.Zip,
                               DataBase = a.DataBase != null ? a.DataBase.ScreenName.Replace("#", "") : string.Empty,
                               CreateDate = a.CreateDate
                           }).ToListAsync()).AsReadOnly().AsQueryable()) as IQueryable<CompanyDto>;
            }
        }

        /// <summary>
        /// Add a new building to the DB, with the dates from the given BuildingDto, and return the added building.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<TenantDto> Post([FromBody] TenantDto dto)
        {
            try
            {
                IHttpActionResult jsonOutput = null;
                using (var service = new Service())
                {
                    var user = await service.GetService<IUserService>().CreateTenantAsync(dto);
                    string error = string.Empty;
                    var emailService = service.GetService<IEmailService>();
                    var emailObj = emailService.GetEmailSettings(EmailType.ConfirmRegister);
                    emailObj.Message = emailObj.Message.Replace("userParam", user.UserName);
                    emailObj.Message = emailObj.Message.Replace("passParam", user.RawPassword);
                    bool emailSent = emailService.SendEmail(EmailType.ConfirmRegister, false, emailObj.SenderUserName, user.Email, null, null, emailObj.Subject, emailObj.Message, null, out error);
                    if (!emailSent)
                        throw new Exception(error);
                    return dto;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPut]
        public async Task<IHttpActionResult> Put(string id, [FromBody] TenantDto dto)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                if (ModelState.IsValid)
                {

                    var companyService = service.GetService<ICompanyService>();
                    var company = await companyService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
                    if (company == null)
                        return NotFound();
                    company.Name = dto.Name;
                    company.Phone = dto.Phone;
                    company.Address = dto.Address;
                    company.Website = dto.Website;
                    company.Email = dto.Email;
                    company.City = dto.City;
                    company.State = dto.State;
                    company.Zip = dto.Zip;
                    await companyService.UpdateAsync(company);

                    var userService = service.GetService<IUserService>();
                    var user = await userService.GetAll().FirstOrDefaultAsync(x => x.DataBaseId == company.DataBaseId && x.Type == UserType.Tenant);
                    bool newUser = false;
                    if (user == null && !string.IsNullOrEmpty(dto.UserName))
                    {
                        user = new User();
                        newUser = true;
                    }
                    if (user != null)
                    {
                        user.UserName = dto.UserName;
                        user.Email = dto.Email;
                        user.RawPassword = dto.RawPassword;
                        if (!newUser)
                            await userService.UpdateAsync(user);
                        else
                        {

                            user.Id = Guid.NewGuid().ToString();
                            user.UserProfile = new UserProfile() { IsActive = true };
                            user.Email = dto.Email;
                            user.UserName = dto.UserName;
                            user.Type = UserType.Tenant;
                            user.DataBaseId = company.DataBaseId;
                            user.LastUsedCompanyId = company.Id;
                            user.UserCompanies = new List<UserCompany>()
                            {
                              new UserCompany() { UserId= user.Id, CompanyId = company.Id}
                            };
                            await userService.AddAsync(user);
                            await UserManager.AddToRoleAsync(user.Id, Tools.DefaultValues.TENANT);
                            using (var service1 = new Service(user.DataBaseId.Value, user.Id))
                            {
                                var actor = new Actor()
                                {
                                    Id = user.Id,
                                    Type = ActorType.Tenant,
                                    Name = user.UserName,
                                };
                                await service1.GetService<IActorService>().AddAsync(actor);
                            }
                        }
                        if (!string.IsNullOrEmpty(dto.RawPassword))
                        {
                            await UserManager.RemovePasswordAsync(user.Id);
                            await UserManager.AddPasswordAsync(user.Id, dto.RawPassword);
                        }
                    }
                    return Ok();
                }
                else
                    return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
            }
        }

        [Authorize(Roles = DefaultValues.TENANT)]
        [HttpDelete]
        public async Task<IHttpActionResult> Delete(string id)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                if (ModelState.IsValid)
                {
                    var companyService = service.GetService<ICompanyService>();
                    var company = await companyService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == id);
                    if (company == null)
                        return NotFound();
                    await companyService.SetDeletedAsync(company);

                    if (company.DataBaseId.Value != service.DatabaseId.Value)
                    {
                        var tenantService = new Service(company.DataBaseId.Value, UserId).GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { company.Id.ToString() });
                        if (actor != null)
                            await tenantService.SetDeletedAsync(actor);
                    }
                    else
                    {
                        var tenantService = service.GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { company.Id.ToString() });
                        if (actor != null)
                            await tenantService.SetDeletedAsync(actor);
                    }
                    return Ok();
                }
                else
                    return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
            }
        }
    }
}

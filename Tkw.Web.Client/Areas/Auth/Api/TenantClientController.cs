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
   
    public class TenantClientController : BaseApiController
    {
        [EnableQuery]
        [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN)]
        public async Task<IQueryable<CompanyDto>> GetAll(ODataQueryOptions<CompanyDto> options)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {

                var result = serviceManager.GetService<ICompanyService>().GetAll()
                                           .Where(a => a.Type == CompanyType.Client)
                                           .Where(a=>a.IsActive)
                                           .Include(x=>x.DataBase)
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
                               City = a.City,
                               State = a.State,
                               Zip = a.Zip,
                               DataBase = a.DataBase!=null?a.DataBase.ScreenName.Replace("#",""):string.Empty,
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
                               Email = a.Email,
                               City = a.City,
                               State = a.State,
                               Zip = a.Zip,
                               DataBase = a.DataBase != null ? a.DataBase.ScreenName.Replace("#", "") : string.Empty,
                               CreateDate = a.CreateDate
                           }).ToListAsync()).AsReadOnly().AsQueryable()) as IQueryable<CompanyDto>;
            }
        }

        [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN)]
        public async Task<IQueryable<CompanyDto>> GetByTenantId(string tenantId)
        {
            using (var serviceManager = new Service(DataBaseId, UserId))
            {

                var result = await serviceManager.GetService<ICompanyService>().GetAll()
                                           .Where(a => a.Type == CompanyType.Tenant)
                                           .Where(a => a.IsActive)
                                           .Include(x => x.DataBase.Companies)
                                           .FirstOrDefaultAsync(z=>z.Id==tenantId);

                var response = result.DataBase.Companies.Where(x => x.IsActive == true).Where(x=>x.Type == CompanyType.Client);
                if (!User.IsInRole(DefaultValues.ROLE_ROOT) && !User.IsInRole(DefaultValues.TENANT))
                    response = response.Where(t => t.UserCompanies.Count(x => x.UserId == UserId) > 0);

                return (response.Select(a =>
                          new CompanyDto
                          {
                              Id = a.Id,
                              Name = a.Name,
                              Phone = a.Phone,
                              Address = a.Address,
                              Website = a.Website,
                              Email = a.Email,
                              City = a.City,
                              State = a.State,
                              Zip = a.Zip,
                              DataBase = a.DataBase != null ? a.DataBase.ScreenName.Replace("#", "") : string.Empty,
                              CreateDate = a.CreateDate
                          })).ToList().AsReadOnly().AsQueryable();
            }
        }

        [Authorize(Roles = DefaultValues.TENANT)]
        [HttpPost]
        public async Task<IHttpActionResult> Post([FromBody] CompanyDto dto)
        {
            if (this.ModelState.IsValid)
            {
                using (var service = new Service(DataBaseId, UserId))
                {
                    var item = await service.GetService<ICompanyService>().CreateCompanyAsync(dto);
                    if (item.DataBaseId.Value != service.DatabaseId.Value)
                        await new Service(item.DataBaseId.Value, UserId).GetService<IActorService>().CopyFromCompanyAsync(item, ActorType.Company);
                    else
                        await service.GetService<IActorService>().CopyFromCompanyAsync(item, ActorType.Company);
                    dto.Id = item.Id;
                    return Created<CompanyDto>(Request.RequestUri, dto);
                }
            }
            else
                return BadRequest(string.Join("; ", this.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.Exception != null ? x.Exception.Message : x.ErrorMessage)));
        }

        [Authorize(Roles = DefaultValues.TENANT + "," + DefaultValues.CLIENT_ADMIN)]
        [HttpPut]
        public async Task<IHttpActionResult> Put([FromBody] CompanyDto dto)
        {
            using (var service = new Service(DataBaseId, UserId))
            {
                if (ModelState.IsValid)
                {
                    var companyService = service.GetService<ICompanyService>();
                    var company = await companyService.GetAll().Where(a => a.IsActive).FirstOrDefaultAsync(a => a.Id == dto.Id);
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

                    if (company.DataBaseId.Value != service.DatabaseId.Value)
                    {
                        var tenantService = new Service(company.DataBaseId.Value, UserId).GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { company.Id.ToString() });
                        if (actor != null) 
                            actor.Name = company.Name;
                        await tenantService.UpdateAsync(actor);
                    }
                    else
                    {
                        var tenantService = service.GetService<IActorService>();
                        var actor = await tenantService.GetByIdAsync(new string[] { company.Id.ToString() });
                        if (actor != null)
                        {
                            actor.Name = company.Name;
                            await tenantService.UpdateAsync(actor);
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
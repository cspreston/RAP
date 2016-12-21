namespace Core
{
    using System;
    using System.Threading.Tasks;
    using BusinessObjects;
    using Common;
    using Common.Core;
    using System.Linq;
    using System.Data.Entity;
    using Common.Domain;
    using System.Threading;

    public partial class CompanyService : TkwService<Company>, ICompanyService
    {
        public CompanyService(IRepository<Company> repository, Service service)
            : base(repository, service) { }

        public override IQueryable<Company> GetAll()
        {
            if (Thread.CurrentPrincipal.IsInRole(Tools.DefaultValues.ROLE_ROOT))
                return base.GetAll();
            else
            {

                if (Thread.CurrentPrincipal.IsInRole(Tools.DefaultValues.TENANT))
                    return base.GetAll().Where(x => x.DataBaseId == _service.DatabaseId);
                else
                {
                    return base.GetAll().Where(x => x.DataBaseId == _service.DatabaseId).Where(t => t.UserCompanies.Count(v => v.UserId == _service.UserId) > 0);
                }
            }
        }
        public async Task<Company> CreateCompanyAsync(CompanyDto dto)
        {
            var item = _repository.Create();
            item.Id = Guid.NewGuid().ToString();
            item.Name = dto.Name;
            item.Phone = dto.Phone;
            item.Address = dto.Address;
            item.Website = dto.Website;
            item.Email = dto.Email;
            item.City = dto.City;
            item.State = dto.State;
            item.Zip = dto.Zip;
            item.IsActive = true;
            item.Type = CompanyType.Client;
            if (IsRoot() && !string.IsNullOrEmpty(dto.TenantId))
            {
                var tenant = await _repository.GetAll().FirstOrDefaultAsync(x => x.Id == dto.TenantId);
                if (tenant != null)
                    item.DataBaseId = tenant.DataBaseId;
            }
            item.DataBaseId = item.DataBaseId ?? _service.DatabaseId;
            //TO DO
            //ADD CLEINT INTO TENANT CONTEXT
            await _repository.AddAsync(item);
            return item;
        }
    }
}

namespace Domain
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class ActorService : TkwService<Actor>, IActorService
    {
        public ActorService(IRepository<Actor> repository, Service service)
            : base(repository, service) { }

        public async Task<Actor> CopyFromCompanyAsync(Company company, ActorType type)
        {
            var item = _repository.Create();
            item.Id = company.Id.ToString();
            item.Name = company.Name;
            item.Type = type;
            item.IsActive = true;
            await _repository.AddAsync(item);
            return item;
        }

        public IQueryable<Actor> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x=> x.IsActive== isActive);
        }
    }
}
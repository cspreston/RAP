namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class ClientService : TkwService<Client>, IClientService
    {
        public ClientService(IRepository<Client> repository, Service service)
            : base(repository, service)
        { }


        public IQueryable<Client> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}

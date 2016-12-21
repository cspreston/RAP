namespace Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class DomainAddressService : TkwService<DomainAddress>, IDomainAddressService
    {
        public DomainAddressService(IRepository<DomainAddress> repository, Service service)
            : base(repository, service) { }

        
    }
}

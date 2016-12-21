namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class DomainDataBaseService : TkwService<DomainDataBase>, IDomainDataBaseService
    {
        public DomainDataBaseService(IRepository<DomainDataBase> repository, Service service)
            : base(repository, service) { }
    }
}

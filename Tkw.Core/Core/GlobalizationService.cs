namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class GlobalizationService : TkwService<Globalization>, IGlobalizationService
    {
        public GlobalizationService(IRepository<Globalization> repository, Service service)
            : base(repository, service) { }
    }
}
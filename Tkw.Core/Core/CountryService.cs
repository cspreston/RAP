namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class CountryService : TkwService<Country>, ICountryService
    {
        public CountryService(IRepository<Country> repository, Service service)
            : base(repository, service) { }
    }
}
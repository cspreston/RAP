namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class UserCompanyService : TkwService<UserCompany>, IUserCompanyService
    {
        public UserCompanyService(IRepository<UserCompany> repository, Service service)
            : base(repository, service) { }
    }
}

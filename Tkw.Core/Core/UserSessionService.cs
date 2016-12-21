namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class UserSessionService: TkwService<UserSession>, IUserSessionService
    {
        public UserSessionService(IRepository<UserSession> repository, Service service)
            : base(repository, service) { }
    }
}
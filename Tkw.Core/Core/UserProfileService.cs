namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class UserProfileService : TkwService<UserProfile>, IUserProfileService
    {
        public UserProfileService(IRepository<UserProfile> repository, Service service)
            : base(repository, service) { }
    }
}
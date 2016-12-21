namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class UserSubscriptionService : TkwService<UserSubscription>, IUserSubscriptionService
    {
        public UserSubscriptionService(IRepository<UserSubscription> repository, Service service)
            : base(repository, service) { }
    }
}
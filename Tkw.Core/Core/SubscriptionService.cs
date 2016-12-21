namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class SubscriptionService : TkwService<Subscription>, ISubscriptionService
    {
        public SubscriptionService(IRepository<Subscription> repository, Service service)
            : base(repository, service) { }
    }
}
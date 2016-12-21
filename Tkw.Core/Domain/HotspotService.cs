namespace Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using Common;
    using Common.Domain;
    using System.Linq;

    public partial class HotspotService : TkwService<Hotspot>, IHotspotService
    {
        public HotspotService(IRepository<Hotspot> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<Hotspot> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}

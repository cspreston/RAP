namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class HotspotDisplayTypeService : TkwService<HotspotDisplayType>, IHotspotDisplayTypeService
    {
        public HotspotDisplayTypeService(IRepository<HotspotDisplayType> repository, Service service)
            : base(repository, service) { }

        
        public IQueryable<HotspotDisplayType> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x=> x.IsActive== isActive);
        }
    }
}
namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class HotspotActionTypeService : TkwService<HotspotActionType>, IHotspotActionTypeService
    {
        public HotspotActionTypeService(IRepository<HotspotActionType> repository, Service service)
            : base(repository, service) { }

        
        public IQueryable<HotspotActionType> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x=> x.IsActive== isActive);
        }
    }
}
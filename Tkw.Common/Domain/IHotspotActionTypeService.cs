namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IHotspotActionTypeService : ITKWService<HotspotActionType>
    {
        IQueryable<HotspotActionType> GetAll(bool isActive = true);
    }
}
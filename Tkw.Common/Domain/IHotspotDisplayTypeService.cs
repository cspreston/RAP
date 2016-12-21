namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IHotspotDisplayTypeService : ITKWService<HotspotDisplayType>
    {
        IQueryable<HotspotDisplayType> GetAll(bool isActive = true);
    }
}
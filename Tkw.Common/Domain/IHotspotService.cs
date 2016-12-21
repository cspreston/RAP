namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IHotspotService : ITKWService<Hotspot>
    {
        IQueryable<Hotspot> GetAll(bool isActive = true);
    }
}

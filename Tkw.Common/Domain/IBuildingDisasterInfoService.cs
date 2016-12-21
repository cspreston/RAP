namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IBuildingDisasterInfoService : ITKWService<BuildingDisasterInfo>
    {
        IQueryable<BuildingDisasterInfo> GetAll(bool isActive = true);
    }
}
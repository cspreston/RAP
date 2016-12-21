namespace Common.Domain
{
    using BusinessObjects;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public interface IBuildingService : ITKWService<Building>
    {
        IQueryable<Building> GetAll(bool isActive);

        Task<Building> CloneAsync(BuildingDto item);
        List<FileBuckets> CreateSiteFileBucket(string tenantName, string bldId);
    }
}

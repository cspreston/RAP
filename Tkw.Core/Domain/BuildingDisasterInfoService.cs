namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class BuildingDisasterInfoService : TkwService<BuildingDisasterInfo>, IBuildingDisasterInfoService
    {
        public BuildingDisasterInfoService(IRepository<BuildingDisasterInfo> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<BuildingDisasterInfo> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}

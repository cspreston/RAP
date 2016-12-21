namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class BuildingImageService : TkwService<BuildingImage>, IBuildingImageService
    {
        public BuildingImageService(IRepository<BuildingImage> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<BuildingImage> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}

namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class BuildingFileService : TkwService<BuildingFile>, IBuildingFileService
    {
        public BuildingFileService(IRepository<BuildingFile> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<BuildingFile> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}
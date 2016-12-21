namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class BuildingPlanService : TkwService<BuildingPlan>, IBuildingPlanService
    {
        public BuildingPlanService(IRepository<BuildingPlan> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<BuildingPlan> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }
    }
}

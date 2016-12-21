namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IBuildingPlanService : ITKWService<BuildingPlan>
    {
        IQueryable<BuildingPlan> GetAll(bool isActive = true);
    }
}

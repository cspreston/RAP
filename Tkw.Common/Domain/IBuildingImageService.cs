namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IBuildingImageService : ITKWService<BuildingImage>
    {
        IQueryable<BuildingImage> GetAll(bool isActive = true);
    }
}

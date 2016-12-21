namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IBuildingFileService : ITKWService<BuildingFile>
    {
        IQueryable<BuildingFile> GetAll(bool isActive = true);
    }
}

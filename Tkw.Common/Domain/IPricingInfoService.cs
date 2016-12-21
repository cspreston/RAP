namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;
    using System.Threading.Tasks;
    using System.IO;

    public interface IPricingInfoService : ITKWService<PricingInfo>
    {
        IQueryable<PricingInfo> GetAll(bool isActive = true);

        Task<IList<PricingInfoDto>> ImportFromFile(string buildingId, string filePath);
    }
}
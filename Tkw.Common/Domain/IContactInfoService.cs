namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;
    using System.Threading.Tasks;

    public interface IContactInfoService : ITKWService<ContactInfo>
    {
        IQueryable<ContactInfo> GetAll(bool isActive = true);
        Task<IList<ContactInfoDto>> ImportFromFile(string buildingId, string destinationPath);
    }
}
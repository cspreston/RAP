namespace Common.Core
{
    using BusinessObjects;
    using System.Threading.Tasks;

    public interface ICompanyService : ITKWService<Company>
    {
        Task<Company> CreateCompanyAsync(CompanyDto dto);
    }
}

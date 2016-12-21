namespace Common.Core
{
    using System.Linq;
    using BusinessObjects;
    using System.Threading.Tasks;

    public interface IUserService : ITKWService<User>
    {
        Task<UserDto> CreateTenantAsync(TenantDto item, string password = null);
        Task<UserDto> CreateUserAsync(UserDto item, string password = null);
    }
}
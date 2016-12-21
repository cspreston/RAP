namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class RoleService : TkwService<Role>, IRoleService
    {
        public RoleService(IRepository<Role> repository, Service service)
            : base(repository, service) { }
    }
}
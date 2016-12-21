namespace Common
{
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin;
    using System.Data.Entity;
    using System.Security.Claims;
    using System.Threading.Tasks;
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class RoleManager : RoleManager<Role>
    {
        public RoleManager()
            : base(new RoleStore<Role>(RepositoryFactory.GetContext(Service.MasterDatabaseNameSpace) as DbContext))
        {
        }

        public RoleManager(IRoleStore<Role> store)
            : base(store)
        {
        }
    }
}
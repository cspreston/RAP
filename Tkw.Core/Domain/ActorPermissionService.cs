namespace Domain
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class ActorPermissionService : TkwService<ActorPermission>, IActorPermissionService
    {
        public ActorPermissionService(IRepository<ActorPermission> repository, Service service)
            : base(repository, service) { }
    }
}

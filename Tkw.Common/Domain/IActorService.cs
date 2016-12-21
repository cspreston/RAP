namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;
    using System.Threading.Tasks;

    public interface IActorService : ITKWService<Actor>
    {
        IQueryable<Actor> GetAll(bool isActive = true);
        Task<Actor> CopyFromCompanyAsync(Company company, ActorType type);
    }
}

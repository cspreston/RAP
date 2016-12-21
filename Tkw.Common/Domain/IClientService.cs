namespace Common.Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using System.Linq;

    public interface IClientService : ITKWService<Client>
    {
        IQueryable<Client> GetAll(bool isActive = true);
    }
}

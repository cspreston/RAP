namespace Common
{
    using System;
    using System.Data.Entity;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IRepositoryContext : IDisposable
    {
        DbSet<T> Set<T>() where T : class;
        String Provider { get; }
        void Commit();
        void Rollback();
        Task CommitAsync();
    }
}

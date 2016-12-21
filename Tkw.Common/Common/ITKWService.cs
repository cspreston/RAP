namespace Common
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading.Tasks;

    public interface ITKWService<T> : IDisposable
    {
        T Create();

        T GetById(int id);
        Task<T> GetByIdAsync(int id); 

        T GetById(object[] values);
        Task<T> GetByIdAsync(object[] values);

        IQueryable<T> GetAll();

        List<T> GetAllOrSetCache(int intervalInMinutes = 60);

        Task<List<T>> GetAllOrSetCacheAsync(int intervalInMinutes = 60);

        IQueryable<T> SearchFor(Expression<Func<T, bool>> predicate);

        void Add(T item);
        Task AddAsync(T item); 

        void Update(T item);
        Task UpdateAsync(T item);

        void Delete(T item);
        Task DeleteAsync(T item);

        void BulkInsert(List<T> items);
        Task BulkInsertAsync(List<T> items);

        void AddOrUpdate(Expression<Func<T, object>> identifierExpression, List<T> items);
        Task AddOrUpdateAsync(Expression<Func<T, object>> identifierExpression, List<T> items);

        void BulkDelete(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null);
        Task BulkDeleteAsync(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null);

        void SetDeleted(T item);

        Task SetDeletedAsync(T item);

        IQueryable<T> GetFromSqlQuery(string SQLQuery);
        IQueryable<int> GetSeqSqlQuery(string SQLQuery);
        IQueryable<T> SelectQuery(string query, params object[] parameters);
    }
}

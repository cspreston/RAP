namespace Common
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading.Tasks;
    using System.Web;
    using System.Data.Entity;
    using System.Web.Caching;

    public abstract class TkwService<T> : BaseService<T>, ITKWService<T> where T : class
    {
        #region Constructor
        public TkwService(IRepository<T> repository, Service service)
            : base(repository, service) { }
        #endregion

        #region Operations
        public virtual T Create()
        {
            return this._repository.Create();
        }

        public virtual T GetById(int id)
        {
            return this._repository.GetById(id);
        }
        
        public virtual async Task<T> GetByIdAsync(int id)
        {
            return await this._repository.GetByIdAsync(id);
        }

        public virtual T GetById(object[] values)
        {
            return this._repository.GetById(values);
        }
        
        public virtual async Task<T> GetByIdAsync(object[] values)
        {
            return await this._repository.GetByIdAsync(values);
        }

        public virtual IQueryable<T> GetAll()
        {
            return this._repository.GetAll();
        }
        public List<T> GetAllOrSetCache(int intervalInMinutes = 60)
        {
            var cache = HttpRuntime.Cache;
            var key = typeof(T).FullName;
            var result = cache[key];
            if (result == null)
            {
                result = GetAll();
                cache.Insert(key, result, null, DateTime.UtcNow.AddMinutes(intervalInMinutes), Cache.NoSlidingExpiration);
            }
            return (List<T>)result;
        }

        public virtual async Task<List<T>> GetAllOrSetCacheAsync(int intervalInMinutes = 60)
        {
            var cache = HttpRuntime.Cache;
            var key = typeof(T).FullName;
            var result = cache[key];
            if (result == null)
            {
                result = await GetAll().ToListAsync();
                cache.Insert(key, result, null, DateTime.UtcNow.AddMinutes(intervalInMinutes), Cache.NoSlidingExpiration);
            }
            return (List<T>)result;
        }

        public virtual IQueryable<T> SearchFor(Expression<System.Func<T, bool>> predicate)
        {
            return this._repository.SearchFor(predicate);
        }

        public virtual void Add(T item)
        {
            this._repository.Add(item);
        }
        
        public virtual async Task AddAsync(T item)
        {
            await this._repository.AddAsync(item);
        }

        public virtual void Update(T item)
        {
            this._repository.Update(item);
        }
        
        public virtual async Task UpdateAsync(T item)
        {
            await this._repository.UpdateAsync(item);
        }

        public virtual void Delete(T item)
        {
            this._repository.Delete(item);
        }
        
        public virtual async Task DeleteAsync(T item)
        {
            await this._repository.DeleteAsync(item);
        }

        public virtual void SetDeleted(T item)
        {
            this._repository.SetDeleted(item);
        }

        public virtual async Task SetDeletedAsync(T item)
        {
            await this._repository.SetDeletedAsync(item);
        }

        public virtual void BulkInsert(List<T> items)
        {
            this._repository.BulkInsert(items);
        }
        public virtual async Task BulkInsertAsync(List<T> items)
        {
            await this._repository.BulkInsertAsync(items);
        }

        public virtual void AddOrUpdate(Expression<Func<T, object>> identifierExpression, List<T> items)
        {
            this._repository.AddOrUpdate(identifierExpression, items);
        }
        public virtual async Task AddOrUpdateAsync(Expression<Func<T, object>> identifierExpression, List<T> items)
        {
            await this._repository.AddOrUpdateAsync(identifierExpression, items);
        }

        public virtual void BulkDelete(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null)
        {
            this._repository.BulkDelete(items, identifierExpression);
        }
        public virtual async Task BulkDeleteAsync(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null)
        {
            await this._repository.BulkDeleteAsync(items, identifierExpression);
        }



        public virtual IQueryable<T> GetFromSqlQuery(string SQLQuery)
        {
            return this._repository.GetFromSqlQuery(SQLQuery);
        }
        
        public virtual IQueryable<int> GetSeqSqlQuery(string SQLQuery)
        {
            return this._repository.GetSeqSqlQuery(SQLQuery);
        }
       
        public virtual IQueryable<T> SelectQuery(string query, params object[] parameters)
        {
            return this._repository.SelectQuery(query, parameters);
        }
        #endregion

        #region Methods
        public bool IsRoot()
        {
            using (var helper = new Tools.Helper())
            {
                return helper.IsRoot();
            }
        }
        public bool IsCompanyAdministrator()
        {
            using (var helper = new Tools.Helper())
            {
                return helper.IsCompanyAdministrator();
            }
        }

        #endregion

        #region Dispose
        public void Dispose()
        {
        }
        #endregion
    }
}
namespace Common
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Linq.Expressions;
    using System.Threading.Tasks;

    /// <summary>
    /// Defines a generalized type-specific repository for
    /// access data store
    /// </summary>
    /// <typeparam name="T">The model type</typeparam>
    public interface IRepository<T>  where T : class
    {
        /// <summary>
        /// Gets a value indicating the name of the repository provider used
        /// </summary>
        String Provider { get; }

        /// <summary>
        /// Gets a DbContext value that is currently used by the repository class
        /// </summary>
        IRepositoryContext Context { get; }

        /// <summary>
        /// Creates a new model item
        /// </summary>
        /// <returns>New instance of the item</returns>
        T Create();

        /// <summary>
        /// Gets the model item by Id.
        /// Should be used if is needed only the model, without the related entities
        /// </summary>
        /// <param name="id">id of model item</param>
        ///<returns>Return the model, related entities are not loaded</returns>
        T GetById(int id);

        Task<T> GetByIdAsync(int id);

        /// <summary>
        /// Gets the model item by values.
        /// Should be used if is needed only the model, without the related entities
        /// </summary>
        /// <param name="values">key values</param>
        ///<returns>Return the model, related entities are not loaded</returns>
        T GetById(object[] values);

        Task<T> GetByIdAsync(object[] values);

        /// <summary>
        /// Gets the IQueryable value for query the model type.
        /// </summary>
        /// <returns>IQueryable value</returns>
        IQueryable<T> GetAll();

        IQueryable<T> SearchFor(Expression<Func<T, bool>> predicate); 

        /// <summary>
        /// Adds to the repository the new model item
        /// </summary>
        /// <param name="item">Item to be added to the repository</param>
        void Add(T item);

        Task AddAsync(T item); 

        /// <summary>
        /// Update a new model item
        /// </summary>
        /// <returns>Item to be added to the repository</returns>
        void Update(T item);

        Task UpdateAsync(T item);

        /// <summary>
        /// Delete a model item from the repository
        /// </summary>
        /// <param name="item">Item to be deleted from the repository</param>
        void Delete(T item);

        /// <summary>
        /// Set active property for a model item from  repository as false
        /// </summary>
        /// <param name="item">Item to be seted as deleted from repository</param>
        void SetDeleted(T item);

        Task SetDeletedAsync(T item);

        Task DeleteAsync(T item); 

        /// <summary>
        ///   Gets the IQueryable value from a nativ sql query the model type.
        /// </summary>
        /// <param name="nativeSQLQuery"> string as valid sql syntax </param>
        /// <returns>IQueryable value</returns>
        IQueryable<T> GetFromSqlQuery(string SQLQuery);

        /// <summary>
        ///   Gets the IQueryable value from a nativ sql query the model type.
        /// </summary>
        /// <param name="nativeSQLQuery"> string as valid sql syntax </param>
        /// <returns>IQueryable value</returns>
        IQueryable<int> GetSeqSqlQuery(string SQLQuery);

        IQueryable<T> SelectQuery(string query, params object[] parameters);

        void BulkDelete(List<T> items, Expression<Func<T, bool>> identifierExpression = null);
        Task BulkDeleteAsync(List<T> items, Expression<Func<T, bool>> identifierExpression = null);

        void BulkInsert(List<T> items);
        Task BulkInsertAsync(List<T> items);

        void AddOrUpdate(Expression<Func<T, object>> identifierExpression, List<T> items);
        Task AddOrUpdateAsync(Expression<Func<T, object>> identifierExpression, List<T> items);
    }
}
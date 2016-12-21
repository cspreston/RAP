namespace Repository.Sql
{
    using System;
    using System.Data.Entity;
    using System.Linq;
    using System.Threading.Tasks;
    using Common;
    using System.Data.Entity.Validation;
    using System.Threading;
    using System.Collections.Generic;
    using System.Linq.Expressions;
    using EntityFramework.Extensions;
    using EntityFramework.BulkInsert.Extensions;
    using System.Data.Entity.Migrations;

    public class Repository<T> : IRepository<T> where T : class
    {
        #region Variables
        private DbContext _context;
        private readonly DbSet<T> _dbSet;
        #endregion

        #region Properties
        public string Provider
        {
            get { return "System.Data.SqlClient"; }
        }

        IRepositoryContext IRepository<T>.Context
        {
            get { return (IRepositoryContext)this._context; }
        }

        private string _userId;

        public string UserId
        {
            get
            {
                if (string.IsNullOrEmpty(_userId))
                {
                    using (var helper = new Tools.Helper())
                        _userId = helper.GetUserId();
                }
                return _userId;
            }
            set
            {
                _userId = value;
            }
        }
        #endregion

        #region Constructor
        public Repository(IRepositoryContext context)
        {
            this._context = context as DbContext;
            if (this._context == null)
            {
                throw new ArgumentException("Context is not valid", "context");
            }
            _dbSet = context.Set<T>();
        }
        #endregion

        #region Methods
        public T Create()
        {
            return this._dbSet.Create();
        }

        public virtual T GetById(int id)
        {
            T t = _context.Set<T>().Find(id);
            _context.Entry<T>(t).Reload();
            return t;
        }
        public async Task<T> GetByIdAsync(int id)
        {
            return await this._dbSet.FindAsync(id);
        }
        public virtual T GetById(object[] values)
        {
            T t = this._dbSet.Find(values);
            this._context.Entry<T>(t).Reload();
            return t;
        }
        public async Task<T> GetByIdAsync(object[] values)
        {
            return await this._dbSet.FindAsync(values);
        }

        public IQueryable<T> GetAll()
        {
            return this._dbSet.AsQueryable();
        }
        public IQueryable<T> SearchFor(System.Linq.Expressions.Expression<Func<T, bool>> predicate)
        {
            return this._dbSet.Where(predicate);
        }

        public void Add(T item)
        {
            this._dbSet.Add(item);
        }
        public async Task AddAsync(T item)
        {
            this._dbSet.Add(item);
            await this.CommitAsync();
        }

        public void Update(T item)
        {
            this._dbSet.Attach(item);
            this._context.Entry(item).State = EntityState.Modified;
        }
        public async Task UpdateAsync(T item)
        {
            this._dbSet.Attach(item);
            this._context.Entry(item).State = EntityState.Modified;
            await this.CommitAsync();
        }

        public void Delete(T item)
        {
            this._dbSet.Remove(item);
        }
        public async Task DeleteAsync(T item)
        {
            this._dbSet.Remove(item);
            await this.CommitAsync();
        }

        public void SetDeleted(T item)
        {
            this._context.Entry(item).State = EntityState.Deleted;
        }

        public async Task SetDeletedAsync(T item)
        {
            this._context.Entry(item).State = EntityState.Deleted;
            await this.CommitAsync();
        }
        public void BulkInsert(List<T> items)
        {
            this._context.Database.CommandTimeout = 1200;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
            this._context.BulkInsert(items);
        }
        public async Task BulkInsertAsync(List<T> items)
        {
            this._context.Database.CommandTimeout = 1200;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
          
            this._context.BulkInsert(items);
            await this.CommitAsync();
        }

        public void AddOrUpdate(Expression<Func<T, object>> identifierExpression, List<T> items)
        {
            this._context.Database.CommandTimeout = 1200;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
            this._dbSet.AddOrUpdate(identifierExpression, items.ToArray());
        }
        public async Task AddOrUpdateAsync(Expression<Func<T, object>> identifierExpression, List<T> items)
        {
            this._context.Database.CommandTimeout = 1200;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
            this._dbSet.AddOrUpdate(identifierExpression, items.ToArray());
            await this.CommitAsync();
        }

        public void BulkDelete(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null)
        {
            this._context.Database.CommandTimeout = 600;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
            if (items != null && items.Any())
                this._dbSet.RemoveRange(items);
            else if (identifierExpression == null)
                this._dbSet.Delete();
            else
                this._dbSet.Where(identifierExpression).Delete();
        }
        public async Task BulkDeleteAsync(List<T> items = null, Expression<Func<T, bool>> identifierExpression = null)
        {
            this._context.Database.CommandTimeout = 1200;
            this._context.Configuration.AutoDetectChangesEnabled = false;
            this._context.Configuration.ValidateOnSaveEnabled = false;
            if (items != null && items.Any())
                this._dbSet.RemoveRange(items);
            else if (identifierExpression == null)
                await this._dbSet.DeleteAsync();
            else
                await this._dbSet.Where(identifierExpression).DeleteAsync();
            await this.CommitAsync();
        }


        public IQueryable<T> GetFromSqlQuery(string SQLQuery)
        {
            return this._context.Database.SqlQuery<T>(SQLQuery).AsQueryable();
        }
        public IQueryable<int> GetSeqSqlQuery(string SQLQuery)
        {
            return this._context.Database.SqlQuery<int>(SQLQuery).AsQueryable();
        }
        public IQueryable<T> SelectQuery(string query, params object[] parameters)
        {
            return _dbSet.SqlQuery(query, parameters).AsQueryable();
        }

        public void Commit()
        {
            foreach (var dbEntityEntry in this._context.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                            .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);
            this._context.SaveChanges();
        }
        public async Task CommitAsync()
        {
            foreach (var dbEntityEntry in this._context.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                             .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);
            try
            {
                await this._context.SaveChangesAsync();
            }
            catch(DbEntityValidationException ex)
            {

                string result = "";
                foreach (var eve in ex.EntityValidationErrors)
                {
                    foreach (var ve in eve.ValidationErrors)
                    {
                        result += ($"Error: {ve.PropertyName} {ve.ErrorMessage}, ");
                    }
                }
                throw new Exception(result);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public Task CommitAsync(CancellationToken cancellationToken)
        {
            foreach (var dbEntityEntry in this._context.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                              .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);
            return this._context.SaveChangesAsync(cancellationToken);
        }

        private void UpdateBaseDateValues(BusinessObjects.BaseDate entity, EntityState state)
        {
            if (state == EntityState.Added && !entity.InactiveDate.HasValue)
            {
                entity.CreateDate = !entity.CreateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.CreateDate.Value.ToUniversalTime();
                entity.UpdateDate = !entity.UpdateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.UpdateDate.Value.ToUniversalTime();
                entity.CreatedBy = string.IsNullOrEmpty(entity.CreatedBy) ? UserId : entity.CreatedBy;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
                entity.IsActive = true;
            }
            if (state == EntityState.Modified && !entity.InactiveDate.HasValue)
            {
                entity.UpdateDate = !entity.UpdateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.UpdateDate.Value;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
            }
            if (state == EntityState.Deleted)
            {
                if (!entity.GetType().Name.ToLower().Contains("user"))
                {
                    this._context.Entry(entity).State = EntityState.Modified;
                    this._context.Entry(entity).Reload();
                    entity.InactiveDate = DateTime.Now.ToUniversalTime();
                    entity.IsActive = false;
                    entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
                }
            }
        }
        #endregion
    }
}
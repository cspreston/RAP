namespace Common
{
    using System;
    using System.Linq;
    using System.Collections.Generic;
    using System.Configuration;
    using Microsoft.Practices.Unity;
    using Microsoft.Practices.Unity.Configuration;
    using Common;
    using System.Data.Entity;
    using System.Threading.Tasks;
    using System.Threading;
    using System.Security.Claims;
    
    public class Service : IDisposable
    {
        public const string MasterDatabaseNameSpace = "Common.Core";
        public const string IndependentNameSpace = "Common.Independent";

        private Dictionary<String, object> _managersPool;
        private Dictionary<String, IRepositoryContext> _repositoryContextPool;
        private static Dictionary<int, string> _connectionStringDatabaseId = new Dictionary<int, string>();
        private readonly string _userId;
        private readonly Nullable<int> _databaseId;
        private String _connectionString;

        #region Properties
        public string UserId
        {
            get
            {
                return this._userId;
            }
        }

        public Nullable<int> DatabaseId
        {
            get
            {
                return this._databaseId;
            }
        }
        #endregion

        #region Constructors
        public Service()
        {
            this._managersPool = new Dictionary<String, object>();
            this._repositoryContextPool = new Dictionary<string, IRepositoryContext>();
            this._userId = string.Empty;
            this._repositoryContextPool.Add(MasterDatabaseNameSpace, RepositoryFactory.GetContext(MasterDatabaseNameSpace));
        }

        public Service(int databaseId, string userId)
            : this()
        {
            this._userId = userId;
            this._databaseId = databaseId;
            this._connectionString = GetConnectionStringForChild(databaseId);
        }
        #endregion

        #region Methods
        public void Commit()
        {
            foreach (IRepositoryContext context in this._repositoryContextPool.Values)
            {
                try
                {
                    context.Commit();
                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }
        }

        public async Task CommitAsync()
        {
            foreach (IRepositoryContext context in this._repositoryContextPool.Values)
            {
                await context.CommitAsync();
            }
        }

        public void Rollback()
        {
            foreach (IRepositoryContext context in this._repositoryContextPool.Values)
            {
                context.Rollback();
            }
        }

        public T GetService<T>() where T : class
        {
            Type serviceType = typeof(T);
            T _service;
            if (this._managersPool.ContainsKey(serviceType.FullName))
            {
                _service = this._managersPool[serviceType.FullName] as T;
            }
            else
            {
                IUnityContainer container = new UnityContainer();
                var section = (UnityConfigurationSection)ConfigurationManager.GetSection("unity");
                section.Configure(container, serviceType.Namespace);
                if (serviceType.Namespace != IndependentNameSpace)
                {
                    IRepositoryContext context;
                    if (this._repositoryContextPool.ContainsKey(serviceType.Namespace))
                    {
                        context = this._repositoryContextPool[serviceType.Namespace];
                    }
                    else
                    {
                        context = RepositoryFactory.GetContext(serviceType.Namespace, this._connectionString);
                        this._repositoryContextPool.Add(serviceType.Namespace, context);
                    }
                    container.RegisterInstance<IRepositoryContext>(context);
                }
                container.RegisterInstance<Service>(this);
                _service = container.Resolve<T>();
                this._managersPool.Add(serviceType.FullName, _service);
            }
            return _service;
        }

        private static object lockGetConnectionStringForChild = new object();
        private String GetConnectionStringForChild(int databaseId)
        {
            string connectionString = string.Empty;
            lock (lockGetConnectionStringForChild)
            {
                if (!_connectionStringDatabaseId.ContainsKey(databaseId))
                {
                    BusinessObjects.DomainDataBase db = this.GetService<Common.Core.IDomainDataBaseService>().GetAll().FirstOrDefault(x => x.Id == databaseId);
                    if (db != null)
                    {
                        if (!_connectionStringDatabaseId.ContainsKey(db.Id))
                        {
                            connectionString = Tools.Encryption.Crypto.ActionDecrypt(db.ConnectionString);
                            _connectionStringDatabaseId.Add(databaseId, connectionString);
                        }
                        else
                        {
                            connectionString = _connectionStringDatabaseId[db.Id];
                        }
                    }
                }
                else
                {
                    connectionString = _connectionStringDatabaseId[databaseId];
                }
            }
            return connectionString;
        }
        #endregion

        #region IDisposable

        /// <summary>
        /// Releases all resources used
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Releases all resources used 
        /// </summary>
        /// <param name="disposing">A boolean value indicating whether or not to dispose managed resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                foreach (IRepositoryContext context in this._repositoryContextPool.Values)
                {
                    context.Dispose();
                }
            }
        }
        #endregion
    }
}

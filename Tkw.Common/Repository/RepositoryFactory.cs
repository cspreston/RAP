namespace Common
{
    using Microsoft.Practices.Unity;
    using Microsoft.Practices.Unity.Configuration;
    using System;
    using System.Configuration;
    using System.Data.Common;
    using System.Xml;

    internal abstract class RepositoryFactory
    {
        private static string _connectionString = "";

        internal static IRepositoryContext GetContext(string serviceNamespace)
        {
            return GetContext(serviceNamespace, String.Empty);
        }

        internal static IRepositoryContext GetContext(string serviceNamespace, string connectionString)
        {
            try
            {
                IRepositoryContext context = null;
                IUnityContainer container = new UnityContainer();
                var section = (UnityConfigurationSection)ConfigurationManager.GetSection("unity");
                if (string.IsNullOrEmpty(connectionString))
                    connectionString = GetConnectionString(serviceNamespace);
                section.Configure(container, serviceNamespace);
                DbConnection connection = container.Resolve<DbConnection>(new ParameterOverrides() { { "connectionString", connectionString } });
                context = container.Resolve<IRepositoryContext>(new ParameterOverrides() { { "dbConnectionString", connectionString } });
                return context;
            }
            catch (Exception ex) { throw ex; }
        }

        private static string GetConnectionString(string name)
        {
            if (string.IsNullOrEmpty(_connectionString))
                _connectionString = Tools.Helper.GetConnectionString(name);
            return _connectionString;
        }
    }
}

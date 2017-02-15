using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using FluentMigrator;

namespace CTR.RAP.Migrations.Extensions
{
    public static class MigrationExtensions
    {
        public static string GetEmbeddedSql(this Migration migration, string name)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var allResourceNames = assembly.GetManifestResourceNames();

            try
            {
                var sqlText = "";

                var resourceName = allResourceNames.FirstOrDefault(rn => rn.EndsWith(name));

                if (!String.IsNullOrEmpty(resourceName))
                {
                    using (var stream = assembly.GetManifestResourceStream(resourceName))
                    using (var reader = new StreamReader(stream))
                    {
                        sqlText = reader.ReadToEnd();
                    }
                }

                return sqlText;
            }
            catch (Exception ex)
            {
                return "";
            }
        }
    }
}

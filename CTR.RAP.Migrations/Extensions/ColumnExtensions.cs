using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentMigrator.Builders.Create;
using FluentMigrator.Builders.Create.Table;

namespace CTR.RAP.Migrations.Extensions
{
    public static class ColumnExtensions
    {
        public static ICreateTableWithColumnSyntax RapTable(this ICreateExpressionRoot root, string schema, string name)
        {
            return root.Table(name).InSchema(schema).WithBaseEntityId(name, "Id");
        }

        public static ICreateTableWithColumnSyntax RapTable(this ICreateExpressionRoot root, string name)
        {
            return root.Table(name).WithBaseEntityId(name, "Id");
        }

        public static ICreateTableWithColumnSyntax WithBaseEntityId(this ICreateTableWithColumnSyntax column, string tableName, string primaryIdName)
        {
            return column.WithColumn(primaryIdName).AsGuid().PrimaryKey("PK_" + tableName);
        }

        public static ICreateTableWithColumnSyntax WithAuditColumns(this ICreateTableWithColumnSyntax column)
        {
            return column
                .WithColumn("CreatedBy").AsString(int.MaxValue).Nullable()
                .WithColumn("UpdatedBy").AsString(int.MaxValue).Nullable()
                .WithColumn("CreatedDate").AsDateTime().Nullable()
                .WithColumn("UpdatedDate").AsDateTime().Nullable()
                .WithColumn("InactiveDate").AsDateTime().Nullable()
                .WithColumn("IsActive").AsBoolean().NotNullable().WithDefaultValue(true);
        }
    }
}

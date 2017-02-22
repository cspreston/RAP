using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentMigrator;

namespace CTR.RAP.Migrations
{
    [Migration(201702181320)]
    public class Migration_201702181320_FileDimensions : Migration
    {
        public override void Up()
        {
            Alter.Table("Files")
                .AddColumn("SourceFile").AsString(int.MaxValue).Nullable()
                .AddColumn("Dimensions").AsString(128).Nullable();
        }

        public override void Down()
        {
            Delete.Column("SourceFile").FromTable("Files");
            Delete.Column("Dimensions").FromTable("Files");
        }
    }
}

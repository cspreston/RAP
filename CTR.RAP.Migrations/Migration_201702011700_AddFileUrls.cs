
using System;
using FluentMigrator;

namespace CTR.RAP.Migrations
{
    [Migration(201702011700)]
    public class Migration_201702011700_AddFileUrls : Migration
    {
        public override void Up()
        {
            Alter.Table("Files")
                .AddColumn("Url").AsString(int.MaxValue).Nullable()
                .AddColumn("ThumbUrl").AsString(int.MaxValue).Nullable()
                .AddColumn("ZoomUrl").AsString(int.MaxValue).Nullable();
        }

        public override void Down()
        {
            Delete.Column("Url").FromTable("Files");
            Delete.Column("ThumbUrl").FromTable("Files");
            Delete.Column("ZoomUrl").FromTable("Files");
        }
    }
}

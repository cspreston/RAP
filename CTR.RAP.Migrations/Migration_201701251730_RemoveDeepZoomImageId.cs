
using FluentMigrator;

namespace CTR.RAP.Migrations
{
    [Migration(201701251730)]
    public class Migration_201701251730_RemoveDeepZoomImageId : Migration
    {
        public override void Up()
        {
            //if (Schema.Table("BuildingPlan").Index("IX_PlanZoomFileId").Exists())
            //{
            //    Delete.Index("IX_PlanZoomFileId")
            //        .OnTable("BuildingPlan");
            //}


            //if (Schema.Table("BuildingPlan").Constraint("FK_dbo.BuildingPlan_dbo.Files_PlanZoomFileId").Exists())
            //{
            //    Delete.ForeignKey("FK_dbo.BuildingPlan_dbo.Files_PlanZoomFileId")
            //        .OnTable("BuildingPlan");
            //}

            //if (Schema.Table("BuildingPlan").Column("PlanZoomFileId").Exists())
            //{
                Delete.Column("PlanZoomFileId")
                    .FromTable("BuildingPlan");
            //}
        }

        public override void Down()
        {
            Alter.Table("BuildingPlan")
                .AddColumn("PlanZoomFileId")
                .AsString(128)
                .Nullable()
                .ForeignKey("FK_BuildingPlan_Files_ZoomFileId", "Files", "Id");
        }
    }
}

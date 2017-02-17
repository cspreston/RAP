
using FluentMigrator;

namespace CTR.RAP.Migrations
{
    [Migration(201701251730)]
    public class Migration_201701251730_RemoveDeepZoomImageId : Migration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_BuildingPlan_Files_ZoomFileId")
                .OnTable("BuildingPlan");

            Delete.Column("PlanZoomFileId")
                .FromTable("BuildingPlan");
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

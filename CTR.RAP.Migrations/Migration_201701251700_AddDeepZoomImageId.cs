
using FluentMigrator;

namespace CTR.RAP.Migrations
{
    [Migration(201701251700)]
    public class Migration_201701251700_AddDeepZoomImageId : Migration
    {
        public override void Up()
        {
            Alter.Table("BuildingPlan")
                .AddColumn("PlanZoomFileId")
                .AsString(128)
                .Nullable()
                .ForeignKey("FK_BuildingPlan_Files_ZoomFileId", "Files", "Id");
        }

        public override void Down()
        {
            Delete.ForeignKey("FK_BuildingPlan_Files_ZoomFileId")
                .OnTable("BuildingPlan");

            Delete.Column("PlanZoomFileId")
                .FromTable("BuildingPlan");
        }
    }
}

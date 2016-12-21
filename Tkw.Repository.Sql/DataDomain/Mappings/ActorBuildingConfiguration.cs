namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class ActorBuildingConfiguration : EntityTypeConfiguration<ActorBuilding>
    {
        public ActorBuildingConfiguration()
        {
            // Properties:
            HasKey(p => new { p.ActorId, p.BuildingId })
            .ToTable("ActorBuildings");
            //properties
            Property(p => p.ActorId)
              .HasColumnName("ActorId")
              .IsRequired()
              .HasColumnType("nvarchar")
              .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
              .HasColumnOrder(1);
            Property(p => p.BuildingId)
               .HasColumnName("BuildingId")
               .IsRequired()
               .HasColumnType("nvarchar")
               .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
               .HasColumnOrder(2);

            //Relations
            HasRequired(a => a.Actor)
                .WithMany(a => a.ActorBuildingPermissions)
                .HasForeignKey(a => a.ActorId)
                .WillCascadeOnDelete(false);
            HasRequired(a => a.Building)
                .WithMany(x => x.ActorBuildingPermissions)
                .HasForeignKey(a => a.BuildingId)
                .WillCascadeOnDelete(false);
        }
    }
}

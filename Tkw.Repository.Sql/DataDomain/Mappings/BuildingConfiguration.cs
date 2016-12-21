namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class BuildingConfiguration : EntityTypeConfiguration<Building>
    {
        public BuildingConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("Buildings");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasColumnType("nvarchar").HasMaxLength(128)
                  .HasColumnOrder(1);

            HasRequired(p => p.Actor)
                 .WithMany(c => c.Buildings)
             .HasForeignKey(p => new { p.ActorId })
                 .WillCascadeOnDelete(false);
        }
    }
}
namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class BuildingTypeConfiguration : EntityTypeConfiguration<BuildingType>
    {
        public BuildingTypeConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("BuildingTypes");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasColumnType("int")
                  .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
                  .HasColumnOrder(1);
           
        }
    }
}

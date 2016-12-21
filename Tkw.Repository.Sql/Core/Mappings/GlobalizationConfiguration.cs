namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class GlobalizationConfiguration : EntityTypeConfiguration<Globalization>
    {
         public  GlobalizationConfiguration()
        {
         HasKey(p => new { p.Id })
                .ToTable("Globalization");
            // Properties:
            Property(p => p.Id)
                 .HasColumnName("Id")
                 .IsRequired()
                 .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                 .HasColumnType("int");
            Property(p => p.Name)
                    .HasColumnName("Name")
                    .IsRequired()
                    .HasMaxLength(200)
                    .HasColumnType("nvarchar");
            Property(p => p.Locale)
                   .HasColumnName("Locale")
                   .HasMaxLength(100)
                   .HasColumnType("nvarchar");
            Property(p => p.IsActive)
                   .HasColumnName("IsActive")
                   .HasColumnType("bit");
        }
    }
}

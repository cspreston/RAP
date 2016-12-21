namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class CountryConfiguration : EntityTypeConfiguration<Country>
    {
        public CountryConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("Countries");
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
            Property(p => p.IsoCode)
                   .HasColumnName("IsoCode")
                   .HasMaxLength(100)
                   .HasColumnType("nvarchar");

        }
    }
}
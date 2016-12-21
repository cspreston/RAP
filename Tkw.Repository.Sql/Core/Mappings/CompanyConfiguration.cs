namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class CompanyConfiguration : EntityTypeConfiguration<Company>
    {
        public CompanyConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("Companies");
            // Properties:
            Property(p => p.Id)
                 .HasColumnName("Id")
                 .IsRequired()
                 .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
                 .HasColumnType("nvarchar");
            Property(p => p.Name)
                  .HasColumnName("Name")
                  .HasMaxLength(300)
                  .HasColumnType("nvarchar")
                  .HasColumnOrder(2);

            HasOptional(p => p.DataBase)
                .WithMany(c => c.Companies);
        }
    }
}

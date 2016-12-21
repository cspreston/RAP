namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class DomainDataBaseConfiguration : EntityTypeConfiguration<DomainDataBase>
    {
        public DomainDataBaseConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("DomainDataBases");
            // Properties:
            Property(p => p.Id)
                   .HasColumnName("Id")
                   .IsRequired()
                   .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                   .HasColumnType("int");
            Property(p => p.ConnectionString)
                    .HasColumnName("ConnectionString")
                    .IsRequired()
                    .HasMaxLength(4000)
                    .HasColumnType("nvarchar");
            Property(p => p.ScreenName)
                    .HasColumnName("ScreenName")
                    .IsRequired()
                    .HasMaxLength(400)
                    .HasColumnType("nvarchar");
            Property(p => p.IsActive)
                  .HasColumnName("IsActive")
                  .HasColumnType("bit");
            Property(p => p.InactiveDate)
                  .HasColumnName("InactiveDate")
                  .HasColumnType("datetime");
            Property(p => p.CreateDate)
                  .HasColumnName("CreateDate")
                  .HasColumnType("datetime");
            Property(p => p.UpdateDate)
                  .HasColumnName("UpdateDate")
                  .HasColumnType("datetime");
        }
    }
}

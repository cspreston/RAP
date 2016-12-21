namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class AddressConfiguration : EntityTypeConfiguration<Address>
    {
        public AddressConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("Addresses");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                  .HasColumnType("int")
                  .HasColumnOrder(1);
            Property(p => p.CountryId)
                .HasColumnName("CountryId")
                .HasColumnType("int")
                .IsRequired()
                .HasColumnOrder(2);
            Property(p => p.Name)
                  .HasColumnName("Name")
                  .IsRequired()
                  .HasMaxLength(100)
                  .HasColumnType("nvarchar");
            Property(p => p.City)
                  .HasColumnName("City")
                  .IsRequired()
                  .HasMaxLength(100)
                  .HasColumnType("nvarchar");
            Property(p => p.PostCode)
                  .HasColumnName("PostCode")
                  .IsRequired()
                  .HasMaxLength(100)
                  .HasColumnType("nvarchar");
            Property(p => p.Features)
                   .HasColumnName("Features")
                   .HasColumnType("int");
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

            HasRequired(p => p.Country)
                  .WithMany(c => c.Addresses)
              .HasForeignKey(p => new { p.CountryId })
                  .WillCascadeOnDelete(false);
        }
    }
}

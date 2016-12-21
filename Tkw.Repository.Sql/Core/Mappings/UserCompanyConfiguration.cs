namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class UserCompanyConfiguration : EntityTypeConfiguration<UserCompany>
    {
        public UserCompanyConfiguration()
        {
            // Properties:
            HasKey(p => new { p.UserId, p.CompanyId })
            .ToTable("UserCompanies");
            //properties
            Property(p => p.UserId)
              .HasColumnName("UserId")
              .IsRequired()
              .HasColumnType("nvarchar")
              .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
              .HasColumnOrder(1);
            Property(p => p.CompanyId)
               .HasColumnName("CompanyId")
               .IsRequired()
               .HasColumnType("nvarchar")
               .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
               .HasColumnOrder(2);

            //Relations
            HasRequired(a => a.User)
                .WithMany(a => a.UserCompanies)
                .HasForeignKey(a => a.UserId)
                .WillCascadeOnDelete(true);
            HasRequired(a => a.Company)
                .WithMany(x => x.UserCompanies)
                .HasForeignKey(a => a.CompanyId)
                .WillCascadeOnDelete(true);
        }
    }
}

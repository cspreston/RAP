namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class UserConfiguration : EntityTypeConfiguration<User>
    {
        public UserConfiguration()
        {
            Property(p => p.Id).HasColumnOrder(1);
            Property(p => p.DataBaseId).HasColumnName("DataBaseId").HasColumnOrder(2).HasColumnType("int");
            Property(p => p.Type).HasColumnName("Type").HasColumnOrder(3).HasColumnType("int");
            Property(p => p.LastUsedCompanyId).HasColumnName("LastUsedCompanyId").HasColumnOrder(4).HasColumnType("nvarchar");

            HasOptional(p => p.DataBase)
                .WithMany(c => c.Users)
            .HasForeignKey(p => new { p.DataBaseId })
                .WillCascadeOnDelete(false);
            HasOptional(x => x.LastUsedCompany)
               .WithMany(x => x.Users)
               .HasForeignKey(x => x.LastUsedCompanyId)
               .WillCascadeOnDelete(false);
        }
    }
}
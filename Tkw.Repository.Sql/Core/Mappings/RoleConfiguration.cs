namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class RoleConfiguration : EntityTypeConfiguration<Role>
    {
        public RoleConfiguration()
        {

            HasOptional(x => x.Users)
           .WithMany().WillCascadeOnDelete(true);

        }
    }
}

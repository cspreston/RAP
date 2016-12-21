namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class ClientConfiguration : EntityTypeConfiguration<Client>
    {
        public ClientConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("Clients");
            // Properties:
            HasRequired(p => p.Actor);
        }
    }
}
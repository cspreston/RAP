namespace Repository.Sql
{
    using BusinessObjects;
    using System.Data.Entity.ModelConfiguration;

    internal partial class ContactInfoConfiguration : EntityTypeConfiguration<ContactInfo>
    {
        public ContactInfoConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("ContactInfo");

            HasRequired(p => p.Building)
                .WithMany(z => z.ContactInfo)
                .HasForeignKey(h => h.BuildingId);

        }
    }
}


namespace Repository.Sql
{
    using BusinessObjects;
    using System.Data.Entity.ModelConfiguration;

    internal partial class PricingInfoConfiguration : EntityTypeConfiguration<PricingInfo>
    {
        public PricingInfoConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("PricingInfo");

            HasRequired(p => p.Building)
                .WithMany(z => z.PrinceInfo)
                .HasForeignKey(p => p.BuildingId);
        }
    }
}

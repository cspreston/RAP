namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class SubscriptionConfiguration : EntityTypeConfiguration<Subscription>
    {

        public SubscriptionConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("Subscriptions");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                  .HasColumnType("int")
                  .HasColumnOrder(1);
            Property(p => p.CurrencyCode)
                  .HasColumnName("CurrencyCode")
                  .IsRequired()
                  .HasColumnType("nvarchar")
                  .HasColumnOrder(2);
            Property(p => p.Value)
                   .HasColumnName("Value")
                   .IsRequired()
                   .HasColumnType("decimal")
                   .HasColumnOrder(3);
            Property(p => p.Feature)
                 .HasColumnName("Feature")
                 .IsRequired()
                 .HasColumnType("int")
                 .HasColumnOrder(4);

        }
    }
}

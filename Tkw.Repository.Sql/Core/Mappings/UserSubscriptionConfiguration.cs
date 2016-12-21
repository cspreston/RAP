namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class UserSubscriptionConfiguration : EntityTypeConfiguration<UserSubscription>
    {

        public UserSubscriptionConfiguration()
        {
            HasKey(p => new { p.Id })
                   .ToTable("UserSubscriptions");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                  .HasColumnType("int")
                  .HasColumnOrder(1);
            Property(p => p.UserId)
                   .HasColumnName("UserId")
                   .IsRequired()
                   .HasColumnType("nvarchar")
                   .HasColumnOrder(2);
            Property(p => p.SubscriptionId)
                   .HasColumnName("SubscriptionId")
                   .IsRequired()
                   .HasColumnType("int")
                   .HasColumnOrder(3);
            Property(p => p.FromDate)
                   .HasColumnName("FromDate")
                   .IsRequired()
                   .HasColumnType("date");
            Property(p => p.UntilDate)
                   .HasColumnName("UntilDate")
                   .HasColumnType("date")
                   .HasColumnOrder(4);
            Property(p => p.IsActive)
                   .HasColumnName("IsActive")
                   .IsRequired()
                   .HasColumnType("bit")
                   .HasColumnOrder(5);

            HasRequired(p => p.Subscription)
              .WithMany(c => c.UserSubscriptions)
              .HasForeignKey(p => new { p.SubscriptionId })
              .WillCascadeOnDelete(false);

            HasRequired(p => p.User)
               .WithMany(c => c.UserSubscriptions)
               .HasForeignKey(p => new { p.UserId })
               .WillCascadeOnDelete(true);
        }
    }
}

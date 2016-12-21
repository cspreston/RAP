namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class UserProfileConfiguration : EntityTypeConfiguration<UserProfile>
    {
        public UserProfileConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("UserProfile");
            // Properties:
            Property(p => p.Id)
                   .HasColumnName("Id")
                   .HasColumnOrder(1)
                   .IsRequired()
                   .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                   .HasColumnType("int");
            Property(p => p.AddressId)
                    .HasColumnName("AddressId")
                    .HasColumnType("int")
                    .HasColumnOrder(2);
            Property(p => p.GlobalizationId)
                    .HasColumnName("GlobalizationId")
                    .HasColumnType("int")
                    .HasColumnOrder(3);
            Property(p => p.Title)
                    .HasColumnName("Title")
                    .HasColumnType("int");
            Property(p => p.FirstName)
                    .HasColumnName("FirstName")
                    .HasMaxLength(200)
                    .HasColumnType("nvarchar");
            Property(p => p.LastName)
                    .HasColumnName("LastName")
                    .HasMaxLength(200)
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

            HasOptional(x => x.ApplicationUser)
                .WithOptionalDependent(x => x.UserProfile)
                .Map(x=>x.MapKey("UserId"))
                .WillCascadeOnDelete(true);
            HasOptional(x => x.Address)
                .WithMany(x => x.UserProfile)
                .HasForeignKey(p => new { p.AddressId })
                .WillCascadeOnDelete(false);

            HasOptional(x => x.Globalization)
               .WithMany(x => x.UserProfiles)
               .HasForeignKey(p => p.GlobalizationId )
               .WillCascadeOnDelete(false);
        }
    }
}
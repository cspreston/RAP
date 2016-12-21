namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class UserSessionConfiguration : EntityTypeConfiguration<UserSession>
    {
        public UserSessionConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("UserSessions");
            // Properties:
            Property(p => p.Id)
                    .HasColumnName("Id")
                    .HasColumnOrder(1)
                    .IsRequired()
                    .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                    .HasColumnType("int");
            Property(p => p.UserId)
                    .HasColumnName("UserId")
                    .HasMaxLength(128)
                    .HasColumnType("nvarchar");
            Property(p => p.SessionId)
                 .HasColumnName("SessionId")
                    .HasMaxLength(400)
                    .HasColumnType("nvarchar")
                    .IsRequired();
            Property(p => p.ClientIp)
                    .HasColumnName("ClientIp")
                    .HasMaxLength(400)
                    .HasColumnType("nvarchar")
                    .IsRequired();
            Property(p => p.ClientAgent)
                    .HasColumnName("ClientAgent")
                    .HasMaxLength(400)
                    .HasColumnType("nvarchar")
                    .IsRequired();
            Property(p => p.LoggedIn)
                    .HasColumnName("LoggedIn")
                    .HasColumnType("bit")
                    .IsRequired();
            Property(p => p.LoggedInDate)
                .HasColumnName("LoggedInDate")
                .HasColumnType("datetime");
            Property(p => p.LoggedOutDate)
               .HasColumnName("LoggedOutDate")
               .HasColumnType("datetime");

            HasOptional(x => x.User)
                    .WithMany(x => x.UserSessions)
                    .HasForeignKey(p => new { p.UserId })
                    .WillCascadeOnDelete(true);
        }
    }
}

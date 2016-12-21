namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class ActorPermissionConfiguration : EntityTypeConfiguration<ActorPermission>
    {
        public ActorPermissionConfiguration()
        {
            // Properties:
            HasKey(p => new { p.Id})
            .ToTable(" ActorPermissions");
            //properties
            // Properties:
            Property(p => p.Id)
                   .HasColumnName("Id")
                   .IsRequired()
                   .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity)
                   .HasColumnType("int");
            Property(p => p.ActorId)
                  .HasColumnName("ActorId")
                  .IsRequired()
                  .HasColumnType("nvarchar")
                  .HasColumnOrder(2);

            //Relations
            HasRequired(a => a.Actor)
                .WithMany(a => a.ActorPermissions)
                .HasForeignKey(a => a.ActorId)
                .WillCascadeOnDelete(false);
        }
    }
}

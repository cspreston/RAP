namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class ActorConfiguration : EntityTypeConfiguration<Actor>
    {
        public ActorConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("Actors");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasColumnType("nvarchar")
                  .HasColumnOrder(1);
            Property(p => p.Name)
                  .HasColumnName("Name")
                  .HasColumnType("nvarchar")
                  .HasMaxLength(800)
                  .IsRequired();
            Property(p => p.Type)
                  .HasColumnName("Type")
                  .HasColumnType("int")
                  .IsRequired();
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
        }
    }
}

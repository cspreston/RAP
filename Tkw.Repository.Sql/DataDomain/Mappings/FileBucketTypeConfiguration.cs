namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class FileBucketTypeConfiguration : EntityTypeConfiguration<FileBucketTypes>
    {
        public FileBucketTypeConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("FileBucketTypes");
            // Properties:
            Property(p => p.Id)
                  .HasColumnName("Id")
                  .IsRequired()
                  .HasColumnType("int")
                  .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None)
                  .HasColumnOrder(1);
           
        }
    }
}

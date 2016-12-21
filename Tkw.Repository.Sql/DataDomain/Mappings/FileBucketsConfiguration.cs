namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class FileBucketsConfiguration : EntityTypeConfiguration<FileBuckets>
    {
        public FileBucketsConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("FileBuckets");

            HasRequired(p => p.FileBucketType)
                .WithMany(c => c.FileBuckets)
            .HasForeignKey(p => new { p.FileBucketTypeId })
                .WillCascadeOnDelete(false);
        }
    }
}

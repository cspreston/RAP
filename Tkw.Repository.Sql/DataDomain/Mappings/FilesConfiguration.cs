namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class FilesConfiguration : EntityTypeConfiguration<Files>
    {
        public FilesConfiguration()
        {
            HasKey(p => new { p.Id })
               .ToTable("Files");

            HasRequired(p => p.FileBucket)
                .WithMany(c => c.Files)
            .HasForeignKey(p => new { p.FileBucketId })
                .WillCascadeOnDelete(false);
        }
    }
}
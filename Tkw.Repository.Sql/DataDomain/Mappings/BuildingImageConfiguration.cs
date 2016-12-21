using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Sql
{
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.ModelConfiguration;
    using BusinessObjects;

    internal partial class BuildingImageConfiguration : EntityTypeConfiguration<BuildingImage>
    {
        public BuildingImageConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("BuildingImage");

            HasRequired(p => p.Building)
                 .WithMany(c => c.BuildingImages)
             .HasForeignKey(p => new { p.BuildingId })
                 .WillCascadeOnDelete(false);

            HasRequired(p => p.File).WithMany(c=>c.BuildingImages).HasForeignKey(a=>a.FileId);

            // Properties:
        }


    }
}

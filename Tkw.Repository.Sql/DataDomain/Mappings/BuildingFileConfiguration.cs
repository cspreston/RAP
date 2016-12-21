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

    internal partial class BuildingFileConfiguration : EntityTypeConfiguration<BuildingFile>
    {
        public BuildingFileConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("BuildingFile");

            HasRequired(p => p.Building)
                 .WithMany(c => c.BuildingFiles)
             .HasForeignKey(p => new { p.BuildingId })
                 .WillCascadeOnDelete(false);

            HasRequired(p => p.File);

            // Properties:
        }
    }
}

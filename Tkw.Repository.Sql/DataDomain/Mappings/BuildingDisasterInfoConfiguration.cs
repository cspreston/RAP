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

    internal partial class BuildingDisasterInfoConfiguration : EntityTypeConfiguration<BuildingDisasterInfo>
    {
        public BuildingDisasterInfoConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("BuildingDisasterInfo");

            HasRequired(p => p.Building)
                 .WithMany(c => c.BuildingDisasterInfos)
             .HasForeignKey(p => new { p.BuildingId })
                 .WillCascadeOnDelete(false);

            HasRequired(p => p.File);

            // Properties:
        }
    }
}

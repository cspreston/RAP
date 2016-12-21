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

    internal partial class HotspotConfiguration : EntityTypeConfiguration<Hotspot>
    {
        public HotspotConfiguration()
        {
            HasKey(p => new { p.Id })
             .ToTable("Hotspot");

            HasRequired(p => p.BuildingPlan)
                 .WithMany(c => c.Hotspots)
             .HasForeignKey(p => new { p.BuildingPlanId })
                 .WillCascadeOnDelete(false);

            HasRequired(p => p.Building)
                .WithMany(c => c.Hotspots)
              .HasForeignKey(p => new { p.BuildingId })
                .WillCascadeOnDelete(false);

            HasRequired(p => p.HotspotActionType);

            HasRequired(p => p.HotspotDisplayType);
        }
    }
}

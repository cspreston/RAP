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

    internal partial class BuildingPlanConfiguration : EntityTypeConfiguration<BuildingPlan>
    {
        public BuildingPlanConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("BuildingPlan");

            HasRequired(p => p.Building)
                 .WithMany(c => c.BuildingPlans)
             .HasForeignKey(p => new { p.BuildingId })
                 .WillCascadeOnDelete(false);

        }

        
    }
}

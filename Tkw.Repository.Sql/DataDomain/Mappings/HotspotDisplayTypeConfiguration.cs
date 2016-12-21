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

    internal partial class HotspotDisplayTypeConfiguration : EntityTypeConfiguration<HotspotDisplayType>
    {
        public HotspotDisplayTypeConfiguration() {
            HasKey(p => new { p.Id })
                .ToTable("HotspotDisplayType");
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

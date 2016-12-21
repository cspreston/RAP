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

    internal partial class HotspotActionTypeConfiguration : EntityTypeConfiguration<HotspotActionType>
    {
        public HotspotActionTypeConfiguration()
        {
            HasKey(p => new { p.Id })
                .ToTable("HotspotActionType");
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
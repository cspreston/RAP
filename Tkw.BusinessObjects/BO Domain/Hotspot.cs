using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Hotspot : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }

        public virtual string BuildingId { get; set; }
        public virtual string BuildingPlanId { get; set; }
        public virtual int HotspotDisplayTypeId { get; set; }
        public virtual int HotspotActionTypeId { get; set; }
        public virtual string DisplayDetails { get; set; }
        public virtual string BeaconuuId { get; set;}
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        #endregion

        #region Navigation Properties
        public virtual Building Building { get; set;}
        public virtual BuildingPlan BuildingPlan { get; set; }
        public virtual HotspotDisplayType HotspotDisplayType { get; set; }
        public virtual HotspotActionType HotspotActionType { get; set; }
        public virtual ICollection<Files> Files { get; set; }
        #endregion
    }
}

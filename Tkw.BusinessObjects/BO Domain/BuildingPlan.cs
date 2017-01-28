using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class BuildingPlan : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }
        public virtual string BuildingId { get; set; }
        public virtual string Name { get; set; }
        public virtual string PlanFileId { get; set; }
        public virtual string PlanThumbnailFileId { get; set; }
        public virtual string Description { get; set; }
        public virtual string PlanZoomFileId { get; set; }

        public virtual int Order { get; set; }

       [NotMapped]
        public virtual bool CanUseFullCanvas
        {

            get
            {
                bool retVal = false;
                if (this.Hotspots != null)
                {
                    retVal = this.Hotspots.Where(t => t.CreateDate < new DateTime(2016, 3, 1)).Count() == 0;
                }
                return retVal;
            }
        }
        #endregion

        #region Navigation Properties
        public Building Building { get; set; }
        public ICollection<Hotspot> Hotspots { get; set; }

        public virtual Files PlanFile { get; set; }
        public virtual Files PlanThumbnailFile { get; set; }
        public virtual Files PlanZoomFile { get; set; }
        #endregion
    }
}

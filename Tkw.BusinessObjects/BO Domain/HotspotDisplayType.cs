namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class HotspotDisplayType : BaseDate
    {
        #region Properties
        [Key]
        public virtual int Id { get; set; }

        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual string FileName { get; set; }

        public virtual string Color { get; set; }

        public virtual HotspotType Type { get; set; }
        #endregion

    }
}

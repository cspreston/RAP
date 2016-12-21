namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class PricingInfo : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { set; get; }

        public virtual string BuildingId { set; get; }
        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual string Units { set; get; }
        public virtual double UnitPrice { get; set; }
        public virtual int Quantity { get; set; }
        #endregion

        #region Navigation Properties
        public virtual Building Building { get; set; }
        #endregion
    }
}

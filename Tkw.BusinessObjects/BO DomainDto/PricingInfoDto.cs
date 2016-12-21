namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "PricingInfo", Namespace = "http://www.yourcompany.com/types/")]
    public class PricingInfoDto
    {
        [DataMember]
        public virtual string Id { set; get; }
        [DataMember]
        public virtual string BuildingId { set; get; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual double UnitPrice { get; set; }
        [DataMember]
        public virtual int Quantity { get; set; }
        [DataMember]
        public virtual string Units { get; set; }

        public static PricingInfoDto Create(PricingInfo e)
        {
            return new PricingInfoDto()
            {
                Id = e.Id,
                BuildingId = e.BuildingId,
                Name = e.Name,
                Description = e.Description,
                UnitPrice = e.UnitPrice,
                Quantity = e.Quantity,
                Units = e.Units
            };
        }
    }
}

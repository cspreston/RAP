namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "HotspotDisplayType", Namespace = "http://www.yourcompany.com/types/")]
    public class HotspotDisplayTypeDto
    {
        [DataMember]
        public virtual int Id { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual string FileName { get; set; }
        [DataMember]
        public virtual HotspotType Type { get; set; }
        [DataMember]
        public virtual string Color { get; set; }
        public static HotspotDisplayTypeDto Create(HotspotDisplayType e)
        {
            return new HotspotDisplayTypeDto()
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                FileName = e.FileName,
                Color = e.Color
            };
        }
    }
}

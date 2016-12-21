namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "HotspotCustomProperties", Namespace = "http://www.yourcompany.com/types/")]
    public class HotspotCustomPropertiesDto
    {
        [DataMember]
        public virtual string BeaconuuId { get; set; }
        [DataMember]
        public virtual int LineSize { get; set; }
        [DataMember]
        public virtual string LineColor { get; set; }
        [DataMember]
        public virtual int CircleSize { get; set; }
        [DataMember]
        public virtual string CircleColor { get; set; }
    }
}
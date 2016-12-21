namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "HotspotActionType", Namespace = "http://www.yourcompany.com/types/")]
    public class HotspotActionTypeDto
    {
        [DataMember]
        public virtual int Id { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual bool AllowAttachment { get; set; }
        [DataMember]
        public virtual string AllowedFileTypes { get; set; }

        public static HotspotActionTypeDto Create(HotspotActionType e)
        {
            return new HotspotActionTypeDto()
            {
                Id = e.Id,
                Name = e.Name,
                Description = e.Description,
                AllowAttachment = e.AllowAttachment,
                AllowedFileTypes = e.AllowedFileTypes
            };
        }
    }
}

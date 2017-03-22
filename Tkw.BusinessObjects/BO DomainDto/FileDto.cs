using System;
using System.Collections.Generic;
namespace BusinessObjects
{
    using System.Runtime.Serialization;
    // In case we need it
    [DataContract(Name = "Files", Namespace = "http://www.yourcompany.com/types/")]
    public class FileDto
    {
        
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual string FileBucketId { get; set; }
        [DataMember]
        public virtual string Url { get; set; }
        [DataMember]
        public virtual string ThumbUrl { get; set; }
        [DataMember]
        public virtual string ZoomUrl { get; set; }
        [DataMember]
        public virtual string Dimensions { get; set; }

        public static FileDto Create(Files e) {
            return new FileDto()
            {
                Description = e.Description,
                FileBucketId = e.FileBucketId,
                Id = e.Id,
                Name = e.Name,
                Url = e.Url,
                ThumbUrl = e.ThumbUrl,
                ZoomUrl = e.ZoomUrl,
                Dimensions = e.Dimensions
            };
        }
    }
}

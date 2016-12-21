namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Hotspot", Namespace = "http://www.yourcompany.com/types/")]
    public class HotspotDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string BuildingId { get; set; }
        [DataMember]
        public virtual string BuildingPlanId { get; set; }
        [DataMember]
        public virtual int HotspotDisplayTypeId { get; set; }
        [DataMember]
        public virtual int HotspotActionTypeId { get; set; }
        [DataMember]
        public virtual string DisplayDetails { get; set; }
        [DataMember]
        public virtual string BeaconuuId { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual int Order { get; set; }

        [DataMember]
        public virtual HotspotDisplayTypeDto HotspotDisplayType { get; set; }
        [DataMember]
        public virtual HotspotActionTypeDto HotspotActionType { get; set; }

        [DataMember]
        public virtual ICollection<FileWithButcketDTO> Files { get; set; }

        public static HotspotDto Create(Hotspot e)
        {
            var dto = new HotspotDto()
            {
                Id = e.Id,
                BeaconuuId = e.BeaconuuId,
                BuildingId = e.BuildingId,
                BuildingPlanId = e.BuildingPlanId,
                DisplayDetails = e.DisplayDetails,
                HotspotActionTypeId = e.HotspotActionTypeId,
                HotspotDisplayTypeId = e.HotspotDisplayTypeId
            };
            foreach (var file in e.Files)
            {
                var fdto = new FileWithButcketDTO() {
                    BucketName = file.FileBucket.Name,
                    BucketPath = file.FileBucket.PhysicalPath,
                    FileDescription = file.Description,
                    FileName  = file.Name,
                    Id = file.Id
                };
                dto.Files.Add(fdto);
            }
            return dto;
        }
    }
}

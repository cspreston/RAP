namespace BusinessObjects
{
    using System.Linq;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingPlan", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingPlanDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string BuildingId { get; set; }
        [DataMember]
        public virtual string BuildingName { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string PlanThumbnailFileId { get; set; }
        [DataMember]
        public virtual string PlanFileId { get; set; }
        [DataMember]
        public virtual string Description { get; set; }

        [DataMember]
        public virtual bool CanUseFullCanvas { get; set; }

        [DataMember]
        public ICollection<HotspotDto> Hotspots { get; set; }
        [DataMember]
        public FileWithButcketDTO PlanFile { get; set; }
        [DataMember]
        public FileWithButcketDTO PlanThumbnailFile { get; set; }

        [DataMember]
        public int HotspotsCount { get; set; }


        public static BuildingPlanDto Create(BuildingPlan e)
        {
            var dto = new BuildingPlanDto()
            {
                Id = e.Id,
                BuildingId = e.BuildingId,
                Name = e.Name,
                PlanThumbnailFileId = e.PlanThumbnailFileId,
                PlanFileId = e.PlanFileId,
                Description = e.Description,
                Hotspots = new List<HotspotDto>()
            };

            foreach (Hotspot hp in e.Hotspots)
            {
                var hpdto = HotspotDto.Create(hp);
                dto.Hotspots.Add(hpdto);
            }
            return dto;
        }
    }
}
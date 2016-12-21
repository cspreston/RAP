namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Building", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public string ActorId { get; set; }
        [DataMember]
        public string ActorName { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public virtual string Address { get; set; }
        [DataMember]
        public virtual string ZIP { get; set; }
        [DataMember]
        public virtual string Geopoints { get; set; }
        [DataMember]
        public virtual string EmergencyPhone { get; set; }
        [DataMember]
        public virtual string EmergencyEmail { get; set; }
        [DataMember]
        public virtual string BuildingType { get; set; }
        [DataMember]
        public virtual string ConstructionType { get; set; }
        [DataMember]
        public virtual int BuildingsNo { get; set; }
        [DataMember]
        public virtual int UnitsNo { get; set; }
        [DataMember]
        public virtual string FeaturedImageId { get; set; }
        [DataMember]
        public int ViewsCount { get; set; }
        [DataMember]
        public int ImagesCount { get; set; }
        [DataMember]
        public DateTime UpdateDate { get; set; }

        [DataMember]
        public ICollection<BuildingImageDto> BuildingImages { get; set; }

        [DataMember]
        public ICollection<BuildingPlanDto> BuildingPlans { get; set; }
        [DataMember]
        public ICollection<BuildingDisasterInfoDto> BuildingDisasterInfos { get; set; }
        [DataMember]
        public ICollection<BuildingFileDto> BuildingFiles { get; set; }
        [DataMember]
        public ICollection<ContactInfoDto> ContactInfos { get; set; }
        [DataMember]
        public ICollection<PricingInfoDto> PricingInfos { get; set; }

        [DataMember]
        public ICollection<BuildingFolderDto> BuildingFolders { get; set; }

        [DataMember]
        public virtual List<string> UserIds { get; set; }

        [DataMember]
        public virtual BuildingDisplayConfiguration? DisplayConfiguration { get; set; }

        [DataMember]
        public virtual bool ShowPricing { get; set; }
        [DataMember]
        public virtual bool ShowContact { get; set; }
        [DataMember]
        public virtual bool ShowFiles { get; set; }
        [DataMember]
        public virtual bool ShowDisaster { get; set; }
        [DataMember]
        public virtual bool ShowFolders { get; set; }
        [DataMember]
        public virtual bool IsOffline { get; set; }
        [DataMember]
        public virtual string OfflineBy { get; set; }

        public static BuildingDto Create(Building a)
        {
            BuildingDto dto = new BuildingDto()
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                BuildingImages = new List<BuildingImageDto>(),
                ViewsCount = a.BuildingPlans.Count,
                ImagesCount = a.BuildingImages.Count
            };
            foreach(BuildingImage img in a.BuildingImages)
            {
                dto.BuildingImages.Add(BuildingImageDto.Create(img));
            }

            foreach(PricingInfo prc in a.PrinceInfo)
            {
                dto.PricingInfos.Add(PricingInfoDto.Create(prc));
            }
            foreach (ContactInfo cnt in a.ContactInfo)
            {
                dto.ContactInfos.Add(ContactInfoDto.Create(cnt));
            }

            return dto;
        }
    }
}

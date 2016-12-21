namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Building : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }

        public virtual string Name { get; set; }
        public string ActorId { get; set; }
        public virtual string Description { get; set; }
        public virtual string Address { get; set; }
        public virtual string ZIP { get; set; }
        public virtual string EmergencyPhone { get; set; }
        public virtual string EmergencyEmail { get; set; }
        public virtual string BuildingType { get; set; }
        public virtual string ConstructionType { get; set; }
        public virtual int BuildingsNo { get; set; }
        public virtual int UnitsNo { get; set; }
        public virtual string FeaturedImageId { get; set; }
        public virtual string Geopoints { get; set; }
        public virtual BuildingDisplayConfiguration? DisplayConfiguration { get; set; }
        public virtual bool IsOffline { get; set; }
        public virtual string OfflineBy { get; set; }
        #endregion

        #region Navigation Properties
        public virtual Actor Actor { get; set; }
        public ICollection<ActorBuilding> ActorBuildingPermissions { get; set; }
        public ICollection<BuildingImage> BuildingImages { get; set; }
        public ICollection<BuildingFile> BuildingFiles { get; set; }
        public ICollection<BuildingDisasterInfo> BuildingDisasterInfos { get; set; }
        public ICollection<BuildingPlan> BuildingPlans { get; set; }
        public ICollection<Hotspot> Hotspots { get; set; }
        public ICollection<PricingInfo> PrinceInfo { get; set; }
        public ICollection<ContactInfo> ContactInfo { get; set; }
        #endregion
    }
}

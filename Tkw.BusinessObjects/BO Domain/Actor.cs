namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Actor : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }
        public virtual string Name { get; set; }
        public virtual ActorType Type { get; set; }
        
        #endregion

        #region Navigation Properties
        public ICollection<Building> Buildings { get; set; }
        public ICollection<ActorBuilding> ActorBuildingPermissions { get; set; }
        public ICollection<ActorPermission> ActorPermissions { get; set; }
        #endregion
    }
}
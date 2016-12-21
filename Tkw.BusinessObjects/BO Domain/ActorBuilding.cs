namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class ActorBuilding : BaseDate
    {
        #region Properties

        public virtual string ActorId { get; set; }

        public virtual string BuildingId { get; set; }

        #endregion

        #region Navigation Properties

        public virtual Actor Actor { get; set; }

        public virtual Building Building { get; set; }

        #endregion
    }
}
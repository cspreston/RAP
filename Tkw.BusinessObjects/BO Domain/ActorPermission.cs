namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class ActorPermission : BaseDate
    {
        #region Properties
        [Key]
        public virtual int Id { get; set; }
        public virtual string ActorId { get; set; }

        public virtual PermissionResource Resource { get; set; }
        public virtual string Value { get; set; }
        public virtual PermissionFeature Feature { get; set; }
        #endregion

        #region Navigation Properties
        public virtual Actor Actor { get; set; }
        #endregion
    }
}
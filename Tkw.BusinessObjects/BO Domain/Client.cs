namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Client : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }

        public virtual string ActorId { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual string PhoneNumber { get; set; }
        public virtual string Address { set; get; }
        public virtual string Email { get; set; }
        public virtual string Fax { get; set; }

        #region Navigation Properties
        public virtual Actor Actor { get; set; }
        #endregion
        #endregion
    }
}

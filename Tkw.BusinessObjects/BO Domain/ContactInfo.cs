namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class ContactInfo : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }

        public virtual string BuildingId { get; set; }
        public virtual string Title { get; set; }
        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }
        public virtual string Role { get; set; }
        public virtual string EmailAddress { get; set; }
        public virtual string Phone { get; set; }
        public virtual string MobilePhone { get; set; }
        public virtual string Address { get; set; }
        public virtual string SecondAddress { get; set; }
        public virtual string City { get; set; }
        public virtual string State { get; set; }
        public virtual string Zip { get; set; }
        #endregion

        #region Navigation Properties
        public Building Building { get; set; }
        #endregion
    }
}

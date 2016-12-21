namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Company : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }
        [Required]
        public virtual string Name { get; set; }
        public virtual string Phone { get; set; }
        public virtual string Address { set; get; }
        public virtual string Website { set; get; }
        public virtual string Email { get; set; }
        public virtual string City { get; set; }
        public virtual string State { get; set; }
        public virtual string Zip { get; set; }
        public virtual CompanyType Type { get; set; }

        public virtual Nullable<int> DataBaseId
        {
            get
            {
                return _DataBaseId;
            }
            set
            {
                if (_DataBaseId != value)
                {
                    _DataBaseId = value;
                }
            }
        }
        private Nullable<int> _DataBaseId;
        #endregion

        #region Navigation Properties
        public virtual ICollection<UserCompany> UserCompanies { get; set; }
        public virtual ICollection<User> Users { get; set; }
        public virtual DomainDataBase DataBase { get; set; }
        #endregion
    }
}
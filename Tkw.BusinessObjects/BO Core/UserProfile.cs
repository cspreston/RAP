namespace BusinessObjects
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class UserProfile : BaseDate
    {
        #region Properties
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual global::System.Int32 Id
        {
            get
            {
                return _Id;
            }
            set
            {
                if (_Id != value)
                {
                    _Id = value;
                }
            }
        }
        private global::System.Int32 _Id;

        public virtual global::System.Nullable<int> AddressId
        {
            get
            {
                return _AddressId;
            }
            set
            {
                if (_AddressId != value)
                {
                    _AddressId = value;
                }
            }
        }
        private global::System.Nullable<int> _AddressId;

        public virtual Nullable<int> GlobalizationId
        {
            get
            {
                return _GlobalizationId;
            }
            set
            {
                if (_GlobalizationId != value)
                {
                    _GlobalizationId = value;
                }
            }
        }
        private Nullable<int> _GlobalizationId;

        public virtual UserTitle Title
        {
            get
            {
                return _Title;
            }
            set
            {
                if (_Title != value)
                {
                    _Title = value;
                }
            }
        }
        private UserTitle _Title;

        public virtual string FirstName
        {
            get
            {
                return _FirstName;
            }
            set
            {

                if (_FirstName != value)
                {
                    _FirstName = value;
                }
            }
        }
        private string _FirstName;

        public virtual string LastName
        {
            get
            {
                return _LastName;
            }
            set
            {
                if (_LastName != value)
                {
                    _LastName = value;
                }
            }
        }
        private string _LastName;

        [NotMapped]
        public virtual string UserId
        {
            get
            {
                if (this.ApplicationUser != null)
                {
                    return this.ApplicationUser.Id;
                }
                else
                {
                    return string.Empty; ;
                }
            }
            set
            {
                if (this.ApplicationUser != null)
                {
                    _UserId = this.ApplicationUser.Id;
                }
                else
                {
                    _UserId = string.Empty;
                }
            }
        }
        private string _UserId;
        #endregion

        #region Navigation Properties
        public virtual User ApplicationUser
        {
            get;
            set;
        }
        public virtual Address Address
        {
            get;
            set;
        }
        public virtual Globalization Globalization { get; set; }
        #endregion
    }
}
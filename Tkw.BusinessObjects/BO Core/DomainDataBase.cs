namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class DomainDataBase : BaseDate
    {
        #region Properties
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual int Id
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
        private int _Id;

        public virtual string ScreenName
        {
            get
            {
                return _ScreenName;
            }
            set
            {
                if (_ScreenName != value)
                {
                    _ScreenName = value;
                }
            }
        }
        private string _ScreenName;

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string ConnectionString
        {
            get
            {
                return _ConnectionString;
            }
            set
            {
                if (_ConnectionString != value)
                {
                    _ConnectionString = value;
                }
            }
        }
        private string _ConnectionString;
        #endregion

        #region Navigation Properties
        public virtual ICollection<User> Users
        {
            get;
            set;
        }
        public virtual ICollection<Company> Companies
        {
            get;
            set;
        }
        #endregion
    }
}

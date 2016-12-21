namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Globalization
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

        public virtual string Name
        {
            get
            {
                return _Name;
            }
            set
            {
                if (_Name != value)
                {
                    _Name = value;
                }
            }
        }
        private string _Name;

        public virtual string Locale
        {
            get
            {
                return _Locale;
            }
            set
            {
                if (_Locale != value)
                {
                    _Locale = value;
                }
            }
        }
        private string _Locale;

        public virtual bool IsActive
        {
            get
            {
                return _IsActive;
            }
            set
            {
                if (_IsActive != value)
                {
                    _IsActive = value;
                }
            }
        }
        private bool _IsActive;
        #endregion

        #region Navigation Properties
        public virtual ICollection<UserProfile> UserProfiles { get; set; }
        #endregion
    }
}

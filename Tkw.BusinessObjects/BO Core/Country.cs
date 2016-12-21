namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Country
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

        public virtual string IsoCode
        {
            get
            {
                return _IsoCode;
            }
            set
            {
                if (_IsoCode != value)
                {
                    _IsoCode = value;
                }
            }
        }
        private string _IsoCode;
        #endregion

        #region Navigation Properties
        public virtual ICollection<Address> Addresses
        {
            get;
            set;
        }
        #endregion
    }
}

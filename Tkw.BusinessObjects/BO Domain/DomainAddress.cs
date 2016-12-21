namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class DomainAddress : BaseAddress
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

        public virtual string CountryName
        {
            get
            {
                return _CountryName;
            }
            set
            {
                if (_CountryName != value)
                {
                    _CountryName = value;
                }
            }
        }
        private string _CountryName;
        #endregion

        #region Navigation Properties

        #endregion
    }
}
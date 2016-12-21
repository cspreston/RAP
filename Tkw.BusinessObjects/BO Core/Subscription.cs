namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class Subscription
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

        public virtual string CurrencyCode
        {
            get
            {
                return _CurrencyCode;
            }
            set
            {
                if (_CurrencyCode != value)
                {
                    _CurrencyCode = value;
                }
            }
        }
        private string _CurrencyCode;

        public virtual decimal Value
        {
            get
            {
                return _Value;
            }
            set
            {
                if (_Value != value)
                {
                    _Value = value;
                }
            }
        }
        private decimal _Value;

        public virtual TariffFeature Feature
        {
            get
            {
                return _Feature;
            }
            set
            {
                if (_Feature != value)
                {
                    _Feature = value;
                }
            }
        }
        private TariffFeature _Feature;

        #endregion

        #region Navigation Properties
        public virtual ICollection<UserSubscription> UserSubscriptions { get; set; }
        #endregion
    }
}

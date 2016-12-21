namespace BusinessObjects
{
    public abstract class BaseAddress:BaseDate
    {
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

        public virtual string City
        {
            get
            {
                return _City;
            }
            set
            {
                if (_City != value)
                {
                    _City = value;
                }
            }
        }
        private string _City;

        public virtual string PostCode
        {
            get
            {
                return _PostCode;
            }
            set
            {
                if (_PostCode != value)
                {
                    _PostCode = value;
                }
            }
        }
        private string _PostCode;

        public virtual int CountryId
        {
            get
            {
                return _CountryId;
            }
            set
            {
                if (_CountryId != value)
                {
                    _CountryId = value;
                }
            }
        }
        private int _CountryId;

        public virtual AddressFeatures Features
        {
            get
            {
                return _FeaturesId;
            }
            set
            {
                if (_FeaturesId != value)
                {
                    _FeaturesId = value;
                }
            }
        }
        private AddressFeatures _FeaturesId;
    }
}

namespace BusinessObjects
{
    public class BaseDate
    {
        public virtual string CreatedBy
        {
            get
            {
                return _CreatedBy;
            }
            set
            {
                if (_CreatedBy != value)
                {
                    _CreatedBy = value;
                }
            }
        }
        private string _CreatedBy;

        public virtual string UpdatedBy
        {
            get
            {
                return _UpdatedBy;
            }
            set
            {
                if (_UpdatedBy != value)
                {
                    _UpdatedBy = value;
                }
            }
        }
        private string _UpdatedBy;

        public virtual global::System.Nullable<System.DateTime> CreateDate
        {
            get
            {
                return _CreateDate;
            }
            set
            {
                if (_CreateDate != value)
                {
                    _CreateDate = value;
                }
            }
        }
        private global::System.Nullable<System.DateTime> _CreateDate;

        public virtual global::System.Nullable<System.DateTime> UpdateDate
        {
            get
            {
                return _UpdateDate;
            }
            set
            {
                if (_UpdateDate != value)
                {
                    _UpdateDate = value;
                }
            }
        }
        private global::System.Nullable<System.DateTime> _UpdateDate;

        public virtual global::System.Nullable<System.DateTime> InactiveDate
        {
            get
            {
                return _InactiveDate;
            }
            set
            {
                if (_InactiveDate != value)
                {
                    _InactiveDate = value;
                }
            }
        }
        private global::System.Nullable<System.DateTime> _InactiveDate;

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
    }
}

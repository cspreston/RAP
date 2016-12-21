namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class UserSubscription
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

        public virtual string UserId
        {
            get
            {
                return _UserId;
            }
            set
            {
                if (_UserId != value)
                {
                    _UserId = value;
                }
            }
        }
        private string _UserId;

        public virtual int SubscriptionId
        {
            get
            {
                return _SubscriptionId;
            }
            set
            {
                if (_SubscriptionId != value)
                {
                    _SubscriptionId = value;
                }
            }
        }
        private int _SubscriptionId;

        public virtual System.DateTime FromDate
        {
            get
            {
                return _FromDate;
            }
            set
            {
                if (_FromDate != value)
                {
                    _FromDate = value;
                }
            }
        }
        private System.DateTime _FromDate;

        public virtual System.DateTime? UntilDate
        {
            get
            {
                return _UntilDate;
            }
            set
            {
                if (_UntilDate != value)
                {
                    _UntilDate = value;
                }
            }
        }
        private System.DateTime? _UntilDate;

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
        public virtual Subscription Subscription { get; set; }
        public virtual User User { get; set; }
        #endregion
    }
}

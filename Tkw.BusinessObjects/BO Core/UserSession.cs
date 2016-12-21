namespace BusinessObjects
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class UserSession
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

        public virtual string SessionId
        {
            get
            {

                return _SessionId;
            }
            set
            {
                if (_SessionId != value)
                {
                    _SessionId = value;
                }
            }
        }
        private string _SessionId;

        public virtual string ClientIp
        {
            get
            {

                return _ClientIp;
            }
            set
            {
                if (_ClientIp != value)
                {
                    _ClientIp = value;
                }
            }
        }
        private string _ClientIp;

        public virtual string ClientAgent
        {
            get
            {

                return _ClientAgent;
            }
            set
            {
                if (_ClientAgent != value)
                {
                    _ClientAgent = value;
                }
            }
        }
        private string _ClientAgent;

        public virtual bool LoggedIn
        {
            get
            {

                return _LoggedIn;
            }
            set
            {
                if (_LoggedIn != value)
                {
                    _LoggedIn = value;
                }
            }
        }
        private bool _LoggedIn;

        public virtual global::System.Nullable<System.DateTime> LoggedInDate
        {
            get
            {
                return _LoggedInDate;
            }
            set
            {
                if (_LoggedInDate != value)
                {
                    _LoggedInDate = value;
                }
            }
        }
        private global::System.Nullable<System.DateTime> _LoggedInDate;

        public virtual global::System.Nullable<System.DateTime> LoggedOutDate
        {
            get
            {
                return _LoggedOutDate;
            }
            set
            {
                if (_LoggedOutDate != value)
                {
                    _LoggedOutDate = value;
                }
            }
        }
        private global::System.Nullable<System.DateTime> _LoggedOutDate;
        #endregion

        #region Navigation Properties
        public virtual User User
        {
            get;
            set;
        }
        #endregion
    }
}

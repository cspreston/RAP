namespace BusinessObjects
{
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Security.Claims;
    using System.Threading.Tasks;

    public partial class User : IdentityUser 
    {
        #region Properties
        public virtual Nullable<int> DataBaseId
        {
            get
            {
                return _DataBaseId;
            }
            set
            {
                if (_DataBaseId != value)
                {
                    _DataBaseId = value;
                }
            }
        }
        private Nullable<int> _DataBaseId;

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual UserType Type
        {
            get
            {
                return _TypeId;
            }
            set
            {
                if (_TypeId != value)
                {
                    _TypeId = value;
                }
            }
        }
        private UserType _TypeId;

        public string LastUsedCompanyId { get; set; }
        /// <summary>
        /// TODO - remove this after we have the amazon email sending done...
        /// </summary>
        public string RawPassword { get; set; }
        #endregion

        #region Navigation Properties
        public virtual DomainDataBase DataBase { get; set; }
        public virtual UserProfile UserProfile { get; set; }
        public virtual ICollection<UserSession> UserSessions { get; set; }
        public virtual ICollection<UserSubscription> UserSubscriptions { get; set; }
        public virtual ICollection<UserCompany> UserCompanies { get; set; }
        public virtual Company LastUsedCompany { get; set; }
        #endregion

        #region Methods
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager, string authenticationType)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
            // Add custom user claims here

            userIdentity.AddClaim(new Claim("UserId", this.Id));
            userIdentity.AddClaim(new Claim("DataBaseId", this.DataBaseId.HasValue ? this.DataBaseId.Value.ToString() : string.Empty));
            userIdentity.AddClaim(new Claim("DataBase", this.DataBaseId.HasValue && this.DataBase != null ? this.DataBase.ScreenName : string.Empty));
            userIdentity.AddClaim(new Claim("Culture", this.UserProfile != null && this.UserProfile.Globalization != null ? this.UserProfile.Globalization.Locale : Tools.DefaultValues.DEFAULT_CULUTURE));
            userIdentity.AddClaim(new Claim("Email", this.Email != null ? this.Email : string.Empty));
            userIdentity.AddClaim(new Claim("LastUsedCompanyId", this.LastUsedCompanyId!=null? this.LastUsedCompanyId:string.Empty));
            
            return userIdentity;
            
        }

        #endregion
    }
}

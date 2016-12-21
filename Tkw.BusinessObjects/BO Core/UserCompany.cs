namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class UserCompany : BaseDate
    {
        #region Properties

        public virtual string CompanyId { get; set; }

        public virtual string UserId { get; set; }

        #endregion

        #region Navigation Properties

        public virtual Company Company { get; set; }

        public virtual User User { get; set; }

        #endregion
    }
}
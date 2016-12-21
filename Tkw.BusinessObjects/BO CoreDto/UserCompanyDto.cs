namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using System.Linq;

    [DataContract(Name = "UserCompany", Namespace = "http://www.yourcompany.com/types/")]
    public class UserCompanyDto
    {
        [DataMember]
        public virtual int Id { get; set; }

        #region Properties
        [DataMember]
        public virtual string CompanyId { get; set; }

        [DataMember]
        public virtual string UserId { get; set; }

        [DataMember]
        public bool IsActive { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> InactiveDate { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> UpdateDate { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> CreateDate { get; set; }

        #endregion

        #region Navigation Properties

        [DataMember]
        public virtual CompanyDto Company { get; set; }

        [DataMember]
        public virtual UserDto User { get; set; }

        #endregion
    }
}
namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Actor", Namespace = "http://www.yourcompany.com/types/")]
    public class ActorDto
    {
        [DataMember]
        public virtual string Id { get; set; }

        [DataMember]
        public virtual string Name { get; set; }

        [DataMember]
        public virtual ActorType Type { get; set; }

        [DataMember]
        public virtual string CreatedBy { get; set; }

        [DataMember]
        public virtual string UpdatedBy { get; set; }

        [DataMember]
        public bool IsActive { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> InactiveDate { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> UpdateDate { get; set; }

        [DataMember]
        public global::System.Nullable<System.DateTime> CreateDate { get; set; }

        #region Navigation Properties
        #endregion
    }
}

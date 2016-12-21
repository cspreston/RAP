namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public partial class Address : BaseAddress
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
        #endregion

        #region Navigation Properties
        public virtual Country Country
        {
            get;
            set;
        }
        public virtual ICollection<UserProfile> UserProfile
        {
            get;
            set;
        }
        
        #endregion
    }
}

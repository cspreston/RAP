using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public partial class FileBucketTypes : BaseDate
    {
        #region Properties
        [Key]

        public virtual int Id { get; set; }
        public virtual string Name { get; set; }
        #endregion

        #region Navigation Properties
        public ICollection<FileBuckets> FileBuckets { get; set; }
        #endregion


    }
}

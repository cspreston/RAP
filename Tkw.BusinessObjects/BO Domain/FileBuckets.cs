using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public partial class FileBuckets : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }

        public virtual string Name { get; set; }
        public virtual int FileBucketTypeId { get; set; }
        public virtual string PhysicalPath { get; set; }
        #endregion

        #region Navigation Properties
        public ICollection<Files> Files { get; set; }
        public FileBucketTypes FileBucketType { get; set; }
        #endregion
    }
}

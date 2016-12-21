using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class HotspotActionType : BaseDate
    {
        #region Properties
        [Key]
        public virtual int Id { get; set; }

        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual bool AllowAttachment { get; set; }
        public virtual string AllowedFileTypes { get; set; }
        #endregion

    }

}

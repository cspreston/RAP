﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class Files : BaseDate
    {
        #region Properties
        [Key]
        public virtual string Id { get; set; }


        public virtual string Name { get; set; }
        public virtual string Description { get; set; }
        public virtual string FileBucketId { get; set; }

        #endregion

        #region Navigation Properties
        public FileBuckets FileBucket { get; set; }
        public ICollection<BuildingImage> BuildingImages { get; set; }
        #endregion
    }
}


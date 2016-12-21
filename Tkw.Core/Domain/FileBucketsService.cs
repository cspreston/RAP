namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class FileBucketsService : TkwService<FileBuckets>, IFileBucketsService
    {
        public FileBucketsService(IRepository<FileBuckets> repository, Service service)
            : base(repository, service)
        {
        }
    }
}
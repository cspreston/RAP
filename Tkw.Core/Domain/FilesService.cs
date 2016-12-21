namespace Domain
{
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Domain;

    public partial class FilesService : TkwService<Files>, IFilesService
    {
        public FilesService(IRepository<Files> repository, Service service)
            : base(repository, service)
        {
        }

    }
}
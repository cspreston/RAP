namespace Common
{
    public class BaseService<T> where T : class
    {
        #region variables
        protected IRepository<T> _repository;
        protected Service _service;
        #endregion

        #region Constructors
        public BaseService(IRepository<T> repository, Service service)
        {
            this._repository = repository;
            this._service = service;
        }
        #endregion
    }
}

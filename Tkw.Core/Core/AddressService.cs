namespace Core
{
    using BusinessObjects;
    using Common;
    using Common.Core;

    public partial class AddressService : TkwService<Address>, IAddressService
    {
        public AddressService(IRepository<Address> repository, Service service)
            : base(repository, service) { }

        void GetAdi()
        {
            base.GetAll();
        }
    }
}
namespace Domain
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using BusinessObjects;
    using Common;
    using Common.Domain;
    using System.IO;
    using Excel;
    public partial class ContactInfoService : TkwService<ContactInfo>, IContactInfoService
    {
        private const string EXCEL_OLD_EXTENSION = ".xls";

        public ContactInfoService(IRepository<ContactInfo> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<ContactInfo> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }

        public async Task<IList<ContactInfoDto>> ImportFromFile(string buildingId, string filePath)
        {
            var items = new List<ContactInfo>();

            using (FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read))
            {
                string extension = filePath.Substring(filePath.LastIndexOf("."));
                IExcelDataReader excelReader = extension == EXCEL_OLD_EXTENSION
                    ? ExcelReaderFactory.CreateBinaryReader(stream)
                    : ExcelReaderFactory.CreateOpenXmlReader(stream);

                //read header and ignore it
                excelReader.Read();
                while (excelReader.Read())
                {
                    var contactInfo = new ContactInfo();

                    contactInfo.Id = Guid.NewGuid().ToString();
                    contactInfo.BuildingId = buildingId;
                    contactInfo.IsActive = true;
                    contactInfo.LastName = string.Empty;
                    contactInfo.Title = excelReader.GetString(0);
                    contactInfo.FirstName = excelReader.GetString(1);
                    contactInfo.LastName = excelReader.GetString(2);
                    contactInfo.Address = excelReader.GetString(3);
                    contactInfo.SecondAddress = excelReader.GetString(4);
                    contactInfo.City = excelReader.GetString(5);
                    contactInfo.State = excelReader.GetString(6);
                    contactInfo.Zip = excelReader.GetString(7);
                    contactInfo.Role = excelReader.GetString(8);
                    contactInfo.EmailAddress = excelReader.GetString(9);
                    contactInfo.Phone = excelReader.GetString(10);
                    contactInfo.MobilePhone = excelReader.FieldCount > 11 ? excelReader.GetString(11):string.Empty;
                    items.Add(contactInfo);
                }
            }

            await this.BulkInsertAsync(items.Where(t => t.FirstName != null).ToList());
            var response = items.Select(e => new ContactInfoDto() {
                Id = e.Id,
                BuildingId = e.BuildingId,
                Title = e.Title,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Role = e.Role,
                EmailAddress = e.EmailAddress,
                Phone = e.Phone,
                MobilePhone = e.MobilePhone,
                Address = e.Address,
                SecondAddress = e.SecondAddress,
                City = e.City,
                State = e.State,
                Zip = e.Zip
            });
            return response.ToList();
        }
    }
}
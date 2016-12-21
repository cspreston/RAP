namespace Domain
{
    using System.Collections.Generic;
    using BusinessObjects;
    using Common;
    using Common.Domain;
    using System.Linq;
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Excel;

    public partial class PricingInfoService : TkwService<PricingInfo>, IPricingInfoService
    {
        private const string EXCEL_OLD_EXTENSION = ".xls";

        public PricingInfoService(IRepository<PricingInfo> repository, Service service)
            : base(repository, service)
        {
        }

        public IQueryable<PricingInfo> GetAll(bool isActive = true)
        {
            return base.GetAll().Where(x => x.IsActive == isActive);
        }

        public async Task<IList<PricingInfoDto>> ImportFromFile(string buildingId, string filePath)
        {
            var items = new List<PricingInfo>();

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
                    var priceInfo = new PricingInfo();

                    priceInfo.Id = Guid.NewGuid().ToString();
                    priceInfo.BuildingId = buildingId;
                    priceInfo.Name = excelReader.GetString(0);
                    priceInfo.Description = excelReader.GetString(1);
                    priceInfo.UnitPrice = excelReader.GetDouble(2);
                    priceInfo.Quantity = excelReader.GetInt32(3);
                    priceInfo.Units = excelReader.GetString(3);
                    priceInfo.IsActive = true;

                    items.Add(priceInfo);
                }
            }
            await this.BulkInsertAsync(items);
            var response = items.Select(e => new PricingInfoDto()
            {
                Id = e.Id,
                BuildingId = e.BuildingId,
                Name = e.Name,
                Description = e.Description,
                UnitPrice = e.UnitPrice,
                Quantity = e.Quantity,
                Units = e.Units
            });
            return response.ToList();
        }
    }
}
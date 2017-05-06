using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using BusinessObjects;
using Common;
using Common.Domain;

namespace Web.Client.Net.Areas.Conf.Api
{
    [Authorize]
    public class AwsContactInfoController : BaseApiController
    {
        [ResponseType(typeof(IList<ContactInfoDto>))]
        public async Task<IHttpActionResult> Post([FromBody] IList<ContactInfo> contacts)
        {
            try
            {
                var serviceManager = new Service(DataBaseId, UserId).GetService<IContactInfoService>();
                var newContacts = new List<ContactInfo>();

                foreach (var contact in contacts)
                {
                    ContactInfo newContact = serviceManager.Create();

                    newContact.Id = Guid.NewGuid().ToString();
                    newContact.BuildingId = contact.BuildingId;
                    newContact.Title = contact.Title;
                    newContact.FirstName = contact.FirstName;
                    newContact.LastName = contact.LastName;
                    newContact.Role = contact.Role;
                    newContact.EmailAddress = contact.EmailAddress;
                    newContact.Phone = contact.Phone;
                    newContact.MobilePhone = contact.MobilePhone;
                    newContact.Address = contact.Address;
                    newContact.SecondAddress = contact.SecondAddress;
                    newContact.City = contact.City;
                    newContact.State = contact.State;
                    newContact.Zip = contact.Zip;

                    await serviceManager.AddAsync(newContact);

                    newContacts.Add(contact);
                }

                var response = newContacts.Select(e => new ContactInfoDto()
                {
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

                return Ok(response.ToList());
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
    }
}
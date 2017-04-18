using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Web.Client.Net.Controllers
{
    [AllowAnonymous]
    public class RootController : Controller
    {
        // GET: Root
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Customers()
        {
            List<CompanyDto> companies = new List<CompanyDto>();
            return View(companies);
        }

        public ActionResult CreateCustomer()
        {
            Models.TenantModel model = new Models.TenantModel();
            return View(model);
        }

        public ActionResult Users()
        {
            List<UserDto> users = new List<UserDto>();
            return View(users);
        }

        public ActionResult Roles()
        {
            List<RoleDto> roles = new List<RoleDto>();
            return View(roles);
        }

        public ActionResult Clients()
        {
            List<CompanyDto> items = new List<CompanyDto>();
            return View(items);
        }
    }
}
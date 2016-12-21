using System.Web.Mvc;
using Web.Client.Net.Areas;

namespace Web.Client.Net
{
    public class IndexController : BaseAsyncController
    {
        // GET: Index
        public ActionResult Index()
        {
            return Redirect("/Index.html");
        }
    }
}
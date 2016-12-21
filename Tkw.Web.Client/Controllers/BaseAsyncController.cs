using Common;
using System;
using System.Data.Entity.Validation;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Web.Client.Net.Areas
{
    public abstract class BaseAsyncController : AsyncController
    {

        #region Properties
        private UserManager _userManager;
        protected UserManager UserManager
        {
            get
            {
                //return _userManager ?? HttpContext.GetOwinContext().GetUserManager<UserManager>();
                return _userManager ?? new UserManager();
            }
             set
            {
                _userManager = value;
            }
        }

        private SignInManager _signInManager;
        public SignInManager SignInManager
        {
            get
            {
                //return _signInManager ?? HttpContext.GetOwinContext().Get<SignInManager>();
                return _signInManager ?? new SignInManager(UserManager, HttpContext.GetOwinContext().Authentication);
            }
            set { _signInManager = value; }
        }
       
        
        #endregion

        #region Initialize
        protected override void Initialize(RequestContext requestContext)
        {

           
            base.Initialize(requestContext);
        }
        #endregion

        #region Json Results
        internal JsonResult ErrorJson(Exception ex)
        {
            string message = ErrorString(ex);
            return ErrorJson(message);
        }

        internal JsonResult ErrorJson(ModelStateDictionary modelState)
        {
            string message = ErrorString(modelState);
            return ErrorJson(message);
        }

        internal JsonResult ErrorJson(string text)
        {
            string message = text;

            JsonResult jsonOutput;
            jsonOutput = Json(Json(new { success = false, message = message }));
            return jsonOutput;
        }
        #endregion

        #region String Error Results
        internal string ErrorString(Exception ex)
        {
            Elmah.ErrorSignal.FromCurrentContext().Raise(ex);

            string message = string.Empty;
            if (ex is DbEntityValidationException)
            {
                var entityException = (DbEntityValidationException)ex;
                foreach (var error in entityException.EntityValidationErrors)
                {
                    message += "Error: " + String.Join(", ", error.ValidationErrors.Select(a => a.ErrorMessage)) + Environment.NewLine;
                }
            }
            else
            {
                message = ex.Message;
                if (ex.InnerException != null)
                {
                    message = message + Environment.NewLine + ex.InnerException.Message;
                    if (ex.InnerException.InnerException != null)
                    {
                        message = message + Environment.NewLine + ex.InnerException.InnerException.Message;
                    }
                }
            }
            return message;
        }

        internal string ErrorString(ModelStateDictionary modelState)
        {
            string message = string.Empty;
            foreach (var model in modelState.Where(a => a.Value.Errors.Count() > 0))
            {
                message += "Error: " + String.Join(", ", model.Value.Errors.Select(a => a.ErrorMessage)) + Environment.NewLine;
            }
            return message;
        }

        #endregion

        #region Util Methods
        internal static void RaiseErrorSignal(Exception ex)
        {
            Elmah.ErrorSignal.FromCurrentContext().Raise(ex);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
        }

        protected override void OnException(ExceptionContext filterContext)
        {
            RaiseErrorSignal(filterContext.Exception);
            base.OnException(filterContext);
        }
        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
        }

        protected void ClearSessionData()
        {
            using (var service = new Service())
            {
                var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;

                string sessionId = principal.Claims.Any(x => x.Type == "SessionId") ? principal.Claims.FirstOrDefault(x => x.Type == "SessionId").Value : string.Empty;
                var userId = principal.Claims.Any(x => x.Type == "UserId") ? principal.Claims.FirstOrDefault(x => x.Type == "UserId").Value : string.Empty;

                var userSessionService = service.GetService<Common.Core.IUserSessionService>();
                var userSessions = userSessionService.GetAll().Where(x => x.UserId == userId && x.LoggedIn && x.SessionId == sessionId).ToList();
                if (userSessions.Any())
                {
                    userSessions.ForEach(x =>
                    {
                        x.LoggedIn = false;
                        x.LoggedOutDate = System.DateTime.Now;
                        userSessionService.Update(x);
                    });
                    service.Commit();
                }
            }
        }
        #endregion
    }
}
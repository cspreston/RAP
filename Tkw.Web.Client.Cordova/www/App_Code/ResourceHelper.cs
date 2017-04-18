using System.Resources;

namespace Web.Client.Net
{
    public static class ResourceHelper
    {
        public static ResourceManager TkwResource
        {
            get
            {
                return BusinessObjects.Resources.Tkw.ResourceManager;
            }
        }
    }
}
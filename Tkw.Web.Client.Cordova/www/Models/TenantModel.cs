using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace Web.Client.Net.Models
{
    public class TenantModel
    {

        [Display(Name = "News")]
        public string Name { get; set; }

    }
   
}
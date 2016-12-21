namespace BusinessObjects
{
    using System.ComponentModel.DataAnnotations;

    public class Email
    {
        [Display(Name = "SMTP Username")]
        public string SMTPUsername { get; set; }
        [Display(Name = "SMTP Password")]
        public string SMTPPassword { get; set; }
        [Display(Name = "SMTP Server")]
        public string SMTPServer { get; set; }
        [Display(Name = "SMTP Port")]
        public int SMTPPort { get; set; }
        [Display(Name = "Enable Ssl")]
        public bool EnableSsl { get; set; }
        [Display(Name = "Use SMTP Authentication")]
        public bool UseSMTPAuthentication { get; set; }

        [Display(Name = "Sender User Name")]
        public string SenderUserName { get; set; }
        [Display(Name = "Default BCC Address")]
        public string RecipientBCCAddress { get; set; }
        [Display(Name = "Default Recipient Address")]
        public string DefaultRecipientAddress { get; set; }
        [Display(Name = "Subject")]
        public string Subject { get; set; }
        [Display(Name = "Message")]
        [System.Web.Mvc.AllowHtml]
        public string Message { get; set; }

        public EmailType Type { get; set; }

        public string Culture { get; set; }
    }
}

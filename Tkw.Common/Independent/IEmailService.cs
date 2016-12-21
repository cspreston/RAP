namespace Common.Independent
{
    using System.Collections.Generic;
    using BusinessObjects;

    public interface IEmailService
    {
        bool SendEmail(EmailType type, bool loadContentFromTemplate, string senderUserName, string recipientAddress, string recipientCCAddress, string recipientBCCAddress, string subject, string message,
                       Dictionary<string, string> attachments, out string error,string culture = null);
        Email GetEmailSettings(EmailType type, string culture = null);
        bool SaveEmailSettings(EmailType type, string smtpUsername, string smtpPassword, string smtpServer, int smtpPort, bool enableSsl, bool useSMTPAuthentication, string senderUserName, string defaultRecipientAddress,
                               string recipientBCCAddress, string subject, string message, string culture = null);

        bool SendEmailAws(EmailType type, bool loadContentFromTemplate, string senderUserName, string recipientAddress, string recipientCCAddress, string recipientBCCAddress, string subject, string message,
                              Dictionary<string, string> attachments, out string error, string culture = null);
    }
}


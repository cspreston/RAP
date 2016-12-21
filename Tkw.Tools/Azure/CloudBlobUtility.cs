using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;

namespace Tools
{
    public class CloudBlobUtility
    {
        public string ConnectionString { get; private set; }
        public string ContainerName { get; private set; }

        public CloudBlobUtility(string connectionString, string containerName)
        { 
            ConnectionString = connectionString;
            ContainerName = containerName;
        }

        public CloudBlobContainer Container
        {
            get
            {
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConnectionString);
                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

                CloudBlobContainer container = blobClient.GetContainerReference(ContainerName);
                container.CreateIfNotExist();
                container.SetPermissions(new BlobContainerPermissions() { PublicAccess = BlobContainerPublicAccessType.Blob });

                return container;
            }
        }

        public CloudBlob UploadMediaFromURL(string connectionString, string containerName, string url)
        {
            string filename = Path.GetFileName(url).Replace(' ', '_'); ;
            byte[] response = new System.Net.WebClient().DownloadData(url);
            var blob = Container.GetBlobReference(filename);
            blob.UploadByteArray(response);
            return blob;
        }

        public CloudBlob UploadMedia(MemoryStream ms, string filename)
        {
            byte[] arr;
            arr = ms.ToArray();
            var blob = Container.GetBlobReference(filename);
            blob.UploadByteArray(arr);
            return blob;
        }

        public MemoryStream DownloadMedia(string filename)
        {
            MemoryStream ms = new MemoryStream();
            var blob = Container.GetBlobReference(filename);
            blob.DownloadToStream(ms);
            return ms;
        }

        public CloudBlob UploadFile(string filePath, string filename)
        {
            var blob = Container.GetBlobReference(filename);
            blob.UploadFile(filePath);
            return blob;
        }

        public string UploadFileReturnUri(string filePath, string filename)
        {
            var blob = Container.GetBlobReference(filename);
            blob.UploadFile(filePath);
            return blob.Uri.AbsoluteUri.Replace("https", "http");
        }

        public void UploadImage(string filePath, string filename)
        {
            Image img = Image.FromFile(filePath);
            byte[] arr;
            using (MemoryStream ms = new MemoryStream())
            {
                img.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
                arr = ms.ToArray();
            }

            var blob = Container.GetBlobReference(filename);
            blob.UploadByteArray(arr);
        }

        public void UploadVideo(string filePath, string filename)
        {
            FileStream mystream = File.Open(filePath, FileMode.Open);
            byte[] myarray = new byte[mystream.Length];
            mystream.Read(myarray, 0, (int)mystream.Length);
            mystream.Close();

            var blob = Container.GetBlobReference(filename);
            blob.UploadByteArray(myarray);
        }

        public string GetBlobUrl(string filename)
        {
            var blob = Container.GetBlobReference(filename);
            return blob.Uri.ToString();
        }

        public void DeleteFile(string filepath)
        {
            var blob = Container.GetBlobReference(filepath);
            if (blob != null)
                blob.DeleteIfExists();
        }
    }
}

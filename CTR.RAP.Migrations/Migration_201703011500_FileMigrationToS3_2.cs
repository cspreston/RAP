using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CTR.RAP.Migrations.Extensions;
using FluentMigrator;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CTR.RAP.Migrations
{
    [Tags("S3FileMigration2")]
    [Migration(201703011500)]
    public class Migration_201703011500_FileMigrationToS3_2 : Migration
    {
        private const string migrationId = "0CE5E30F-ED5A-4BEF-BAA9-68E11D843650";
        private string rootPath = "";

        public override void Up()
        {
            switch ((string)ApplicationContext)
            {
                case "Test":
                    rootPath = "C:/inetpub/wwwroot/RAPTEST/";
                    break;

                case "Prod":
                    rootPath = "C:/inetpub/wwwroot/RAP/";
                    break;

                default:
                    rootPath = "E:/Solutions/Git/CTR/";
                    break;
            }

            Create.RapTable("FileMigrationErrors")
                .WithColumn("MigrationId").AsString(128).NotNullable()
                .WithColumn("FileId").AsString(128).NotNullable()
                .WithColumn("BuildingId").AsString(128).NotNullable()
                .WithColumn("FileBucketId").AsString(128).NotNullable()
                .WithColumn("BuildingName").AsString().NotNullable()
                .WithColumn("ClientName").AsString().NotNullable()
                .WithColumn("FilePath").AsString().NotNullable()
                .WithColumn("FileType").AsString().NotNullable()
                .WithColumn("Error").AsString().NotNullable()
                .WithAuditColumns();

            Execute.WithConnection(migrateAllFiles);
        }

        public override void Down()
        {
            Delete.Table("FileMigrationErrors");
        }

        private void migrateAllFiles(IDbConnection conn, IDbTransaction tran)
        {
            var processFileData = new List<dynamic>();
            var columns = new
            {
                BuildingId = 0,
                FileId = 1,
                FileBucketId = 2,
                FileType = 3,
                FilePath = 4,
                BuildingName = 5,
                ClientName = 6
            };

            // Get the files data
            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                cmd.Transaction = tran;
                cmd.CommandText = this.GetEmbeddedSql("FileMigrationToS3_2_AllFiles.sql");

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic fileData = new ExpandoObject();

                        fileData.BuildingId = reader.GetString(columns.BuildingId);
                        fileData.FileId = reader.GetString(columns.FileId);
                        fileData.FileBucketId = reader.GetString(columns.FileBucketId);
                        fileData.FileType = reader.GetString(columns.FileType);
                        fileData.FilePath = reader.GetString(columns.FilePath);
                        fileData.BuildingName = reader.GetString(columns.BuildingName);
                        fileData.ClientName = reader.GetString(columns.ClientName);

                        processFileData.Add(fileData);
                    }
                }
            }

            migrateBuildingFiles(conn, tran, processFileData.Where(fd => fd.FileType == "File").ToList());
            migrateBuildingImages(conn, tran, processFileData.Where(fd => fd.FileType == "Image").ToList());
            migrateHotspotImages(conn, tran, processFileData.Where(fd => fd.FileType == "Hotspot").ToList());
            migrateBuildingDisasterInfos(conn, tran, processFileData.Where(fd => fd.FileType == "Info").ToList());
            migrateBuildingPlans(conn, tran, processFileData.Where(fd => fd.FileType == "Plan").ToList());
        }

        private void migrateBuildingFiles(IDbConnection conn, IDbTransaction tran, List<dynamic> processFileData)
        {
            var updateRecords = new List<ExpandoObject>();
            var errorRecords = new List<ExpandoObject>();

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" + 
                    (processData.BuildingName as string).KebabCase() + "/files/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var uploadResult = uploadFile(uploadData);

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Update the Files record with the new url
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = uploadResult.location;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "SourceFile";
                    fileUpdate.FieldValue = uploadResult.sourceFile;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Dimensions";
                    fileUpdate.FieldValue = uploadResult.dimensions;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = uploadResult.error;
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in errorRecords)
            {
                // Create the new FileMigrationErrors record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var error = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "FileMigrationErrors", error);
                }
            }
        }

        private void migrateBuildingImages(IDbConnection conn, IDbTransaction tran, List<dynamic> processFileData)
        {
            var updateRecords = new List<ExpandoObject>();
            var errorRecords = new List<ExpandoObject>();

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/images/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var uploadResult = uploadFile(uploadData);
                var thumbLocation = "";

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Create a thumbnail image
                    dynamic thumbData = new ExpandoObject();

                    thumbData.sourceFile = targetPath.ToLower();
                    thumbData.targetFile = targetPath.ToLower().Replace("/images/", "/thumbs/");
                    thumbData.thumbWidth = 200;

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Thumb " + thumbData.targetFile);

                    thumbLocation = createThumbImage(thumbData);
                }

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = uploadResult.location;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "SourceFile";
                    fileUpdate.FieldValue = uploadResult.sourceFile;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Dimensions";
                    fileUpdate.FieldValue = uploadResult.dimensions;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.FilePath = processData.FilePath;
                    errorData.Error = uploadResult.error;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }

                if (!string.IsNullOrEmpty(thumbLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ThumbUrl";
                    fileUpdate.FieldValue = thumbLocation;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Thumb Creation Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = "Thumb Creation Failed";
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in errorRecords)
            {
                // Create the new FileMigrationErrors record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var error = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "FileMigrationErrors", error);
                }
            }
        }

        private void migrateBuildingDisasterInfos(IDbConnection conn, IDbTransaction tran, List<dynamic> processFileData)
        {
            var updateRecords = new List<ExpandoObject>();
            var errorRecords = new List<ExpandoObject>();

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/info/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var uploadResult = uploadFile(uploadData);

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Update the Files record with the new url
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = uploadResult.location;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "SourceFile";
                    fileUpdate.FieldValue = uploadResult.sourceFile;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Dimensions";
                    fileUpdate.FieldValue = uploadResult.dimensions;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.FilePath = processData.FilePath;
                    errorData.Error = uploadResult.error;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in errorRecords)
            {
                // Create the new FileMigrationErrors record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var error = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "FileMigrationErrors", error);
                }
            }
        }

        private void migrateBuildingPlans(IDbConnection conn, IDbTransaction tran, List<dynamic> processFileData)
        {
            var updateRecords = new List<ExpandoObject>();
            var errorRecords = new List<ExpandoObject>();

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/plans/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                var fileName = targetPath.Split('/').Last();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var uploadResult = uploadFile(uploadData);
                var thumbLocation = "";
                var zoomLocation = "";

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Create a thumbnail image
                    dynamic thumbData = new ExpandoObject();

                    thumbData.sourceFile = targetPath.ToLower();
                    thumbData.targetFile = targetPath.ToLower().Replace("/plans/", "/thumbs/");
                    thumbData.thumbWidth = 200;

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Thumb " + thumbData.targetFile);

                    thumbLocation = createThumbImage(thumbData);

                    // Create a deep zoom image
                    dynamic zoomData = new ExpandoObject();

                    zoomData.sourceFile = targetPath.ToLower();
                    zoomData.targetFolder = targetPath.Replace("/" + fileName, "");

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Zoom " + zoomData.targetFolder);

                    zoomLocation = createZoomImage(zoomData);
                }

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = uploadResult.location;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "SourceFile";
                    fileUpdate.FieldValue = uploadResult.sourceFile;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Dimensions";
                    fileUpdate.FieldValue = uploadResult.dimensions;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = uploadResult.error;
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }

                if (!string.IsNullOrEmpty(thumbLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ThumbUrl";
                    fileUpdate.FieldValue = thumbLocation;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Thumb Creation Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = "Thumb Creation Failed";
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }

                if (!string.IsNullOrEmpty(zoomLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ZoomUrl";
                    fileUpdate.FieldValue = zoomLocation;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Zoom Creation Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = "Zoom Creation Failed";
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in errorRecords)
            {
                // Create the new FileMigrationErrors record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var error = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "FileMigrationErrors", error);
                }
            }
        }

        private void migrateHotspotImages(IDbConnection conn, IDbTransaction tran, List<dynamic> processFileData)
        {
            var updateRecords = new List<ExpandoObject>();
            var errorRecords = new List<ExpandoObject>();

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/hotspots/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var uploadResult = uploadFile(uploadData);
                var thumbLocation = "";

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Create a thumbnail image
                    dynamic thumbData = new ExpandoObject();

                    thumbData.sourceFile = targetPath.ToLower();
                    thumbData.targetFile = targetPath.ToLower().Replace("/hotspots/", "/thumbs/");
                    thumbData.thumbWidth = 200;

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Thumb " + thumbData.targetFile);

                    thumbLocation = createThumbImage(thumbData);
                }

                if (!string.IsNullOrEmpty(uploadResult.location))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = uploadResult.location;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "SourceFile";
                    fileUpdate.FieldValue = uploadResult.sourceFile;

                    updateRecords.Add(fileUpdate);

                    fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Dimensions";
                    fileUpdate.FieldValue = uploadResult.dimensions;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.FilePath = processData.FilePath;
                    errorData.Error = uploadResult.error;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }

                if (!string.IsNullOrEmpty(thumbLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ThumbUrl";
                    fileUpdate.FieldValue = thumbLocation;

                    updateRecords.Add(fileUpdate);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Thumb Creation Failed");

                    // Save the error data
                    dynamic errorData = new ExpandoObject();

                    errorData.Id = Guid.NewGuid().ToString();
                    errorData.MigrationId = migrationId;
                    errorData.FileId = processData.FileId;
                    errorData.BuildingId = processData.BuildingId;
                    errorData.FileBucketId = processData.FileBucketId;
                    errorData.FileType = processData.FileType;
                    errorData.Error = "Thumb Creation Failed";
                    errorData.FilePath = processData.FilePath;
                    errorData.BuildingName = processData.BuildingName;
                    errorData.ClientName = processData.ClientName;
                    errorData.CreatedBy = migrationId;
                    errorData.CreatedDate = DateTime.Now;

                    errorRecords.Add(errorData);
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in errorRecords)
            {
                // Create the new FileMigrationErrors record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var error = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "FileMigrationErrors", error);
                }
            }
        }

        private void rollbackDataChanges(IDbConnection conn, IDbTransaction tran)
        {
            var updateRecords = new List<ExpandoObject>();
            var columns = new
            {
                TableName = 0,
                RecordId = 1,
                Details = 2
            };

            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                var sql = @"select TableName, RecordId, Details from dbo.MigrationDataChanges where MigrationId = '{0}'";

                cmd.Transaction = tran;
                cmd.CommandText = string.Format(sql, migrationId);

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic update = new ExpandoObject();

                        var details = JObject.Parse(reader.GetString(columns.Details));

                        update.TableName = reader.GetString(columns.TableName);
                        update.RecordId = reader.GetString(columns.RecordId);
                        update.FieldName = details.SelectToken("FieldName").Value<string>();
                        update.FieldValue = details.SelectToken("OriginalValue").Value<string>();

                        updateRecords.Add(update);
                    }
                }
            }

            foreach (dynamic record in updateRecords)
            {
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }
        }

        private void insertRecord(IDbCommand command, string schema, string table, IEnumerable<KeyValuePair<string, object>> record)
        {
            const string sql = "insert into {0}.{1} ({2}) values ({3})";
            var columns = new List<string>();
            var values = new List<string>();

            foreach (var kvp in record)
            {
                string paramName = "@" + kvp.Key;
                object paramValue = kvp.Value;

                if (paramValue != null)
                {
                    command.Parameters.Add(new SqlParameter(paramName, paramValue));

                    columns.Add(kvp.Key);
                    values.Add(paramName);
                }
            }

            string colString = "[" + String.Join("],[", columns.ToArray()) + "]";
            string valString = String.Join(",", values.ToArray());

            command.CommandText = String.Format(sql, schema, table, colString, valString);
            command.ExecuteNonQuery();
        }

        private void updateRecord(IDbCommand command, string schema, dynamic update)
        {
            const string sql = "update {0}.{1} set {2} = {3} where [Id] = {4}";

            var newValue = (update.FieldValue is string) ? "'" + update.FieldValue.Replace("'", "''") + "'" : update.FieldValue;
            var recordId = "'" + update.RecordId + "'" ;

            command.CommandText = String.Format(sql, schema, update.TableName, update.FieldName, newValue, recordId);
            command.ExecuteNonQuery();
        }

        private dynamic uploadFile(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/s3/upload", request).Result;

                //response.EnsureSuccessStatusCode();

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var json = JObject.Parse(result);
                            dynamic uploadResult = new ExpandoObject();

                            if (json.SelectToken("error") != null)
                            {
                                uploadResult.error = JObject.Parse(result).SelectToken("error").Value<string>();
                                uploadResult.location = "";
                                uploadResult.sourceFile = "";
                                uploadResult.dimensions = "";
                            }
                            else
                            {
                                uploadResult.location = JObject.Parse(result).SelectToken("data.Location", true).Value<string>();
                                uploadResult.sourceFile = JObject.Parse(result).SelectToken("data.sourceFile", true).Value<string>();
                                uploadResult.dimensions = JObject.Parse(result).SelectToken("data.dimensions", true).Value<string>();
                            }
                            return uploadResult;
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

        private string createThumbImage(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/lambda/create/thumb", request).Result;

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var location = JObject.Parse(result).SelectToken("Location", true).Value<string>();

                            return location;
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

        private string createZoomImage(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/lambda/create/zoom", request).Result;

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var files = JArray.Parse(result);
                            var location = files.FirstOrDefault(f => f.SelectToken("Location", true).Value<string>().EndsWith(".dzi"));

                            return location.SelectToken("Location").Value<string>();
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

    }
}


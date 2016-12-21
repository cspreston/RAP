module RapApp.Models {
  
    export interface IFileWithBucket {
        Id: string;
        FileName: string;
        FileDescription: string;
        BucketName: string;
        BucketPath: string;
    }
}
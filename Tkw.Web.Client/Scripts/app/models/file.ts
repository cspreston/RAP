module RapApp.Models {
  
    export interface IFileWithBucket {
        Id: string;
        FileName: string;
        FileDescription: string;
        BucketName: string;
        BucketPath: string;
        Url: string;
        FileUrl: string;
        ThumbUrl: string;
        ZoomUrl: string;
        SourceFile: string;
        Dimensions: string;
    }
}
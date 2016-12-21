namespace Common.Independent
{
    public interface IResizeImageService
    {
        void ResizeImageFile(string imagePath, int? width, int? height, bool keepAspectRatio);
    }
}

using Common.Independent;
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;

namespace Common
{
    public class ResizeImageService : IResizeImageService
    {
        public void ResizeImageFile(string imagePath, int? width, int? height, bool keepAspectRatio = true)
        {
            if (!width.HasValue && !height.HasValue)
                return;


            if (!File.Exists(imagePath))
                throw new ArgumentException(nameof(imagePath));

            Image initialImage;
            using (var bitmap = new Bitmap(imagePath))
                initialImage = new Bitmap(bitmap);

            int newWidth = 0, newHeight = 0;
            if (width.HasValue && height.HasValue && !keepAspectRatio)
            {
                if (width > 0)
                {
                    newWidth = width.Value;
                    newHeight = height.Value;
                }

                else {
                    newWidth = initialImage.Width;
                    newHeight = initialImage.Height;
                }
            }
            else
            {
                ResizeImage(out newWidth, out newHeight, initialImage, width.GetValueOrDefault(), height.GetValueOrDefault());
            }

            if (newHeight > 0)
            {
                Image newImage = new Bitmap(newWidth, newHeight);
                using (Graphics graphicsHandle = Graphics.FromImage(newImage))
                {
                    graphicsHandle.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    //set the resize quality modes to high quality
                    graphicsHandle.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                    graphicsHandle.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    graphicsHandle.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    //draw the image into the target bitmap
                    graphicsHandle.DrawImage(initialImage, 0, 0, newWidth, newHeight);
                }
                File.Delete(imagePath);
                newImage.Save(imagePath);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="width">initial width</param>
        /// <param name="height">initial height</param>
        /// <param name="W">New width based on aspect ratio</param>
        /// <param name="H">New width based on height ratio</param>
        private void ResizeImage(out int W, out int H, Image initialImage, int width = 0, int height = 0)
        {
            var aspectRatio = initialImage.Width / (float)initialImage.Height;

            if (height == 0)
            {
                W = width;
                H = (int)(width / aspectRatio);
            }
            else if (width == 0)
            {
                H = height;
                W = (int)(height * aspectRatio);
            }
            else
            {
                float percentWidth = width / (float)initialImage.Width;
                float percentHeight = height / (float)initialImage.Height;
                float percent = percentHeight < percentWidth ? percentHeight : percentWidth;
                W = (int)(initialImage.Width * percent);
                H = (int)(initialImage.Height * percent);
            }
        }
    }
}
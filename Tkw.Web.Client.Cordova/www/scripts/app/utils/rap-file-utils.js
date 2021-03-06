var RapApp;
(function (RapApp) {
    var FileUtils = (function () {
        function FileUtils() {
        }
        FileUtils.getImageUrl = function (bucketPath, bucketName, fileName) {
            //"BucketName": "be6f53b4-40b1-4471-96d1-d57212386123\Building\Images",
            //"BucketPath": "~/Content/Files",
            //"FileName": "thumb4.png",
            if (TKWApp.Configuration.ConfigurationManager.WorkMode === TKWApp.Configuration.WorkMode.ONLINE) {
                // get file from server
                return TKWApp.Configuration.ConfigurationManager.ServerUri + "/" + bucketPath + "/" + this.escapeHtml(bucketName) + "/" + this.escapeHtml(fileName);
            }
            else {
                return (TKWApp.Configuration.ConfigurationManager.LocalUri.replace("\"", '\'') + bucketPath + '/' + this.escapeHtml(bucketName) + '/' + this.escapeHtml(fileName)).replace(" ", "");
            }
        };
        FileUtils.getOnlineHotspotDisplayImage = function (path) {
            if (TKWApp.Configuration.ConfigurationManager.WorkMode === TKWApp.Configuration.WorkMode.ONLINE) {
                // get file from server
                return TKWApp.Configuration.ConfigurationManager.ServerUri + "/Content/Images/Hotspots/" + path;
            }
            else {
                return "Content/Images/Hotspots/" + path;
            }
        };
        FileUtils.getOfflineHotspotDisplayImage = function (path) {
            if (TKWApp.Configuration.ConfigurationManager.WorkMode === TKWApp.Configuration.WorkMode.ONLINE) {
                // get file from server
                return TKWApp.Configuration.ConfigurationManager.ServerUri + "/Content/Images/Hotspots/" + path;
            }
            else {
                return "Content/Images/Hotspots/" + path;
            }
        };
        FileUtils.getHotspotDisplayImage = function (path) {
            if (TKWApp.Configuration.ConfigurationManager.WorkMode == TKWApp.Configuration.WorkMode.ONLINE)
                return FileUtils.getOnlineHotspotDisplayImage(path);
            else
                return FileUtils.getOfflineHotspotDisplayImage(path);
        };
        FileUtils.getFileType = function (path) {
            path = path.toLowerCase();

            if ((new RegExp(".(jpg|png|gif|bmp|jpeg)")).test(path)) {
                return "image";
            }
            if ((new RegExp(".(mp4|ogg)")).test(path)) {
                return "video";
            }
            if ((new RegExp(".(mp3|wav)")).test(path)) {
                return "audio";
            }
            return null;
        };
        FileUtils.getFileTypeCss = function (fileName) {
            fileName = fileName.toLowerCase();
            if ((new RegExp(".(jpg|png|gif|bmp|jpeg")).test(fileName)) {
                return "image";
            }
            if (/\.(pdf|doc|docs|rtf)$/.test(fileName)) {
                return "pdf";
            }
            return "html";
        };
        FileUtils.escapeHtml = function (string) {
            return string.replace("'", "%27").replace("&", "&").replace("<", "%3C").replace(">", "%3E").replace("\"", "%22").replace("?", "%3F");
        };
        return FileUtils;
    })();
    RapApp.FileUtils = FileUtils;
    var CanvasUtils = (function () {
        function CanvasUtils() {
        }
        CanvasUtils.wrapCanvasText = function (t, canvas, maxW, maxH, justify) {
            if (typeof maxH === "undefined") {
                maxH = 0;
            }
            var words = t.text.split(" ");
            var formatted = '';
            // This works only with monospace fonts
            justify = justify || 'left';
            // clear newlines
            var sansBreaks = t.text.replace(/(\r\n|\n|\r)/gm, "");
            // calc line height
            var lineHeight = new fabric.Text(sansBreaks, {
                fontFamily: t.fontFamily,
                fontSize: t.fontSize
            }).height;
            // adjust for vertical offset
            var maxHAdjusted = maxH > 0 ? maxH - lineHeight : 0;
            var context = canvas.getContext("2d");
            context.font = t.fontSize + "px " + t.fontFamily;
            var currentLine = '';
            var breakLineCount = 0;
            var n = 0;
            while (n < words.length) {
                var isNewLine = currentLine == "";
                var testOverlap = currentLine + ' ' + words[n];
                // are we over width?
                var w = context.measureText(testOverlap).width;
                if (w < maxW) {
                    if (currentLine != '')
                        currentLine += ' ';
                    currentLine += words[n];
                }
                else {
                    // if this hits, we got a word that need to be hypenated
                    if (isNewLine) {
                        var wordOverlap = "";
                        // test word length until its over maxW
                        for (var i = 0; i < words[n].length; ++i) {
                            wordOverlap += words[n].charAt(i);
                            var withHypeh = wordOverlap + "-";
                            if (context.measureText(withHypeh).width >= maxW) {
                                // add hyphen when splitting a word
                                withHypeh = wordOverlap.substr(0, wordOverlap.length - 2) + "-";
                                // update current word with remainder
                                words[n] = words[n].substr(wordOverlap.length - 1, words[n].length);
                                formatted += withHypeh; // add hypenated word
                                break;
                            }
                        }
                    }
                    while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
                        currentLine = ' ' + currentLine;
                    while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
                        currentLine = ' ' + currentLine + ' ';
                    formatted += currentLine + '\n';
                    breakLineCount++;
                    currentLine = "";
                    continue; // restart cycle
                }
                if (maxHAdjusted > 0 && (breakLineCount * lineHeight) > maxHAdjusted) {
                    // add ... at the end indicating text was cutoff
                    formatted = formatted.substr(0, formatted.length - 3) + "...\n";
                    currentLine = "";
                    break;
                }
                n++;
            }
            if (currentLine != '') {
                while (justify == 'right' && context.measureText(' ' + currentLine).width < maxW)
                    currentLine = ' ' + currentLine;
                while (justify == 'center' && context.measureText(' ' + currentLine + ' ').width < maxW)
                    currentLine = ' ' + currentLine + ' ';
                formatted += currentLine + '\n';
                breakLineCount++;
                currentLine = "";
            }
            // get rid of empy newline at the end
            formatted = formatted.substr(0, formatted.length - 1);
            var ret = new fabric.Text(formatted, {
                left: t.left,
                top: t.top,
                fill: t.fill,
                fontFamily: t.fontFamily,
                fontSize: t.fontSize,
                originX: t.originX,
                originY: t.originY,
                angle: t.angle,
            });
            return ret;
        };
        return CanvasUtils;
    })();
    RapApp.CanvasUtils = CanvasUtils;
})(RapApp || (RapApp = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TKWApp;
(function (TKWApp) {
    var Services;
    (function (Services) {
        /// Operation progress class - simply provides events for progress/done/error/etc
        var OperationProgress = (function (_super) {
            __extends(OperationProgress, _super);
            function OperationProgress() {
                _super.call(this);
            }
            OperationProgress.prototype.started = function (func) {
                this.attachEvent("onstarted", func);
            };
            OperationProgress.prototype.progress = function (func) {
                this.attachEvent("onprogress", func);
            };
            OperationProgress.prototype.finished = function (func) {
                this.attachEvent("onfinished", func);
            };
            OperationProgress.prototype.error = function (func) {
                this.attachEvent("onerror", func);
            };
            OperationProgress.prototype.setProgress = function (percent) {
                this.fireEvent("onprogress", [percent]);
            };
            OperationProgress.prototype.setStarted = function () {
                this.fireEvent("onstarted");
            };
            OperationProgress.prototype.setFinished = function (response) {
                this.fireEvent("onfinished", response);
            };
            OperationProgress.prototype.setError = function (error) {
                this.fireEvent("onerror", [error]);
            };
            return OperationProgress;
        })(TKWApp.Observable);
        Services.OperationProgress = OperationProgress;
        /// Contains functionality related to file uploads
        /// We can register and manage file uploads, and upload their files to the server
        var FileUploader = (function () {
            function FileUploader() {
                this.uploaders = new Array();
                this.files = new Array();
            }
            /// registers an upload element to the manager
            FileUploader.prototype.registerUploader = function (elem) {
                this.uploaders.push(elem);
                // add already existing files
                for (var i = 0; elem.files && i < elem.files.length; i++) {
                    this.files.push(this.files[i]);
                }
                var self = this;
                var changeEvent = function () {
                    self.fileUploaderChange.call(self);
                };
                elem.addEventListener('change', changeEvent, false);
                elem.myCustomEvent = changeEvent;
            };
            /// this will be alled whenever the file upload element selection changes
            FileUploader.prototype.fileUploaderChange = function () {
                //alert("changed");
                this.refreshFiles();
                if (this.filesChanged)
                    this.filesChanged();
            };
            /// unregisters an upload element to the manager
            FileUploader.prototype.unregisterUploader = function (elem) {
                if (elem.myCustomEvent)
                    elem.removeEventListener("change", elem.myCustomEvent, false);
                var index = this.uploaders.indexOf(elem);
                if (index >= 0) {
                    this.uploaders.splice(index, 1);
                    this.refreshFiles();
                }
            };
            /// refreshes all files in the upload elements
            FileUploader.prototype.refreshFiles = function () {
                var files = this.files;
                files.splice(0, files.length);
                for (var i = 0; i < this.uploaders.length; i++) {
                    var uploader = this.uploaders[i];
                    for (var j = 0; j < uploader.files.length; j++) {
                        uploader.files[j].id = j;
                        files.push(uploader.files[j]);
                        this.previewInImage(uploader.files[j].id, document.getElementById("myImage"));
                    }
                }
            };
            FileUploader.prototype.previewInCanvas = function (fileId, canvas) {
            };
            ///shows the file with the specified id into an image element
            FileUploader.prototype.previewInImage = function (fileId, img) {
                // find file
                var file = null;
                var idx = 0;
                for (var i = 0; i < this.files.length; i++) {
                    if (this.files[i].id === fileId) {
                        file = this.files[i];
                        idx = i;
                        break;
                    }
                }
                if (!file)
                    return;
                if (!img)
                    return;
                if (idx > 0) {
                    var reader = new FileReader();
                    var t = document.getElementById(img.id + "_" + fileId + "_" + idx);
                    if (!t) {
                        t = $(img).clone().prop({ id: img.id + "_" + fileId + "_" + idx }).appendTo(img.parentElement);
                    }
                    reader.onload = function (e) {
                        $(t).attr("src", e.target.result);
                        t.src = e.target.result;
                        var imgFake = new Image();
                        imgFake.onload = function () {
                            var divS = $("#div" + img.id + "_" + fileId + "_" + idx);
                            if (divS.length > 0)
                                $(divS).remove();
                            var htmlChild = "<div id=div" + img.id + "_" + fileId + "_" + idx + " style='font-size:14px;'> Original size: ";
                            htmlChild += imgFake.naturalWidth + "(W)x";
                            htmlChild += imgFake.naturalHeight + "(H)</div>";
                            $(t).after(htmlChild);
                        };
                        imgFake.src = $(t).attr('src');
                    };
                    $(t).show();
                    reader.readAsDataURL(file);
                }
                else {
                    var reader = new FileReader();
                    // Using FileReader to display the image content 
                    reader.onload = function (e) {
                        img.src = e.target.result;
                        var divS = $("#div" + img.id + "_" + fileId);
                        if (divS.length > 0)
                            $(divS).remove();
                        var htmlChild = "<div id=div" + img.id + "_" + fileId + " style='font-size:14px;'> Original size: ";
                        htmlChild += img.naturalWidth + "(W)X";
                        htmlChild += img.naturalHeight + "(H) </div>";
                        $(img).after(htmlChild);
                    };
                    $(img).show();
                    reader.readAsDataURL(file);
                }
            };
            /// removes all preview images sources
            FileUploader.prototype.clearImagePreview = function (elem, img) {
                $(elem).val("");
                var imgs = img.parentElement.getElementsByTagName('img');
                for (var i = 0; i < imgs.length; i++) {
                    $(imgs[i]).hide();
                    imgs[i].src = null;
                }
                $(img.parentElement).find('div').remove();
            };
            /// uploads the specified file to the specifier url, with the specified options
            /// options normally contain the DTO properties to be sent along with the file
            FileUploader.prototype.uploadFile = function (file, url, options) {
                var xhr = new XMLHttpRequest();
                var fd = new FormData();
                xhr.open("POST", url, true);
                xhr.setRequestHeader("Authorization", "Bearer " + TKWApp.Data.AuthenticationManager.AuthenticationToken.Token);
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("enctype", "multipart/form-data");
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        // Every thing ok, file uploaded
                        console.log(xhr.responseText); // handle response.
                    }
                };
                fd.append("upload_file", file);
                if (options) {
                    for (var k in options) {
                        fd.append(k, options[k]);
                    }
                }
                // add event listeners to pass along to the operaiton progres object
                var progress = new OperationProgress();
                xhr.addEventListener("progress", function (oEvent) {
                    if (oEvent.lengthComputable) {
                        var percentComplete = oEvent.loaded / oEvent.total;
                        progress.setProgress(percentComplete);
                    }
                    else {
                    }
                });
                xhr.addEventListener("load", function (oEvent) {
                    progress.setFinished(xhr.response);
                });
                xhr.addEventListener("error", function () {
                    progress.setError("Error uploading the file.");
                });
                xhr.addEventListener("abort", function () {
                    progress.setError("Operation aborted.");
                });
                xhr.send(fd);
                return progress;
            };
            FileUploader.prototype.removeFile = function (url) {
                var options = Object.create(TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions);
                options.method = "DELETE";
                var ajaxResult = jQuery.ajax(url, options);
                var xhr = new TKWApp.Data.DataStorePromissForJquery(ajaxResult);
            };
            return FileUploader;
        })();
        Services.FileUploader = FileUploader;
    })(Services = TKWApp.Services || (TKWApp.Services = {}));
})(TKWApp || (TKWApp = {}));
//# sourceMappingURL=file-uploader.js.map
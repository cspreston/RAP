module TKWApp.Services {
    /// Operation progress class - simply provides events for progress/done/error/etc
    export class OperationProgress extends Observable {
        constructor() {
            super();
        }

        started(func: Function) {
            this.attachEvent("onstarted", func);
        }

        progress(func: Function) {
            this.attachEvent("onprogress", func);
        }

        finished(func: Function) {
            this.attachEvent("onfinished", func);
        }

        error(func: Function) {
            this.attachEvent("onerror", func);
        }

        setProgress(percent: number) {
            this.fireEvent("onprogress", [percent]);
        }
        setStarted() {
            this.fireEvent("onstarted");
        }
        setFinished(response: any) {
            this.fireEvent("onfinished", response);
        }
        setError(error: any) {
            this.fireEvent("onerror", [error]);
        }
    }
    /// Contains functionality related to file uploads
    /// We can register and manage file uploads, and upload their files to the server
    export class FileUploader {
        public uploaders: Array<HTMLInputElement> = new Array<HTMLInputElement>();
        public files: Array<File> = new Array<File>();
        public filesChanged: Function;
        constructor() {
        }
        /// registers an upload element to the manager
        registerUploader(elem: HTMLInputElement) {
            this.uploaders.push(elem); 
            // add already existing files
            for (var i = 0; elem.files && i < elem.files.length; i++) {
                this.files.push(this.files[i]);
            }
            var self = this;

            var changeEvent = () => {
                self.fileUploaderChange.call(self);
            };
            elem.addEventListener('change', changeEvent, false);
            (<any>elem).myCustomEvent = changeEvent;
        }
        /// this will be alled whenever the file upload element selection changes
        private fileUploaderChange() {
            //alert("changed");
            this.refreshFiles();
            if (this.filesChanged)
                this.filesChanged();
        }
        /// unregisters an upload element to the manager
        unregisterUploader(elem: HTMLInputElement) {
            if ((<any>elem).myCustomEvent)
                elem.removeEventListener("change", (<any>elem).myCustomEvent, false);
            var index: number = this.uploaders.indexOf(elem);
            if (index >= 0) {
                this.uploaders.splice(index, 1);
                this.refreshFiles();
            }

        }
        /// refreshes all files in the upload elements
        refreshFiles() {
            var files: Array<File> = this.files;
            files.splice(0, files.length);
            for (var i = 0; i < this.uploaders.length; i++) {
                var uploader: HTMLInputElement = this.uploaders[i];
                for (var j = 0; j < uploader.files.length; j++) {
                    (<any>uploader.files[j]).id = j;
                    files.push(uploader.files[j]);
                    this.previewInImage((<any>uploader.files[j]).id, <HTMLImageElement>document.getElementById("myImage"));
                }
            }
        }
        previewInCanvas(fileId: number, canvas: HTMLCanvasElement) {
        }
        ///shows the file with the specified id into an image element
        previewInImage(fileId: number, img: HTMLImageElement) {
            // find file
            var file: File = null;
            var idx = 0;
            for (var i = 0; i < this.files.length; i++) {
                if ((<any>this.files[i]).id === fileId) {
                    file = this.files[i];
                    idx = i;
                    break;
                }
            }
            if (!file) return;
            if (!img) return;
            if (idx > 0) {
                var reader = new FileReader();
                var t: any = document.getElementById(img.id + "_" + fileId + "_" + idx);
                if (!t) {
                    t = $(img).clone().prop({ id: img.id + "_" + fileId + "_" + idx }).appendTo(img.parentElement);
                }
                reader.onload = (e: any) => {
                    $(t).attr("src", e.target.result);
                    t.src = e.target.result;
                    var imgFake= new Image();
                    imgFake.onload = function () {
                        var divS = $("#div" + img.id + "_" + fileId + "_" + idx);
                        if (divS.length > 0)
                            $(divS).remove();

                        var htmlChild = "<div id=div" + img.id + "_" + fileId + "_" + idx + " style='font-size:14px;'> Original size: ";
                        htmlChild += imgFake.naturalWidth + "(W)x";
                        htmlChild += imgFake.naturalHeight + "(H)</div>";
                        $(t).after(htmlChild);

                    }
                    imgFake.src = $(t).attr('src');
                };
                $(t).show();
                reader.readAsDataURL(file);
            }
            else {
                var reader = new FileReader();
                // Using FileReader to display the image content 
                reader.onload = (e: any) => {
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
        }

        /// removes all preview images sources
        clearImagePreview(elem: HTMLInputElement, img: HTMLImageElement) {
            $(elem).val("");
            var imgs = img.parentElement.getElementsByTagName('img');
            for (var i = 0; i < imgs.length; i++) {
                $(imgs[i]).hide();
                imgs[i].src = null;
            }
            $(img.parentElement).find('div').remove();
        }
        /// uploads the specified file to the specifier url, with the specified options
        /// options normally contain the DTO properties to be sent along with the file
        uploadFile(file: File, url: string, options: any): OperationProgress {
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

            xhr.addEventListener("progress", (oEvent: ProgressEvent) => {

                if (oEvent.lengthComputable) {
                    var percentComplete = oEvent.loaded / oEvent.total;
                    progress.setProgress(percentComplete);
                } else {
                    // Unable to compute progress information since the total size is unknown
                }
            });
            xhr.addEventListener("load", (oEvent: ProgressEvent) => {
                progress.setFinished(xhr.response);
            });
            xhr.addEventListener("error", () => {
                progress.setError("Error uploading the file.");
            });
            xhr.addEventListener("abort", () => {
                progress.setError("Operation aborted.");
            });


            xhr.send(fd);
            return progress;
        }

        removeFile(url: string) {
            var options: any = Object.create(TKWApp.Data.JQueryAjaxODATAAdater.defaultOptions);
            options.method = "DELETE";
            var ajaxResult = jQuery.ajax(url, options);
            var xhr = new TKWApp.Data.DataStorePromissForJquery(ajaxResult);
        }
    }
}
function highlightImage(target) {
    var find = $(target).attr("data-number")
    var imgNew = new Image();
    imgNew.src = $("div[data-number = '" + find + "']").css('background-image').replace('url', '').replace('(', '').replace(')', '').replace('"', '').replace('"', '');

    var rectObject = target.getBoundingClientRect();
    // var create a new image at the initial position
    var img = new Image();
    var pos = {
        left: rectObject.left + (rectObject.right - rectObject.left) / 2,
        top: rectObject.top + (rectObject.bottom - rectObject.top) / 2
    }
    var originalCss = { border: "0px none transparent", outline: "0px solid transparent", position: "absolute", left: pos.left + "px", top: pos.top + "px", width: "0px", "z-index": 65000 };
    $(img).css(originalCss);

    var finalCss = {
        height: "auto"
    };
    if (imgNew.height < 800) {
        finalCss.width = imgNew.width + "px";
        finalCss.top = window.innerHeight / 2 - imgNew.height / 2 + $(window).scrollTop() + "px"
        finalCss.left = window.innerWidth / 2 - imgNew.width / 2 + "px"

    } else {
        finalCss.width = window.innerWidth / 2 + "px";
        finalCss.top = 100 + $(window).scrollTop() + "px";
        finalCss.left = window.innerWidth / 4 + "px";
    }
    var div = document.createElement("DIV");
    $(div).addClass("highlight-image-back");

    img.src = $(target).attr("src");
    $("body").append(div);
    $("body").append(img);
    $(img).animate(finalCss, 200, null);
    $(div).click(function () {
        $(img).animate(originalCss, 200, function () {
            $(div).remove();
            $(img).remove();
        });

    });
    $(img).click(function () {
        $(img).animate(originalCss, 200, function () {
            $(div).remove();
            $(img).remove();
        });
    });
}

function highlightFile(target) {

    // var create a new image at the initial position
    var a = document.createElement("A");


    var finalCss = {
        width: window.innerWidth / 2 + "px",
        height: "auto",
        top: 100 + $(window).scrollTop() + "px",
        left: window.innerWidth / 4 + "px"
    };
    var div = document.createElement("DIV");
    $(div).addClass("highlight-image-back");

    $(a).attr("href");
    a.href = $(target).attr("href");
    $("body").append(div);
    $(div).append(a);
    $(a).animate(finalCss, 200, null);
    $(div).click(function () {
        $(a).animate(originalCss, 200, function () {
            $(div).remove();
            $(a).remove();
        });

    });
    $(a).click(function () {
        $(a).animate(originalCss, 200, function () {
            $(div).remove();
            $(a).remove();
        });
    });
}


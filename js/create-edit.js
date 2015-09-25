$(document).ready(function() {
    /** Set the hidden image_id input to the id of the image selected **/
    $('.js-media-add').on('use_image.mediamanager', function(e, data) {
        var uploadedImgId = data.img[0].id;
        var imageInput = $("input[type=hidden]#image_id");

        imageInput.val(uploadedImgId);
    });

    $('.js-colour-picker').colorPicker();
});
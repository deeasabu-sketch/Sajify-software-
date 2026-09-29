$(document).ready(function () {

    $(".delete-product").click(function () {

        const button = $(this);

        const rowId = button.closest("tr").attr("id");

        const url = button.data("url");

        Swal.fire({
            title: "Delete Product?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, Delete"
        }).then((result) => {

            if (result.isConfirmed) {

                $.ajax({

                    url: url,
                    type: "POST",

                    success: function (response) {

                        if (response.success) {

                            $("#" + rowId).fadeOut(400, function () {

                                $(this).remove();

                            });

                            Swal.fire({
                                icon: "success",
                                title: "Deleted",
                                text: response.message,
                                timer: 1500,
                                showConfirmButton: false
                            });

                        }

                    },

                    error: function () {

                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Unable to delete product."
                        });

                    }

                });

            }

        });

    });

});
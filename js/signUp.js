
$(document).ready(function () {
    $('#contact_form').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            user_name: {
                validators: {
                    notEmpty: {
                        message: 'Please enter your Username'
                    }
                }
            },
            user_password: {
                validators: {
                    stringLength: {
                        min: 8,
                        message: 'The password must be at least 8'
                    },
                    notEmpty: {
                        message: 'Please enter your Password'
                    },
                    regexp: {
                        regexp: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
                        message: 'The username can only consist of alphabetical and number'
                    },
                    identical: {
                        field: 'confirm_password',
                        message: 'The password and its confirm are not the same'
                    }
                }
            },
            confirm_password: {
                validators: {
                    stringLength: {
                        min: 8,
                        message: 'The password must be at least 8'
                    },
                    notEmpty: {
                        message: 'Please confirm your Password'
                    },
                    regexp: {
                        regexp: /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/,
                        message: 'The username can only consist of alphabetical and number'
                    },
                    identical: {
                        field: 'user_password',
                        message: 'The password and its confirm are not the same'
                    }
                }
            },
            first_name: {
                validators: {
                    notEmpty: {
                        message: 'Please enter your First Name'
                    },
                    regexp: {
                        regexp: /^[^0-9]*$/,
                        message: 'The first name can not consist number'
                    }
                }
            },
            last_name: {
                validators: {
                    notEmpty: {
                        message: 'Please enter your Last Name'
                    },
                    regexp: {
                        regexp: /^[^0-9]*$/,
                        message: 'The last name can not consist number'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'Please enter your Email Address'
                    },
                    emailAddress: {
                        message: 'Please enter a valid Email Address'
                    }
                }
            },
            birthday: {
                validators: {
                    notEmpty: {
                        message: 'Please select your birthday'
                    }
                }
            },
        }
    })
        .on('success.form.bv', function (e) {
            $('#success_message').slideDown({ opacity: "show" }, "slow") // Do something ...
            $('#contact_form').data('bootstrapValidator').resetForm();

            // Prevent form submission
            e.preventDefault();

            // Get the form instance
            var $form = $(e.target);

            // Get the BootstrapValidator instance
            var bv = $form.data('bootstrapValidator');

            // Use Ajax to submit form data
            $.post($form.attr('action'), $form.serialize(), function (result) {
                console.log(result);
            }, 'json');
        });
});
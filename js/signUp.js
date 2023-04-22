$(document).ready(function () {
    $('#contact_form').bootstrapValidator({
        // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        submitHandler: function (validator, form, submitButton) {
            // $('#success_message').slideDown({ opacity: "show" }, "slow") // Do something ...
            $('#contact_form').data('bootstrapValidator').resetForm();

            var bv = form.data('bootstrapValidator');
            saveInfo(bv);
            document.getElementById("contact_form").reset();
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
});

function saveInfo(bv) {
    //save the user's information to array
    var user = bv.getFieldElements('user_name').val();
    var pass = bv.getFieldElements('user_password').val();
    var firstName = bv.getFieldElements('first_name').val();
    var lastName = bv.getFieldElements('last_name').val();
    var email = bv.getFieldElements('email').val();
    var birthday = bv.getFieldElements('birthday').val();
    users.push({ user_name: user, user_password: pass, first_name: firstName, last_name: lastName, email: email, birthday: birthday });
    switchScreen("login");
}

function logInUser(formData) {
    //check if the user's information is in the array
    var user = formData.get('userName');
    var pass = formData.get('passWord');
    for (var i = 0; i < users.length; i++) {
        if (user == users[i].user_name && pass == users[i].user_password) {
            document.getElementById("error-message hidden").innerHTML = "";
            currentUser = users[i];
            logInFormObj.reset();
            $('#userLogout').toggle(false);
            $('#userLogin').toggle(true);
            switchScreen("configuration");
            return;
        }
    }
    document.getElementById("error-message hidden").innerHTML = "Log in failed! Please check your username and password";
}
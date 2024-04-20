const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signin = function(username, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
        const data = JSON.stringify({username, password });
        //
        // B. Sending the AJAX request to the server
        //
        fetch("/sign-in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: data
        })

        //
        // F. Processing any error returned by the server
        //
            .then((res) => {
                return res.json()
            })
            .then((json) => {
                if (json.status === "error") {
                    if (onError) {
                        onError(json.error);
                    }
                }
                //
                // H. Handling the success response from the server
                //
                else if (json.status === "success") {
                    user = json.user;
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            })

    };

    // This function sends a validate request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const validate = function(onSuccess, onError) {

        //
        // A. Sending the AJAX request to the server
        //
        fetch("/validate", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })
        //
        // C. Processing any error returned by the server
        //
            .then((res) => {
                return res.json()
            })
            .then((json) => {
                if (json.status === "error") {
                    if (onError) {
                        onError(json.error);
                    }
                }
                //
                // H. Handling the success response from the server
                //
                else if (json.status === "success") {
                    user = json.user;
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            })
        //
        // E. Handling the success response from the server
        //

        // Delete when appropriate
        // if (onError) onError("This function is not yet implemented.");
    };

    // This function sends a sign-out request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signout = function(onSuccess, onError) {
        fetch("/sign-out", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        })

        .then((res) => {
            return res.json()
        })
        .then((json) => {
            if (json.status === "error") {
                if (onError) {
                    onError(json.error);
                }
            }
            //
            // H. Handling the success response from the server
            //
            else if (json.status === "success") {
                user = null;
                if (onSuccess) {
                    onSuccess();
                }
            }
        })
        // Delete when appropriate
        // if (onError) onError("This function is not yet implemented.");
    };

    return { getUser, signin, validate, signout };
})();

const Registration = (function() {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function(username, password, onSuccess, onError) {
        //
        // A. Preparing the user data
        //
        const data = JSON.stringify({ username, password });
        //
        // B. Sending the AJAX request to the server
        //
        fetch("/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: data
        })  // this is promise instance
            .then((res) => {
                return res.json()
            })
            .then((json) => {
                if (json.status === "error") {
                    if (onError) {
                        onError(json.error);
                    }
                }
                if (json.status === "success") {
                    if (onSuccess) {
                        onSuccess();
                    }
                }
            })

        //
        // F. Processing any error returned by the server
        //

        //
        // J. Handling the success response from the server
        //
 
        // Delete when appropriate
        // if (onError) onError("This function is not yet implemented.");
    };

    return { register };
})();

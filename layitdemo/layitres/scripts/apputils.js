


function isValid(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

function isPositiveInteger(str) {
    if (typeof str !== 'string') {
        return false;
    }

    const num = Number(str);

    if (Number.isInteger(num) && num > 0) {
        return true;
    }

    return false;
}


function notNull(value) {
    return value !== null && value !== undefined;
}

function isNull(value) {
    return !notNull(value);
}

function parseBoolean(value) {
    if (value === true || value === 'true')
        return true;
    else
        return false;
}


module.exports = { notNull, isNull, parseBoolean };
exports.formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};

exports.generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};
